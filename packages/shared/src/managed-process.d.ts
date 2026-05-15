export interface ManagedProcess {
    pid: number;
    startedAt: Date;
    restartCount: number;
    lastExitCode?: number;
    cpuUsage?: number;
    ramUsage?: number;
}
