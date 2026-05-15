import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { SystemMetricsDto } from '../models/types';

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private socket: Socket;

  private metricsSubject = new Subject<SystemMetricsDto>();
  private serverStatusSubject = new Subject<{ serverId: number; status: string }>();
  private serverLogsSubject = new Subject<{ serverId: number; line: string }>();
  private serverPlayersSubject = new Subject<{ serverId: number; players: string[] }>();

  metrics$: Observable<SystemMetricsDto> = this.metricsSubject.asObservable();
  serverStatus$: Observable<{ serverId: number; status: string }> = this.serverStatusSubject.asObservable();
  serverLogs$: Observable<{ serverId: number; line: string }> = this.serverLogsSubject.asObservable();
  serverPlayers$: Observable<{ serverId: number; players: string[] }> = this.serverPlayersSubject.asObservable();

  constructor() {
    this.socket = io('/', {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('metrics:update', (data: SystemMetricsDto) => {
      this.metricsSubject.next(data);
    });

    this.socket.on('server:status', (data: { serverId: number; status: string }) => {
      this.serverStatusSubject.next(data);
    });

    this.socket.on('server:logs', (data: { serverId: number; line: string }) => {
      this.serverLogsSubject.next(data);
    });

    this.socket.on('server:players', (data: { serverId: number; players: string[] }) => {
      this.serverPlayersSubject.next(data);
    });
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
