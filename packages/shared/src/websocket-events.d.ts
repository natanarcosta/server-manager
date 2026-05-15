export declare const WS_EVENTS: {
    readonly METRICS_UPDATE: "metrics:update";
    readonly SERVER_STATUS: "server:status";
    readonly SERVER_LOGS: "server:logs";
    readonly SERVER_PLAYERS: "server:players";
};
export type WsEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];
