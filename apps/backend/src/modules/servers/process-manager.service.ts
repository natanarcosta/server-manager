import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { spawn, ChildProcess } from 'child_process';
import treeKill from 'tree-kill';
import { ManagedProcess, INTERNAL_EVENTS } from '@server-manager/shared';
import { LogsService } from '../logs/logs.service';

interface RunningProcess {
  process: ChildProcess;
  metadata: ManagedProcess;
  autoRestart: boolean;
  maxRestarts: number;
}

@Injectable()
export class ProcessManagerService {
  private readonly logger = new Logger(ProcessManagerService.name);
  private readonly processes = new Map<number, RunningProcess>();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly logsService: LogsService,
  ) {}

  async startProcess(
    serverId: number,
    exePath: string,
    args: string[],
    cwd: string,
    autoRestart = false,
    maxRestarts = 3,
  ): Promise<void> {
    if (this.processes.has(serverId)) {
      this.logger.warn(`Process for server ${serverId} already running`);
      return;
    }

    const child = spawn(exePath, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    const metadata: ManagedProcess = {
      pid: child.pid || 0,
      startedAt: new Date(),
      restartCount: 0,
    };

    const running: RunningProcess = {
      process: child,
      metadata,
      autoRestart,
      maxRestarts,
    };

    this.processes.set(serverId, running);

    child.stdout?.on('data', (data: Buffer) => {
      const line = data.toString().trim();
      if (line) {
        this.logsService.addLog(serverId, line);
        this.eventEmitter.emit(INTERNAL_EVENTS.LOGS_RECEIVED, { serverId, line });
      }
    });

    child.stderr?.on('data', (data: Buffer) => {
      const line = data.toString().trim();
      if (line) {
        this.logsService.addLog(serverId, `[ERROR] ${line}`);
        this.eventEmitter.emit(INTERNAL_EVENTS.LOGS_RECEIVED, { serverId, line: `[ERROR] ${line}` });
      }
    });

    child.on('exit', (code) => {
      metadata.lastExitCode = code ?? undefined;
      this.processes.delete(serverId);

      if (code !== 0 && code !== null) {
        this.logger.warn(`Server ${serverId} crashed with exit code ${code}`);
        this.eventEmitter.emit(INTERNAL_EVENTS.SERVER_CRASHED, { serverId, exitCode: code });

        if (autoRestart && metadata.restartCount < maxRestarts) {
          metadata.restartCount++;
          this.logger.log(`Auto-restarting server ${serverId} (attempt ${metadata.restartCount}/${maxRestarts})`);
          setTimeout(() => {
            this.startProcess(serverId, exePath, args, cwd, autoRestart, maxRestarts);
          }, 5000);
        }
      } else {
        this.eventEmitter.emit(INTERNAL_EVENTS.SERVER_STOPPED, { serverId });
      }
    });

    this.eventEmitter.emit(INTERNAL_EVENTS.SERVER_STARTED, { serverId, pid: child.pid });
    this.logger.log(`Server ${serverId} started with PID ${child.pid}`);
  }

  async stopProcess(serverId: number): Promise<void> {
    const running = this.processes.get(serverId);
    if (!running) return;

    running.autoRestart = false;

    return new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        this.killProcess(serverId).then(resolve);
      }, 15000);

      running.process.on('exit', () => {
        clearTimeout(timeout);
        resolve();
      });

      running.process.kill('SIGTERM');
    });
  }

  async killProcess(serverId: number): Promise<void> {
    const running = this.processes.get(serverId);
    if (!running) return;

    running.autoRestart = false;

    return new Promise<void>((resolve, reject) => {
      if (!running.metadata.pid) {
        resolve();
        return;
      }
      treeKill(running.metadata.pid, 'SIGKILL', (err) => {
        this.processes.delete(serverId);
        if (err) {
          this.logger.error(`Failed to kill process for server ${serverId}: ${err.message}`);
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  isRunning(serverId: number): boolean {
    return this.processes.has(serverId);
  }

  getProcessMetadata(serverId: number): ManagedProcess | undefined {
    return this.processes.get(serverId)?.metadata;
  }

  getRunningServerIds(): number[] {
    return Array.from(this.processes.keys());
  }
}
