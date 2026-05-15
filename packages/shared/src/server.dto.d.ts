import { ServerStatus } from './server-status';
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
export interface CreateServerDto {
    name: string;
    game: string;
    path: string;
    exePath: string;
    configPath: string;
    savePath: string;
    steamAppId: string;
    queryPort: number;
    gamePort: number;
}
export interface UpdateServerDto {
    name?: string;
    path?: string;
    exePath?: string;
    configPath?: string;
    savePath?: string;
    queryPort?: number;
    gamePort?: number;
}
