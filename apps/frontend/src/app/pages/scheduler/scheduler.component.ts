import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from '../../services/api.service';
import { ServerDto, ScheduleDto, ScheduleType } from '../../models/types';

@Component({
  selector: 'app-scheduler',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatButtonModule, MatIconModule, MatTableModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    MatSlideToggleModule, MatDialogModule, MatSnackBarModule,
  ],
  template: `
    <div class="scheduler-page">
      <h1 class="page-title">Scheduler</h1>

      <div class="add-schedule-form">
        <h3>Add Schedule</h3>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Server</mat-label>
            <mat-select [(ngModel)]="newSchedule.serverId">
              <mat-option *ngFor="let s of servers" [value]="s.id">{{ s.name }}</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Type</mat-label>
            <mat-select [(ngModel)]="newSchedule.type">
              <mat-option value="restart">Restart</mat-option>
              <mat-option value="backup">Backup</mat-option>
              <mat-option value="update">Update</mat-option>
              <mat-option value="health_check">Health Check</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Cron Expression</mat-label>
            <input matInput [(ngModel)]="newSchedule.cronExpression" placeholder="0 6 * * *">
            <mat-hint>e.g. '0 6 * * *' = daily at 6:00 AM</mat-hint>
          </mat-form-field>

          <button mat-raised-button color="primary" (click)="addSchedule()">
            <mat-icon>add</mat-icon> Add
          </button>
        </div>
      </div>

      <div *ngFor="let server of servers" class="server-schedules">
        <h3>{{ server.name }}</h3>
        <table mat-table [dataSource]="getSchedulesForServer(server.id)" class="schedule-table"
          *ngIf="getSchedulesForServer(server.id).length > 0">
          <ng-container matColumnDef="type">
            <th mat-header-cell *matHeaderCellDef>Type</th>
            <td mat-cell *matCellDef="let s">{{ s.type | titlecase }}</td>
          </ng-container>
          <ng-container matColumnDef="cronExpression">
            <th mat-header-cell *matHeaderCellDef>Cron</th>
            <td mat-cell *matCellDef="let s">{{ s.cronExpression }}</td>
          </ng-container>
          <ng-container matColumnDef="enabled">
            <th mat-header-cell *matHeaderCellDef>Enabled</th>
            <td mat-cell *matCellDef="let s">
              <mat-slide-toggle [checked]="s.enabled"
                (change)="toggleSchedule(server.id, s)">
              </mat-slide-toggle>
            </td>
          </ng-container>
          <ng-container matColumnDef="lastRunAt">
            <th mat-header-cell *matHeaderCellDef>Last Run</th>
            <td mat-cell *matCellDef="let s">{{ s.lastRunAt ? (s.lastRunAt | date:'medium') : 'Never' }}</td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let s">
              <button mat-icon-button color="warn" (click)="deleteSchedule(server.id, s.id)">
                <mat-icon>delete</mat-icon>
              </button>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="scheduleCols"></tr>
          <tr mat-row *matRowDef="let row; columns: scheduleCols;"></tr>
        </table>
        <div class="empty-schedules" *ngIf="getSchedulesForServer(server.id).length === 0">
          No schedules configured
        </div>
      </div>
    </div>
  `,
  styles: [`
    .scheduler-page { padding: 24px; }
    .page-title { font-size: 24px; font-weight: 700; color: #cdd6f4; margin-bottom: 24px; }
    .add-schedule-form {
      background: #1e1e2e; border: 1px solid #313244; border-radius: 12px;
      padding: 20px; margin-bottom: 24px;
    }
    .add-schedule-form h3 { color: #cdd6f4; margin-bottom: 16px; }
    .form-row { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
    .form-row mat-form-field { flex: 1; min-width: 200px; }
    .server-schedules {
      background: #1e1e2e; border: 1px solid #313244; border-radius: 12px;
      padding: 20px; margin-bottom: 16px;
    }
    .server-schedules h3 { color: #cdd6f4; margin-bottom: 12px; }
    .schedule-table { width: 100%; background: transparent; }
    .empty-schedules { text-align: center; color: #6c7086; padding: 20px; }
    ::ng-deep .mat-mdc-header-cell, ::ng-deep .mat-mdc-cell { color: #cdd6f4; }
    ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__trailing {
      border-color: #45475a !important;
    }
    ::ng-deep .mat-mdc-input-element { color: #cdd6f4 !important; }
  `]
})
export class SchedulerComponent implements OnInit {
  servers: ServerDto[] = [];
  schedules: ScheduleDto[] = [];
  scheduleCols = ['type', 'cronExpression', 'enabled', 'lastRunAt', 'actions'];
  newSchedule = {
    serverId: 0,
    type: 'restart' as ScheduleType,
    cronExpression: '0 6 * * *',
    enabled: true,
  };

  constructor(
    private api: ApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.loadServers();
  }

  loadServers(): void {
    this.api.getServers().subscribe((servers) => {
      this.servers = servers;
      if (servers.length > 0 && !this.newSchedule.serverId) {
        this.newSchedule.serverId = servers[0].id;
      }
      for (const s of servers) {
        this.loadSchedules(s.id);
      }
    });
  }

  loadSchedules(serverId: number): void {
    this.api.getSchedules(serverId).subscribe((sched) => {
      this.schedules = [
        ...this.schedules.filter((s) => s.serverId !== serverId),
        ...sched,
      ];
    });
  }

  getSchedulesForServer(serverId: number): ScheduleDto[] {
    return this.schedules.filter((s) => s.serverId === serverId);
  }

  addSchedule(): void {
    this.api.createSchedule(this.newSchedule.serverId, this.newSchedule).subscribe({
      next: () => {
        this.loadSchedules(this.newSchedule.serverId);
        this.snackBar.open('Schedule created', 'OK', { duration: 3000 });
      },
      error: () => {
        this.snackBar.open('Failed to create schedule', 'OK', { duration: 3000 });
      },
    });
  }

  toggleSchedule(serverId: number, schedule: ScheduleDto): void {
    this.api.updateSchedule(serverId, schedule.id, { enabled: !schedule.enabled }).subscribe(() => {
      this.loadSchedules(serverId);
    });
  }

  deleteSchedule(serverId: number, scheduleId: number): void {
    this.api.deleteSchedule(serverId, scheduleId).subscribe(() => {
      this.loadSchedules(serverId);
      this.snackBar.open('Schedule deleted', 'OK', { duration: 3000 });
    });
  }
}
