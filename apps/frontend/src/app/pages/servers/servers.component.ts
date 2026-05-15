import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { ServerCardComponent } from '../../components/server-card/server-card.component';
import { ServerDto } from '../../models/types';
import { AddServerDialogComponent } from './add-server-dialog.component';

@Component({
  selector: 'app-servers',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatDialogModule, ServerCardComponent],
  template: `
    <div class="servers-page">
      <div class="page-header">
        <h1 class="page-title">Servers</h1>
        <button mat-raised-button color="primary" (click)="openAddServer()">
          <mat-icon>add</mat-icon>
          Add server
        </button>
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
        <p class="hint">Create a server to get started</p>
      </div>
    </div>
  `,
  styles: [`
    .servers-page { padding: 24px; }
    .page-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: #cdd6f4; margin-bottom: 24px; }
    .servers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 16px; }
    .empty-state {
      text-align: center; padding: 60px 20px; color: #6c7086;
      background: #1e1e2e; border: 1px dashed #313244; border-radius: 12px;
    }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 12px; }
    .empty-state p { font-size: 16px; margin: 4px 0; }
    .empty-state .hint { font-size: 13px; }
  `],
})
export class ServersComponent implements OnInit {
  servers: ServerDto[] = [];

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadServers();
  }

  loadServers(): void {
    this.api.getServers().subscribe((s) => (this.servers = s));
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

  openAddServer(): void {
    const ref = this.dialog.open(AddServerDialogComponent, {
      panelClass: 'add-server-dialog-panel',
      autoFocus: false,
    });
    ref.afterClosed().subscribe((created: ServerDto | null) => {
      if (created) this.loadServers();
    });
  }
}
