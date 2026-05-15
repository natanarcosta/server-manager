export type ServerStatus =
  | 'offline'
  | 'starting'
  | 'online'
  | 'stopping'
  | 'updating'
  | 'backing_up'
  | 'crashed';

export interface ServerDto {
  id: number;
  name: string;
  game: string;
  status: ServerStatus;
  path: string;
  exePath: string;
  configPath: string;
  savePath: string;
  steamAppId: string;
  queryPort: number;
  gamePort: number;
  lastStartAt: string | null;
  lastCrashAt: string | null;
  lastBackupAt: string | null;
  lastUpdateAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SystemMetricsDto {
  cpu: { usage: number; cores: number; model: string; temperature: number | null };
  ram: { total: number; used: number; free: number; usagePercent: number };
  disk: { total: number; used: number; free: number; usagePercent: number };
  network: { localIp: string; externalIp: string | null; rxBytes: number; txBytes: number };
  uptime: number;
  activeProcesses: number;
}

export interface BackupDto {
  id: number;
  serverId: number;
  path: string;
  size: number;
  createdAt: string;
}

export type ScheduleType = 'restart' | 'backup' | 'update' | 'health_check';

export interface ScheduleDto {
  id: number;
  serverId: number;
  type: ScheduleType;
  cronExpression: string;
  enabled: boolean;
  payload: string | null;
  lastRunAt: string | null;
  nextRunAt: string | null;
  createdAt: string;
}

export interface ConfigFieldSchema {
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  description?: string;
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  options?: string[];
  required?: boolean;
}

export type ConfigSchema = Record<string, ConfigFieldSchema>;

export interface ServerConfigResponse {
  schema: ConfigSchema;
  values: Record<string, any>;
}
