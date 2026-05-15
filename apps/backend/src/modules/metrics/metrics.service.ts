import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as si from 'systeminformation';
import { SystemMetricsDto, ServerMetricsDto, INTERNAL_EVENTS } from '@server-manager/shared';
import { ProcessManagerService } from '../servers/process-manager.service';

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  private metricsInterval: ReturnType<typeof setInterval> | null = null;
  private cachedExternalIp: string | null = null;

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly processManager: ProcessManagerService,
  ) {}

  onModuleInit(): void {
    this.startMetricsCollection();
  }

  onModuleDestroy(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(async () => {
      try {
        const metrics = await this.getSystemMetrics();
        this.eventEmitter.emit(INTERNAL_EVENTS.METRICS_UPDATED, metrics);
      } catch (err) {
        this.logger.error(`Failed to collect metrics: ${err}`);
      }
    }, 5000);
  }

  async getSystemMetrics(): Promise<SystemMetricsDto> {
    const [cpu, mem, disk, networkInterfaces, networkStats, cpuTemp, processes] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkInterfaces(),
      si.networkStats(),
      si.cpuTemperature(),
      si.processes(),
    ]);

    const cpuInfo = await si.cpu();
    const primaryDisk = Array.isArray(disk) && disk.length > 0 ? disk[0] : null;
    const primaryNet = Array.isArray(networkInterfaces)
      ? networkInterfaces.find((n) => !n.internal && n.ip4)
      : null;

    const netStats = Array.isArray(networkStats) && networkStats.length > 0 ? networkStats[0] : null;

    if (!this.cachedExternalIp) {
      try {
        const publicIp = await si.networkInterfaces('default');
        this.cachedExternalIp = Array.isArray(publicIp) && publicIp.length > 0
          ? publicIp[0].ip4 || null
          : null;
      } catch {
        this.cachedExternalIp = null;
      }
    }

    return {
      cpu: {
        usage: cpu.currentLoad,
        cores: cpuInfo.cores,
        model: `${cpuInfo.manufacturer} ${cpuInfo.brand}`,
        temperature: cpuTemp.main ?? null,
      },
      ram: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usagePercent: (mem.used / mem.total) * 100,
      },
      disk: {
        total: primaryDisk?.size ?? 0,
        used: primaryDisk?.used ?? 0,
        free: (primaryDisk?.size ?? 0) - (primaryDisk?.used ?? 0),
        usagePercent: primaryDisk?.use ?? 0,
      },
      network: {
        localIp: primaryNet?.ip4 ?? '127.0.0.1',
        externalIp: this.cachedExternalIp,
        rxBytes: netStats?.rx_bytes ?? 0,
        txBytes: netStats?.tx_bytes ?? 0,
      },
      uptime: si.time().uptime ?? 0,
      activeProcesses: processes.all,
    };
  }

  async getServerMetrics(serverId: number): Promise<ServerMetricsDto | null> {
    const metadata = this.processManager.getProcessMetadata(serverId);
    if (!metadata) return null;

    try {
      const procData = await si.processLoad(`${metadata.pid}`);
      const proc = Array.isArray(procData) && procData.length > 0 ? procData[0] : null;
      return {
        serverId,
        cpuUsage: proc?.cpu ?? 0,
        ramUsage: proc?.mem ?? 0,
        uptime: Math.floor((Date.now() - metadata.startedAt.getTime()) / 1000),
      };
    } catch {
      return {
        serverId,
        cpuUsage: 0,
        ramUsage: 0,
        uptime: Math.floor((Date.now() - metadata.startedAt.getTime()) / 1000),
      };
    }
  }
}
