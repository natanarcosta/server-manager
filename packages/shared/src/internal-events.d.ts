export declare const INTERNAL_EVENTS: {
    readonly SERVER_STARTED: "server.started";
    readonly SERVER_STOPPED: "server.stopped";
    readonly SERVER_CRASHED: "server.crashed";
    readonly SERVER_UPDATED: "server.updated";
    readonly BACKUP_CREATED: "backup.created";
    readonly METRICS_UPDATED: "metrics.updated";
    readonly LOGS_RECEIVED: "logs.received";
};
export type InternalEvent = (typeof INTERNAL_EVENTS)[keyof typeof INTERNAL_EVENTS];
