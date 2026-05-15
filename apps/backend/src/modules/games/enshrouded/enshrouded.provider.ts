import { GameServerStatus, ConfigSchema } from '@server-manager/shared';
import { GameDefinition } from '../../../shared/types/game-provider.interface';
import { BaseGameProvider } from '../base-game.provider';
import { ProcessManagerService } from '../../servers/process-manager.service';
import { FilesystemService } from '../../../shared/filesystem/filesystem.service';
import { SteamcmdService } from '../../steamcmd/steamcmd.service';
import { BackupsService } from '../../backups/backups.service';
import { LogsService } from '../../logs/logs.service';
import { Server } from '@prisma/client';

export const EnshroudedDefinition: GameDefinition = {
  id: 'enshrouded',
  name: 'Enshrouded',
  defaultExePath: 'enshrouded_server.exe',
  defaultArgs: [],
  defaultPorts: { query: 15637, game: 15636 },
  steamAppId: '2278520',
  configFormat: 'json',
  defaultConfigPath: 'enshrouded_server.json',
  defaultSavePath: 'savegame',
};

export const EnshroudedConfigSchema: ConfigSchema = {
  name: {
    type: 'string',
    label: 'Server Name',
    description: 'Name of the server',
    defaultValue: 'Enshrouded Server',
  },
  password: {
    type: 'string',
    label: 'Server Password',
    description: 'Password to join the server',
    defaultValue: '',
  },
  maxPlayers: {
    type: 'number',
    label: 'Max Players',
    description: 'Maximum number of players',
    min: 1,
    max: 16,
    defaultValue: 16,
  },
  gamePort: {
    type: 'number',
    label: 'Game Port',
    description: 'Game port',
    defaultValue: 15636,
  },
  queryPort: {
    type: 'number',
    label: 'Query Port',
    description: 'Query port',
    defaultValue: 15637,
  },
};

export class EnshroudedProvider extends BaseGameProvider {
  constructor(
    server: Server,
    processManager: ProcessManagerService,
    filesystem: FilesystemService,
    steamcmd: SteamcmdService,
    backupsService: BackupsService,
    logsService: LogsService,
  ) {
    super(server, EnshroudedDefinition, processManager, filesystem, steamcmd, backupsService, logsService);
  }

  async queryStatus(): Promise<GameServerStatus> {
    try {
      const GameDig = await import('gamedig');
      const state = await GameDig.default.query({
        type: 'enshrouded',
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
      return { online: false, players: 0, maxPlayers: 0, playerNames: [], ping: 0, map: '' };
    }
  }

  async readConfig(): Promise<Record<string, any>> {
    const configPath = this.filesystem.joinPath(this.server.path, this.server.configPath);
    const content = await this.filesystem.readFile(configPath);
    return JSON.parse(content);
  }

  async writeConfig(data: Record<string, any>): Promise<void> {
    const configPath = this.filesystem.joinPath(this.server.path, this.server.configPath);
    const current = await this.readConfig();
    const merged = { ...current, ...data };
    await this.filesystem.writeFile(configPath, JSON.stringify(merged, null, 2));
  }

  getConfigSchema(): ConfigSchema {
    return EnshroudedConfigSchema;
  }
}
