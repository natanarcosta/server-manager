import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { MetricCardComponent } from '../../components/metric-card/metric-card.component';
import { ServerCardComponent } from '../../components/server-card/server-card.component';
import { ServerDto, SystemMetricsDto } from '../../models/types';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule, MetricCardComponent, ServerCardComponent],
  template: `
    <div class="dashboard">
      <h1 class="page-title">Dashboard</h1>

      <div class="metrics-grid">
        <app-metric-card
          title="CPU"
          [value]="metrics ? (metrics.cpu.usage | number:'1.1-1') + '%' : '--'"
          [subtitle]="metrics ? metrics.cpu.model : ''"
          icon="memory"
          iconColor="#3b82f6"
          [progress]="metrics ? metrics.cpu.usage : undefined"
        ></app-metric-card>

        <app-metric-card
          title="RAM"
          [value]="metrics ? formatBytes(metrics.ram.used) + ' / ' + formatBytes(metrics.ram.total) : '--'"
          [subtitle]="metrics ? (metrics.ram.usagePercent | number:'1.1-1') + '% used' : ''"
          icon="sd_storage"
          iconColor="#a6e3a1"
          [progress]="metrics ? metrics.ram.usagePercent : undefined"
        ></app-metric-card>

        <app-metric-card
          title="Disk"
          [value]="metrics ? formatBytes(metrics.disk.used) + ' / ' + formatBytes(metrics.disk.total) : '--'"
          [subtitle]="metrics ? (metrics.disk.usagePercent | number:'1.1-1') + '% used' : ''"
          icon="hard_drive"
          iconColor="#f9e2af"
          [progress]="metrics ? metrics.disk.usagePercent : undefined"
        ></app-metric-card>

        <app-metric-card
          title="Network"
          [value]="metrics ? (metrics.network.localIp || '--') : '--'"
          [subtitle]="metrics ? 'RX: ' + formatBytes(metrics.network.rxBytes) + ' / TX: ' + formatBytes(metrics.network.txBytes) : ''"
          icon="wifi"
          iconColor="#89b4fa"
        ></app-metric-card>
      </div>

      <div class="section-header">
        <h2>Servers</h2>
      </div>

      <div class="servers-grid" *ngIf="servers.length > 0">
        <app-server-card
          *ngFor="let server of servers"
          [server]="server"
          (onStart)="startServer($event)"
          (onStop)="stopServer($event)"
          (onRestart)="restartServer($event)"
          (onKill)="killServer($event)"
          (onUpdate)="updateServer($event)"
          (onBackup)="backupServer($event)"
        ></app-server-card>
      </div>

      <div class="empty-state" *ngIf="servers.length === 0">
        <mat-icon>dns</mat-icon>
        <p>No servers configured</p>
        <p class="hint">Add a server to get started</p>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: #cdd6f4; margin-bottom: 24px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .section-header h2 { font-size: 18px; font-weight: 600; color: #cdd6f4; }
    .servers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
    .empty-state {
      text-align: center; padding: 60px 20px; color: #6c7086;
      background: #1e1e2e; border: 1px dashed #313244; border-radius: 12px;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .empty-state p { font-size: 16px; margin: 4px 0; }
    .empty-state .hint { font-size: 13px; }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  servers: ServerDto[] = [];
  metrics: SystemMetricsDto | null = null;
  private subs: Subscription[] = [];

  constructor(
    private api: ApiService,
    private ws: WebsocketService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadServers();
    this.loadMetrics();

    this.subs.push(
      this.ws.metrics$.subscribe((m) => (this.metrics = m)),
      this.ws.serverStatus$.subscribe(({ serverId, status }) => {
        const server = this.servers.find((s) => s.id === serverId);
        if (server) server.status = status as any;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadServers(): void {
    this.api.getServers().subscribe((s) => (this.servers = s));
  }

  loadMetrics(): void {
    this.api.getSystemMetrics().subscribe((m) => (this.metrics = m));
  }

  startServer(id: number): void {
    this.api.startServer(id).subscribe(() => this.loadServers());
  }

  stopServer(id: number): void {
    this.api.stopServer(id).subscribe(() => this.loadServers());
  }

  restartServer(id: number): void {
    this.api.restartServer(id).subscribe(() => this.loadServers());
  }

  killServer(id: number): void {
    this.api.killServer(id).subscribe(() => this.loadServers());
  }

  updateServer(id: number): void {
    this.api.updateServerGame(id).subscribe(() => this.loadServers());
  }

  backupServer(id: number): void {
    this.api.createBackup(id).subscribe();
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
