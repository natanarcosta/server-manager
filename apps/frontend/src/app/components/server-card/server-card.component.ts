import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ServerDto, ServerStatus } from '../../models/types';

@Component({
  selector: 'app-server-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatMenuModule, MatTooltipModule],
  template: `
    <div class="server-card" [routerLink]="['/servers', server.id]">
      <div class="card-header">
        <div class="game-info">
          <div class="game-icon" [style.background]="getGameColor(server.game)">
            {{ server.game[0] | uppercase }}
          </div>
          <div>
            <div class="server-name">{{ server.name }}</div>
            <div class="game-name">{{ server.game | titlecase }}</div>
          </div>
        </div>
        <div class="status-badge" [class]="'status-' + server.status">
          {{ server.status | uppercase }}
        </div>
      </div>

      <div class="card-info">
        <div class="info-row">
          <mat-icon>lan</mat-icon>
          <span>Port: {{ server.gamePort }}</span>
        </div>
        <div class="info-row" *ngIf="server.lastStartAt">
          <mat-icon>access_time</mat-icon>
          <span>Started: {{ formatDate(server.lastStartAt) }}</span>
        </div>
      </div>

      <div class="card-actions" (click)="$event.stopPropagation()">
        <button mat-icon-button color="primary"
          *ngIf="server.status === 'offline' || server.status === 'crashed'"
          (click)="onStart.emit(server.id)"
          matTooltip="Start">
          <mat-icon>play_arrow</mat-icon>
        </button>
        <button mat-icon-button color="warn"
          *ngIf="server.status === 'online'"
          (click)="onStop.emit(server.id)"
          matTooltip="Stop">
          <mat-icon>stop</mat-icon>
        </button>
        <button mat-icon-button
          *ngIf="server.status === 'online'"
          (click)="onRestart.emit(server.id)"
          matTooltip="Restart">
          <mat-icon>refresh</mat-icon>
        </button>
        <button mat-icon-button [matMenuTriggerFor]="menu">
          <mat-icon>more_vert</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="onUpdate.emit(server.id)">
            <mat-icon>system_update</mat-icon>
            <span>Update via SteamCMD</span>
          </button>
          <button mat-menu-item (click)="onBackup.emit(server.id)">
            <mat-icon>backup</mat-icon>
            <span>Create Backup</span>
          </button>
          <button mat-menu-item (click)="onKill.emit(server.id)"
            *ngIf="server.status !== 'offline'">
            <mat-icon>dangerous</mat-icon>
            <span>Force Kill</span>
          </button>
        </mat-menu>
      </div>
    </div>
  `,
  styles: [`
    .server-card {
      background: #1e1e2e;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .server-card:hover { border-color: #45475a; transform: translateY(-2px); }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
    .game-info { display: flex; align-items: center; gap: 12px; }
    .game-icon {
      width: 40px; height: 40px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 18px; color: white;
    }
    .server-name { font-size: 16px; font-weight: 600; color: #cdd6f4; }
    .game-name { font-size: 13px; color: #a6adc8; }
    .status-badge {
      padding: 4px 12px; border-radius: 20px; font-size: 11px;
      font-weight: 600; letter-spacing: 0.5px;
    }
    .status-online { background: rgba(166, 227, 161, 0.15); color: #a6e3a1; }
    .status-offline { background: rgba(108, 112, 134, 0.15); color: #6c7086; }
    .status-starting { background: rgba(249, 226, 175, 0.15); color: #f9e2af; }
    .status-stopping { background: rgba(249, 226, 175, 0.15); color: #f9e2af; }
    .status-updating { background: rgba(137, 180, 250, 0.15); color: #89b4fa; }
    .status-backing_up { background: rgba(137, 180, 250, 0.15); color: #89b4fa; }
    .status-crashed { background: rgba(243, 139, 168, 0.15); color: #f38ba8; }
    .card-info { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
    .info-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #a6adc8; }
    .info-row mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .card-actions { display: flex; justify-content: flex-end; gap: 4px; }
  `]
})
export class ServerCardComponent {
  @Input() server!: ServerDto;
  @Output() onStart = new EventEmitter<number>();
  @Output() onStop = new EventEmitter<number>();
  @Output() onRestart = new EventEmitter<number>();
  @Output() onKill = new EventEmitter<number>();
  @Output() onUpdate = new EventEmitter<number>();
  @Output() onBackup = new EventEmitter<number>();

  getGameColor(game: string): string {
    const colors: Record<string, string> = {
      palworld: '#4ade80',
      enshrouded: '#f97316',
      windrose: '#8b5cf6',
    };
    return colors[game] || '#3b82f6';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString();
  }
}
