export interface BackupDto {
    id: number;
    serverId: number;
    path: string;
    size: number;
    createdAt: string;
}
export interface CreateBackupDto {
    serverId: number;
}
