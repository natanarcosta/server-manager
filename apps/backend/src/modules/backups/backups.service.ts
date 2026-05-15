import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as archiver from 'archiver';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { FilesystemService } from '../../shared/filesystem/filesystem.service';
import { INTERNAL_EVENTS, BackupDto } from '@server-manager/shared';

@Injectable()
export class BackupsService {
  private readonly logger = new Logger(BackupsService.name);
  private readonly storagePath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly filesystem: FilesystemService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.storagePath = process.env.STORAGE_PATH || path.resolve(process.cwd(), '../../storage');
  }

  async getBackups(serverId: number): Promise<BackupDto[]> {
    const backups = await this.prisma.backup.findMany({
      where: { serverId },
      orderBy: { createdAt: 'desc' },
    });
    return backups.map((b) => ({
      id: b.id,
      serverId: b.serverId,
      path: b.path,
      size: b.size,
      createdAt: b.createdAt.toISOString(),
    }));
  }

  async createBackup(serverId: number): Promise<BackupDto> {
    const server = await this.prisma.server.findUnique({ where: { id: serverId } });
    if (!server) throw new NotFoundException(`Server ${serverId} not found`);

    const savePath = path.resolve(server.path, server.savePath);
    const saveExists = await this.filesystem.exists(savePath);
    if (!saveExists) {
      throw new NotFoundException(`Save path not found: ${savePath}`);
    }

    const backupDir = path.join(this.storagePath, 'backups', server.game);
    await this.filesystem.ensureDir(backupDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFileName = `${timestamp}.zip`;
    const backupPath = path.join(backupDir, backupFileName);

    const size = await this.compressDirectory(savePath, backupPath);

    const backup = await this.prisma.backup.create({
      data: {
        serverId,
        path: backupPath,
        size,
      },
    });

    await this.prisma.server.update({
      where: { id: serverId },
      data: { lastBackupAt: new Date() },
    });

    this.eventEmitter.emit(INTERNAL_EVENTS.BACKUP_CREATED, {
      serverId,
      backupId: backup.id,
      path: backupPath,
    });

    this.logger.log(`Backup created for server ${serverId}: ${backupPath}`);

    return {
      id: backup.id,
      serverId: backup.serverId,
      path: backup.path,
      size: backup.size,
      createdAt: backup.createdAt.toISOString(),
    };
  }

  async cleanOldBackups(serverId: number, maxBackups = 10): Promise<void> {
    const backups = await this.prisma.backup.findMany({
      where: { serverId },
      orderBy: { createdAt: 'desc' },
    });

    if (backups.length <= maxBackups) return;

    const toDelete = backups.slice(maxBackups);
    for (const backup of toDelete) {
      try {
        await this.filesystem.remove(backup.path);
      } catch {
        this.logger.warn(`Failed to delete backup file: ${backup.path}`);
      }
      await this.prisma.backup.delete({ where: { id: backup.id } });
    }
  }

  private compressDirectory(sourceDir: string, outputPath: string): Promise<number> {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      const archive = archiver.create('zip', { zlib: { level: 6 } });

      output.on('close', () => resolve(archive.pointer()));
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }
}
