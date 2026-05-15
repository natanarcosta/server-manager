export const INTERNAL_EVENTS = {
  SERVER_STARTED: 'server.started',
  SERVER_STOPPED: 'server.stopped',
  SERVER_CRASHED: 'server.crashed',
  SERVER_UPDATED: 'server.updated',
  BACKUP_CREATED: 'backup.created',
  METRICS_UPDATED: 'metrics.updated',
  LOGS_RECEIVED: 'logs.received',
} as const;

export type InternalEvent = (typeof INTERNAL_EVENTS)[keyof typeof INTERNAL_EVENTS];
