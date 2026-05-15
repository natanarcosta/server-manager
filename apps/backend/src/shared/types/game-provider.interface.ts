import { GameServerStatus, ConfigSchema } from '@server-manager/shared';

export interface GameProvider {
  start(): Promise<void>;
  stop(): Promise<void>;
  restart(): Promise<void>;
  kill(): Promise<void>;
  update(): Promise<void>;
  backup(): Promise<void>;
  queryStatus(): Promise<GameServerStatus>;
  readConfig(): Promise<Record<string, any>>;
  writeConfig(data: Record<string, any>): Promise<void>;
  getLogs(): Promise<string[]>;
  getConfigSchema(): ConfigSchema;
}

export interface GameDefinition {
  id: string;
  name: string;
  defaultExePath: string;
  defaultArgs: string[];
  defaultPorts: { query: number; game: number };
  steamAppId: string;
  configFormat: 'ini' | 'json' | 'cfg';
  defaultConfigPath: string;
  defaultSavePath: string;
}
