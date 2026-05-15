export const WS_EVENTS = {
  METRICS_UPDATE: 'metrics:update',
  SERVER_STATUS: 'server:status',
  SERVER_LOGS: 'server:logs',
  SERVER_PLAYERS: 'server:players',
} as const;

export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
