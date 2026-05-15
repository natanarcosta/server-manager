import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { WS_EVENTS, INTERNAL_EVENTS } from '@server-manager/shared';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @OnEvent(INTERNAL_EVENTS.METRICS_UPDATED)
  handleMetricsUpdated(payload: any): void {
    this.server.emit(WS_EVENTS.METRICS_UPDATE, payload);
  }

  @OnEvent('server.status.changed')
  handleServerStatusChanged(payload: { serverId: number; status: string }): void {
    this.server.emit(WS_EVENTS.SERVER_STATUS, payload);
  }

  @OnEvent(INTERNAL_EVENTS.LOGS_RECEIVED)
  handleLogsReceived(payload: { serverId: number; line: string }): void {
    this.server.emit(WS_EVENTS.SERVER_LOGS, payload);
  }

  @OnEvent(INTERNAL_EVENTS.SERVER_CRASHED)
  handleServerCrashed(payload: { serverId: number; exitCode: number }): void {
    this.server.emit(WS_EVENTS.SERVER_STATUS, {
      serverId: payload.serverId,
      status: 'crashed',
    });
  }
}
