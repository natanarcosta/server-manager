export interface SystemMetricsDto {
  cpu: {
    usage: number;
    cores: number;
    model: string;
    temperature: number | null;
  };
  ram: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    usagePercent: number;
  };
  network: {
    localIp: string;
    externalIp: string | null;
    rxBytes: number;
    txBytes: number;
  };
  uptime: number;
  activeProcesses: number;
}

export interface ServerMetricsDto {
  serverId: number;
  cpuUsage: number;
  ramUsage: number;
  uptime: number;
}
