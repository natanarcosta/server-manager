import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { WebsocketService } from '../../services/websocket.service';
import { LogViewerComponent } from '../../components/log-viewer/log-viewer.component';
import { ServerDto, BackupDto } from '../../models/types';

@Component({
  selector: 'app-server-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatTabsModule, MatTableModule, LogViewerComponent],
  template: `
    <div class="detail-page" *ngIf="server">
      <div class="detail-header">
        <a routerLink="/dashboard" class="back-link">
          <mat-icon>arrow_back</mat-icon>
          Back
        </a>
        <div class="header-info">
          <h1>{{ server.name }}</h1>
          <span class="status-badge" [class]="'status-' + server.status">
            {{ server.status | uppercase }}
          </span>
        </div>
        <div class="header-actions">
          <button mat-raised-button color="primary"
            *ngIf="server.status === 'offline' || server.status === 'crashed'"
            (click)="start()">
            <mat-icon>play_arrow</mat-icon> Start
          </button>
          <button mat-raised-button color="warn"
            *ngIf="server.status === 'online'"
            (click)="stop()">
            <mat-icon>stop</mat-icon> Stop
          </button>
          <button mat-raised-button
            *ngIf="server.status === 'online'"
            (click)="restart()">
            <mat-icon>refresh</mat-icon> Restart
          </button>
          <button mat-raised-button (click)="backup()">
            <mat-icon>backup</mat-icon> Backup
          </button>
        </div>
      </div>

      <mat-tab-group class="detail-tabs">
        <mat-tab label="Logs">
          <div class="tab-content">
            <app-log-viewer [lines]="logLines"></app-log-viewer>
          </div>
        </mat-tab>

        <mat-tab label="Backups">
          <div class="tab-content">
            <table mat-table [dataSource]="backups" class="backup-table" *ngIf="backups.length > 0">
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let b">{{ b.createdAt | date:'medium' }}</td>
              </ng-container>
              <ng-container matColumnDef="size">
                <th mat-header-cell *matHeaderCellDef>Size</th>
                <td mat-cell *matCellDef="let b">{{ formatBytes(b.size) }}</td>
              </ng-container>
              <ng-container matColumnDef="path">
                <th mat-header-cell *matHeaderCellDef>Path</th>
                <td mat-cell *matCellDef="let b">{{ b.path }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
            <div class="empty-tab" *ngIf="backups.length === 0">
              No backups yet
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Configuration">
          <div class="tab-content">
            <a [routerLink]="['/servers', server.id, 'config']" mat-raised-button color="primary">
              <mat-icon>settings</mat-icon> Open Config Editor
            </a>
          </div>
        </mat-tab>

        <mat-tab label="Info">
          <div class="tab-content info-grid">
            <div class="info-item"><span class="label">Game</span><span>{{ server.game | titlecase }}</span></div>
            <div class="info-item"><span class="label">Game Port</span><span>{{ server.gamePort }}</span></div>
            <div class="info-item"><span class="label">Query Port</span><span>{{ server.queryPort }}</span></div>
            <div class="info-item"><span class="label">Steam App ID</span><span>{{ server.steamAppId }}</span></div>
            <div class="info-item"><span class="label">Path</span><span>{{ server.path }}</span></div>
            <div class="info-item"><span class="label">Last Start</span><span>{{ server.lastStartAt ? (server.lastStartAt | date:'medium') : 'Never' }}</span></div>
            <div class="info-item"><span class="label">Last Backup</span><span>{{ server.lastBackupAt ? (server.lastBackupAt | date:'medium') : 'Never' }}</span></div>
            <div class="info-item"><span class="label">Last Update</span><span>{{ server.lastUpdateAt ? (server.lastUpdateAt | date:'medium') : 'Never' }}</span></div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .detail-page { padding: 24px; }
    .back-link { display: flex; align-items: center; gap: 4px; color: #a6adc8; text-decoration: none; margin-bottom: 16px; font-size: 14px; }
    .back-link:hover { color: #cdd6f4; }
    .detail-header { margin-bottom: 24px; }
    .header-info { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
    .header-info h1 { font-size: 24px; font-weight: 700; color: #cdd6f4; margin: 0; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.5px; }
    .status-online { background: rgba(166, 227, 161, 0.15); color: #a6e3a1; }
    .status-offline { background: rgba(108, 112, 134, 0.15); color: #6c7086; }
    .status-starting, .status-stopping { background: rgba(249, 226, 175, 0.15); color: #f9e2af; }
    .status-updating, .status-backing_up { background: rgba(137, 180, 250, 0.15); color: #89b4fa; }
    .status-crashed { background: rgba(243, 139, 168, 0.15); color: #f38ba8; }
    .header-actions { display: flex; gap: 8px; }
    .tab-content { padding: 20px 0; }
    .backup-table { width: 100%; background: transparent; }
    .empty-tab { text-align: center; color: #6c7086; padding: 40px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 12px; }
    .info-item {
      display: flex; justify-content: space-between; padding: 12px 16px;
      background: #1e1e2e; border: 1px solid #313244; border-radius: 8px;
    }
    .info-item .label { color: #a6adc8; }
    ::ng-deep .mat-mdc-tab { color: #a6adc8 !important; }
    ::ng-deep .mat-mdc-tab.mdc-tab--active { color: #cdd6f4 !important; }
    ::ng-deep .mat-mdc-header-cell, ::ng-deep .mat-mdc-cell { color: #cdd6f4; }
  `]
})
export class ServerDetailComponent implements OnInit, OnDestroy {
  server: ServerDto | null = null;
  logLines: string[] = [];
  backups: BackupDto[] = [];
  displayedColumns = ['createdAt', 'size', 'path'];
  private serverId = 0;
  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private ws: WebsocketService,
  ) {}

  ngOnInit(): void {
    this.serverId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadServer();
    this.loadBackups();

    this.subs.push(
      this.ws.serverStatus$.subscribe(({ serverId, status }) => {
        if (this.server && this.server.id === serverId) {
          this.server = { ...this.server, status: status as any };
        }
      }),
      this.ws.serverLogs$.subscribe(({ serverId, line }) => {
        if (serverId === this.serverId) {
          this.logLines = [...this.logLines, line];
          if (this.logLines.length > 500) {
            this.logLines = this.logLines.slice(-500);
          }
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadServer(): void {
    this.api.getServer(this.serverId).subscribe((s) => (this.server = s));
  }

  loadBackups(): void {
    this.api.getBackups(this.serverId).subscribe((b) => (this.backups = b));
  }

  start(): void {
    this.api.startServer(this.serverId).subscribe(() => this.loadServer());
  }

  stop(): void {
    this.api.stopServer(this.serverId).subscribe(() => this.loadServer());
  }

  restart(): void {
    this.api.restartServer(this.serverId).subscribe(() => this.loadServer());
  }

  backup(): void {
    this.api.createBackup(this.serverId).subscribe(() => this.loadBackups());
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}
