import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule, MatListModule],
  template: `
    <div class="sidebar">
      <div class="logo">
        <mat-icon class="text-primary-400">dns</mat-icon>
        <span class="logo-text">Server Manager</span>
      </div>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <mat-icon>dashboard</mat-icon>
          <span>Dashboard</span>
        </a>
        <a routerLink="/servers" routerLinkActive="active" class="nav-item">
          <mat-icon>storage</mat-icon>
          <span>Servers</span>
        </a>
        <a routerLink="/scheduler" routerLinkActive="active" class="nav-item">
          <mat-icon>schedule</mat-icon>
          <span>Scheduler</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .sidebar {
      width: 240px;
      height: 100vh;
      background: #1e1e2e;
      border-right: 1px solid #313244;
      display: flex;
      flex-direction: column;
      padding: 16px 0;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 20px 24px;
      border-bottom: 1px solid #313244;
      margin-bottom: 16px;
    }
    .logo mat-icon { font-size: 28px; width: 28px; height: 28px; }
    .logo-text { font-size: 18px; font-weight: 600; color: #cdd6f4; }
    nav { display: flex; flex-direction: column; gap: 4px; padding: 0 8px; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-radius: 8px;
      color: #a6adc8;
      text-decoration: none;
      font-size: 14px;
      transition: all 0.2s;
    }
    .nav-item:hover { background: #313244; color: #cdd6f4; }
    .nav-item.active { background: #3b82f6; color: #fff; }
    .nav-item mat-icon { font-size: 20px; width: 20px; height: 20px; }
  `]
})
export class SidebarComponent {}
