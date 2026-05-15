import { Injectable, NotFoundException, BadRequestException, Logger, Inject, forwardRef } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { ProcessManagerService } from './process-manager.service';
import { GamesService } from '../games/games.service';
import { ServerStatus, INTERNAL_EVENTS, CreateServerDto, UpdateServerDto, ServerDto } from '@server-manager/shared';
import { Server } from '@prisma/client';

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);
  private readonly serverStatuses = new Map<number, ServerStatus>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly processManager: ProcessManagerService,
    @Inject(forwardRef(() => GamesService))
    private readonly gamesService: GamesService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.reconcileState();
  }

  private async reconcileState(): Promise<void> {
    const servers = await this.prisma.server.findMany();
    for (const server of servers) {
      const isRunning = this.processManager.isRunning(server.id);
      const status: ServerStatus = isRunning ? 'online' : 'offline';
      this.serverStatuses.set(server.id, status);
      await this.prisma.server.update({
        where: { id: server.id },
        data: { status },
      });
    }
    this.logger.log(`Reconciled state for ${servers.length} servers`);
  }

  async findAll(): Promise<ServerDto[]> {
    const servers = await this.prisma.server.findMany();
    return servers.map((s) => this.toDto(s));
  }

  async findOne(id: number): Promise<ServerDto> {
    const server = await this.prisma.server.findUnique({ where: { id } });
    if (!server) throw new NotFoundException(`Server ${id} not found`);
    return this.toDto(server);
  }

  async create(dto: CreateServerDto): Promise<ServerDto> {
    const server = await this.prisma.server.create({ data: { ...dto, status: 'offline' } });
    this.serverStatuses.set(server.id, 'offline');
    return this.toDto(server);
  }

  async update(id: number, dto: UpdateServerDto): Promise<ServerDto> {
    await this.findOne(id);
    const server = await this.prisma.server.update({ where: { id }, data: dto });
    return this.toDto(server);
  }

  async delete(id: number): Promise<void> {
    await this.findOne(id);
    if (this.processManager.isRunning(id)) {
      await this.processManager.killProcess(id);
    }
    await this.prisma.server.delete({ where: { id } });
    this.serverStatuses.delete(id);
  }

  async startServer(id: number): Promise<void> {
    const server = await this.getServer(id);
    const currentStatus = this.serverStatuses.get(id);
    if (currentStatus === 'online' || currentStatus === 'starting') {
      throw new BadRequestException(`Server ${id} is already ${currentStatus}`);
    }

    await this.setStatus(id, 'starting');
    const provider = this.gamesService.getProvider(server);
    await provider.start();
  }

  async stopServer(id: number): Promise<void> {
    const server = await this.getServer(id);
    const currentStatus = this.serverStatuses.get(id);
    if (currentStatus === 'offline' || currentStatus === 'stopping') {
      throw new BadRequestException(`Server ${id} is already ${currentStatus}`);
    }

    await this.setStatus(id, 'stopping');
    const provider = this.gamesService.getProvider(server);
    await provider.stop();
  }

  async restartServer(id: number): Promise<void> {
    const server = await this.getServer(id);
    await this.setStatus(id, 'stopping');
    const provider = this.gamesService.getProvider(server);
    await provider.restart();
  }

  async killServer(id: number): Promise<void> {
    const server = await this.getServer(id);
    const provider = this.gamesService.getProvider(server);
    await provider.kill();
    await this.setStatus(id, 'offline');
  }

  async updateServer(id: number): Promise<void> {
    const server = await this.getServer(id);
    await this.setStatus(id, 'updating');
    const provider = this.gamesService.getProvider(server);
    await provider.update();
    await this.prisma.server.update({
      where: { id },
      data: { lastUpdateAt: new Date() },
    });
    await this.setStatus(id, 'offline');
  }

  getStatus(id: number): ServerStatus {
    return this.serverStatuses.get(id) || 'offline';
  }

  @OnEvent(INTERNAL_EVENTS.SERVER_STARTED)
  async handleServerStarted(payload: { serverId: number }): Promise<void> {
    await this.setStatus(payload.serverId, 'online');
    await this.prisma.server.update({
      where: { id: payload.serverId },
      data: { lastStartAt: new Date() },
    });
  }

  @OnEvent(INTERNAL_EVENTS.SERVER_STOPPED)
  async handleServerStopped(payload: { serverId: number }): Promise<void> {
    await this.setStatus(payload.serverId, 'offline');
  }

  @OnEvent(INTERNAL_EVENTS.SERVER_CRASHED)
  async handleServerCrashed(payload: { serverId: number }): Promise<void> {
    await this.setStatus(payload.serverId, 'crashed');
    await this.prisma.server.update({
      where: { id: payload.serverId },
      data: { lastCrashAt: new Date() },
    });
  }

  private async getServer(id: number): Promise<Server> {
    const server = await this.prisma.server.findUnique({ where: { id } });
    if (!server) throw new NotFoundException(`Server ${id} not found`);
    return server;
  }

  private async setStatus(id: number, status: ServerStatus): Promise<void> {
    this.serverStatuses.set(id, status);
    await this.prisma.server.update({ where: { id }, data: { status } });
    this.eventEmitter.emit('server.status.changed', { serverId: id, status });
  }

  private toDto(server: Server): ServerDto {
    return {
      id: server.id,
      name: server.name,
      game: server.game,
      status: (this.serverStatuses.get(server.id) || server.status) as ServerStatus,
      path: server.path,
      exePath: server.exePath,
      configPath: server.configPath,
      savePath: server.savePath,
      steamAppId: server.steamAppId,
      queryPort: server.queryPort,
      gamePort: server.gamePort,
      lastStartAt: server.lastStartAt?.toISOString() ?? null,
      lastCrashAt: server.lastCrashAt?.toISOString() ?? null,
      lastBackupAt: server.lastBackupAt?.toISOString() ?? null,
      lastUpdateAt: server.lastUpdateAt?.toISOString() ?? null,
      createdAt: server.createdAt.toISOString(),
      updatedAt: server.updatedAt.toISOString(),
    };
  }
}
