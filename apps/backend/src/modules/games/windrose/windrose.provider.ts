import { GameServerStatus, ConfigSchema } from '@server-manager/shared';
import { GameDefinition } from '../../../shared/types/game-provider.interface';
import { BaseGameProvider } from '../base-game.provider';
import { ProcessManagerService } from '../../servers/process-manager.service';
import { FilesystemService } from '../../../shared/filesystem/filesystem.service';
import { SteamcmdService } from '../../steamcmd/steamcmd.service';
import { BackupsService } from '../../backups/backups.service';
import { LogsService } from '../../logs/logs.service';
import { Server } from '@prisma/client';

export const WindroseDefinition: GameDefinition = {
  id: 'windrose',
  name: 'Windrose',
  defaultExePath: 'WindroseServer.exe',
  defaultArgs: [],
  defaultPorts: { query: 27016, game: 7777 },
  steamAppId: '0',
  configFormat: 'cfg',
  defaultConfigPath: 'Config/ServerSettings.cfg',
  defaultSavePath: 'SaveData',
};

export const WindroseConfigSchema: ConfigSchema = {
  ServerName: {
    type: 'string',
    label: 'Server Name',
    description: 'Name of the server',
    defaultValue: 'Windrose Server',
  },
  ServerPassword: {
    type: 'string',
    label: 'Server Password',
    description: 'Password to join',
    defaultValue: '',
  },
  MaxPlayers: {
    type: 'number',
    label: 'Max Players',
    description: 'Maximum number of players',
    min: 1,
    max: 64,
    defaultValue: 32,
  },
  Port: {
    type: 'number',
    label: 'Game Port',
    description: 'Game port',
    defaultValue: 7777,
  },
  QueryPort: {
    type: 'number',
    label: 'Query Port',
    description: 'Query port',
    defaultValue: 27016,
  },
};

export class WindroseProvider extends BaseGameProvider {
  constructor(
    server: Server,
    processManager: ProcessManagerService,
    filesystem: FilesystemService,
    steamcmd: SteamcmdService,
    backupsService: BackupsService,
    logsService: LogsService,
  ) {
    super(server, WindroseDefinition, processManager, filesystem, steamcmd, backupsService, logsService);
  }

  async queryStatus(): Promise<GameServerStatus> {
    try {
      const GameDig = await import('gamedig');
      const state = await GameDig.default.query({
        type: 'protocol-valve',
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
    return this.parseCfg(content);
  }

  async writeConfig(data: Record<string, any>): Promise<void> {
    const configPath = this.filesystem.joinPath(this.server.path, this.server.configPath);
    const current = await this.readConfig();
    const merged = { ...current, ...data };
    const content = this.serializeCfg(merged);
    await this.filesystem.writeFile(configPath, content);
  }

  getConfigSchema(): ConfigSchema {
    return WindroseConfigSchema;
  }

  private parseCfg(content: string): Record<string, any> {
    const config: Record<string, any> = {};
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let value: any = trimmed.substring(eqIdx + 1).trim();
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(Number(value)) && value !== '') value = Number(value);
        config[key] = value;
      }
    }
    return config;
  }

  private serializeCfg(data: Record<string, any>): string {
    return Object.entries(data)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  }
}
