import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as path from 'path';
import { FilesystemService } from '../../shared/filesystem/filesystem.service';

const MAX_BUFFER_LINES = 500;

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);
  private readonly logBuffers = new Map<number, string[]>();
  private readonly storagePath: string;

  constructor(
    private readonly filesystem: FilesystemService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.storagePath = process.env.STORAGE_PATH || path.resolve(process.cwd(), '../../storage');
  }

  addLog(serverId: number, line: string): void {
    if (!this.logBuffers.has(serverId)) {
      this.logBuffers.set(serverId, []);
    }
    const buffer = this.logBuffers.get(serverId)!;
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${line}`;
    buffer.push(entry);

    if (buffer.length > MAX_BUFFER_LINES) {
      buffer.splice(0, buffer.length - MAX_BUFFER_LINES);
    }

    this.persistLog(serverId, entry).catch((err) => {
      this.logger.error(`Failed to persist log for server ${serverId}: ${err}`);
    });
  }

  getServerLogs(serverId: number, limit = 100): string[] {
    const buffer = this.logBuffers.get(serverId) || [];
    return buffer.slice(-limit);
  }

  clearBuffer(serverId: number): void {
    this.logBuffers.delete(serverId);
  }

  private async persistLog(serverId: number, entry: string): Promise<void> {
    const date = new Date().toISOString().slice(0, 10);
    const logDir = path.join(this.storagePath, 'logs', `server-${serverId}`);
    await this.filesystem.ensureDir(logDir);

    const logFile = path.join(logDir, `${date}.log`);
    const latestFile = path.join(logDir, 'latest.log');

    const line = entry + '\n';

    const { appendFile } = await import('fs/promises');
    await appendFile(logFile, line);
    await appendFile(latestFile, line);
  }
}
