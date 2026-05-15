import { GameServerStatus, ConfigSchema } from '@server-manager/shared';
import { GameProvider, GameDefinition } from '../../shared/types/game-provider.interface';
import { ProcessManagerService } from '../servers/process-manager.service';
import { FilesystemService } from '../../shared/filesystem/filesystem.service';
import { SteamcmdService } from '../steamcmd/steamcmd.service';
import { BackupsService } from '../backups/backups.service';
import { LogsService } from '../logs/logs.service';
import { Server } from '@prisma/client';

export abstract class BaseGameProvider implements GameProvider {
  constructor(
    protected readonly server: Server,
    protected readonly definition: GameDefinition,
    protected readonly processManager: ProcessManagerService,
    protected readonly filesystem: FilesystemService,
    protected readonly steamcmd: SteamcmdService,
    protected readonly backupsService: BackupsService,
    protected readonly logsService: LogsService,
  ) {}

  async start(): Promise<void> {
    const exePath = this.server.exePath;
    const args = this.definition.defaultArgs;
    await this.processManager.startProcess(this.server.id, exePath, args, this.server.path);
  }

  async stop(): Promise<void> {
    await this.processManager.stopProcess(this.server.id);
  }

  async restart(): Promise<void> {
    await this.stop();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await this.start();
  }

  async kill(): Promise<void> {
    await this.processManager.killProcess(this.server.id);
  }

  async update(): Promise<void> {
    await this.steamcmd.updateApp(this.server.steamAppId, this.server.path);
  }

  async backup(): Promise<void> {
    await this.backupsService.createBackup(this.server.id);
  }

  abstract queryStatus(): Promise<GameServerStatus>;
  abstract readConfig(): Promise<Record<string, any>>;
  abstract writeConfig(data: Record<string, any>): Promise<void>;
  abstract getConfigSchema(): ConfigSchema;

  async getLogs(): Promise<string[]> {
    return this.logsService.getServerLogs(this.server.id);
  }
}
