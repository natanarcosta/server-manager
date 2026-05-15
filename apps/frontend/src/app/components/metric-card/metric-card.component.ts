import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressBarModule],
  template: `
    <div class="metric-card">
      <div class="metric-header">
        <mat-icon [style.color]="iconColor">{{ icon }}</mat-icon>
        <span class="metric-title">{{ title }}</span>
      </div>
      <div class="metric-value">{{ value }}</div>
      <div class="metric-subtitle" *ngIf="subtitle">{{ subtitle }}</div>
      <mat-progress-bar
        *ngIf="progress !== undefined"
        mode="determinate"
        [value]="progress"
        [color]="progress > 80 ? 'warn' : 'primary'"
      ></mat-progress-bar>
    </div>
  `,
  styles: [`
    .metric-card {
      background: #1e1e2e;
      border: 1px solid #313244;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .metric-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .metric-header mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .metric-title { font-size: 13px; color: #a6adc8; text-transform: uppercase; letter-spacing: 0.5px; }
    .metric-value { font-size: 28px; font-weight: 700; color: #cdd6f4; }
    .metric-subtitle { font-size: 12px; color: #6c7086; }
    mat-progress-bar { border-radius: 4px; margin-top: 4px; }
  `]
})
export class MetricCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() subtitle = '';
  @Input() icon = 'info';
  @Input() iconColor = '#3b82f6';
  @Input() progress?: number;
}
