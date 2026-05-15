import { GameServerStatus, ConfigSchema } from '@server-manager/shared';
import { GameDefinition } from '../../../shared/types/game-provider.interface';
import { BaseGameProvider } from '../base-game.provider';
import { PalworldConfigSchema } from './palworld.config-schema';
import { PalworldConfigAdapter } from './palworld.config-adapter';
import { ProcessManagerService } from '../../servers/process-manager.service';
import { FilesystemService } from '../../../shared/filesystem/filesystem.service';
import { SteamcmdService } from '../../steamcmd/steamcmd.service';
import { BackupsService } from '../../backups/backups.service';
import { LogsService } from '../../logs/logs.service';
import { Server } from '@prisma/client';

export const PalworldDefinition: GameDefinition = {
  id: 'palworld',
  name: 'Palworld',
  defaultExePath: 'PalServer.exe',
  defaultArgs: ['-useperfthreads', '-NoAsyncLoadingThread', '-UseMultithreadForDS'],
  defaultPorts: { query: 27015, game: 8211 },
  steamAppId: '2394010',
  configFormat: 'ini',
  defaultConfigPath: 'Pal/Saved/Config/WindowsServer/PalWorldSettings.ini',
  defaultSavePath: 'Pal/Saved/SaveGames',
};

export class PalworldProvider extends BaseGameProvider {
  private readonly configAdapter: PalworldConfigAdapter;

  constructor(
    server: Server,
    processManager: ProcessManagerService,
    filesystem: FilesystemService,
    steamcmd: SteamcmdService,
    backupsService: BackupsService,
    logsService: LogsService,
  ) {
    super(server, PalworldDefinition, processManager, filesystem, steamcmd, backupsService, logsService);
    this.configAdapter = new PalworldConfigAdapter(filesystem);
  }

  async queryStatus(): Promise<GameServerStatus> {
    try {
      const GameDig = await import('gamedig');
      const state = await GameDig.default.query({
        type: 'palworld',
        host: '127.0.0.1',
        port: this.server.queryPort,
      });
      return {
        online: true,
        players: state.numplayers ?? state.players.length,
        maxPlayers: state.maxplayers,
        playerNames: state.players.map((p: any) => p.name).filter(Boolean),
        ping: state.ping,
        map: state.map,
      };
    } catch {
      return {
        online: false,
        players: 0,
        maxPlayers: 0,
        playerNames: [],
        ping: 0,
        map: '',
      };
    }
  }

  async readConfig(): Promise<Record<string, any>> {
    const configPath = this.filesystem.joinPath(this.server.path, this.server.configPath);
    return this.configAdapter.read(configPath);
  }

  async writeConfig(data: Record<string, any>): Promise<void> {
    const configPath = this.filesystem.joinPath(this.server.path, this.server.configPath);
    const current = await this.configAdapter.read(configPath);
    const merged = { ...current, ...data };
    await this.configAdapter.write(configPath, merged);
  }

  getConfigSchema(): ConfigSchema {
    return PalworldConfigSchema;
  }
}
