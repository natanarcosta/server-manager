import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GamesService } from '../games/games.service';
import { ConfigSchema } from '@server-manager/shared';

@Injectable()
export class ConfigsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => GamesService))
    private readonly gamesService: GamesService,
  ) {}

  async getConfig(serverId: number): Promise<{ schema: ConfigSchema; values: Record<string, any> }> {
    const server = await this.prisma.server.findUnique({ where: { id: serverId } });
    if (!server) throw new NotFoundException(`Server ${serverId} not found`);

    const provider = this.gamesService.getProvider(server);
    const schema = provider.getConfigSchema();

    try {
      const values = await provider.readConfig();
      return { schema, values };
    } catch {
      return { schema, values: {} };
    }
  }

  async updateConfig(serverId: number, data: Record<string, any>): Promise<void> {
    const server = await this.prisma.server.findUnique({ where: { id: serverId } });
    if (!server) throw new NotFoundException(`Server ${serverId} not found`);

    const provider = this.gamesService.getProvider(server);
    await provider.writeConfig(data);
  }
}
