import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import * as cron from 'node-cron';
import { PrismaService } from '../../prisma/prisma.service';
import { ServersService } from '../servers/servers.service';
import { BackupsService } from '../backups/backups.service';
import { CreateScheduleDto, UpdateScheduleDto, ScheduleDto } from '@server-manager/shared';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private readonly tasks = new Map<number, cron.ScheduledTask>();
  private readonly runningJobs = new Set<number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly serversService: ServersService,
    private readonly backupsService: BackupsService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.loadSchedules();
  }

  onModuleDestroy(): void {
    for (const task of this.tasks.values()) {
      task.stop();
    }
  }

  private async loadSchedules(): Promise<void> {
    const schedules = await this.prisma.schedule.findMany({
      where: { enabled: true },
    });

    for (const schedule of schedules) {
      this.registerTask(schedule.id, schedule.cronExpression, schedule.type, schedule.serverId);
    }

    this.logger.log(`Loaded ${schedules.length} scheduled tasks`);
  }

  async findAll(serverId: number): Promise<ScheduleDto[]> {
    const schedules = await this.prisma.schedule.findMany({
      where: { serverId },
      orderBy: { createdAt: 'desc' },
    });
    return schedules.map((s) => this.toDto(s));
  }

  async create(dto: CreateScheduleDto): Promise<ScheduleDto> {
    if (!cron.validate(dto.cronExpression)) {
      throw new BadRequestException(`Invalid cron expression: ${dto.cronExpression}`);
    }

    const schedule = await this.prisma.schedule.create({
      data: {
        serverId: dto.serverId,
        type: dto.type,
        cronExpression: dto.cronExpression,
        enabled: dto.enabled,
        payload: dto.payload ?? null,
      },
    });

    if (schedule.enabled) {
      this.registerTask(schedule.id, schedule.cronExpression, schedule.type, schedule.serverId);
    }

    return this.toDto(schedule);
  }

  async update(id: number, dto: UpdateScheduleDto): Promise<ScheduleDto> {
    const existing = await this.prisma.schedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Schedule ${id} not found`);

    if (dto.cronExpression && !cron.validate(dto.cronExpression)) {
      throw new BadRequestException(`Invalid cron expression: ${dto.cronExpression}`);
    }

    const schedule = await this.prisma.schedule.update({ where: { id }, data: dto });

    this.unregisterTask(id);
    if (schedule.enabled) {
      this.registerTask(schedule.id, schedule.cronExpression, schedule.type, schedule.serverId);
    }

    return this.toDto(schedule);
  }

  async delete(id: number): Promise<void> {
    this.unregisterTask(id);
    await this.prisma.schedule.delete({ where: { id } });
  }

  private registerTask(scheduleId: number, cronExpression: string, type: string, serverId: number): void {
    const task = cron.schedule(cronExpression, async () => {
      if (this.runningJobs.has(serverId)) {
        this.logger.warn(`Skipping job for server ${serverId}: another job is already running`);
        return;
      }

      this.runningJobs.add(serverId);
      try {
        await this.executeJob(type, serverId);
        await this.prisma.schedule.update({
          where: { id: scheduleId },
          data: { lastRunAt: new Date() },
        });
      } catch (err) {
        this.logger.error(`Scheduled job failed for server ${serverId}: ${err}`);
      } finally {
        this.runningJobs.delete(serverId);
      }
    });

    this.tasks.set(scheduleId, task);
  }

  private unregisterTask(scheduleId: number): void {
    const task = this.tasks.get(scheduleId);
    if (task) {
      task.stop();
      this.tasks.delete(scheduleId);
    }
  }

  private async executeJob(type: string, serverId: number): Promise<void> {
    this.logger.log(`Executing ${type} job for server ${serverId}`);

    switch (type) {
      case 'restart':
        await this.serversService.restartServer(serverId);
        break;
      case 'backup':
        await this.backupsService.createBackup(serverId);
        break;
      case 'update':
        await this.serversService.updateServer(serverId);
        break;
      case 'health_check':
        this.logger.log(`Health check for server ${serverId}`);
        break;
      default:
        this.logger.warn(`Unknown job type: ${type}`);
    }
  }

  private toDto(schedule: any): ScheduleDto {
    return {
      id: schedule.id,
      serverId: schedule.serverId,
      type: schedule.type,
      cronExpression: schedule.cronExpression,
      enabled: schedule.enabled,
      payload: schedule.payload,
      lastRunAt: schedule.lastRunAt?.toISOString() ?? null,
      nextRunAt: schedule.nextRunAt?.toISOString() ?? null,
      createdAt: schedule.createdAt.toISOString(),
    };
  }
}
