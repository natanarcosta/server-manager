import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'servers',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },
  {
    path: 'servers/:id',
    loadComponent: () =>
      import('./pages/server-detail/server-detail.component').then((m) => m.ServerDetailComponent),
  },
  {
    path: 'servers/:id/config',
    loadComponent: () =>
      import('./pages/config-editor/config-editor.component').then((m) => m.ConfigEditorComponent),
  },
  {
    path: 'scheduler',
    loadComponent: () =>
      import('./pages/scheduler/scheduler.component').then((m) => m.SchedulerComponent),
  },
  { path: '**', redirectTo: '/dashboard' },
];
