import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServerDto, SystemMetricsDto, BackupDto, ScheduleDto, ServerConfigResponse } from '../models/types';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // Servers
  getServers(): Observable<ServerDto[]> {
    return this.http.get<ServerDto[]>(`${this.baseUrl}/servers`);
  }

  getServer(id: number): Observable<ServerDto> {
    return this.http.get<ServerDto>(`${this.baseUrl}/servers/${id}`);
  }

  createServer(data: Partial<ServerDto>): Observable<ServerDto> {
    return this.http.post<ServerDto>(`${this.baseUrl}/servers`, data);
  }

  deleteServer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/servers/${id}`);
  }

  startServer(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/servers/${id}/start`, {});
  }

  stopServer(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/servers/${id}/stop`, {});
  }

  restartServer(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/servers/${id}/restart`, {});
  }

  killServer(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/servers/${id}/kill`, {});
  }

  updateServerGame(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/servers/${id}/update`, {});
  }

  // Metrics
  getSystemMetrics(): Observable<SystemMetricsDto> {
    return this.http.get<SystemMetricsDto>(`${this.baseUrl}/metrics/system`);
  }

  // Config
  getServerConfig(id: number): Observable<ServerConfigResponse> {
    return this.http.get<ServerConfigResponse>(`${this.baseUrl}/servers/${id}/config`);
  }

  updateServerConfig(id: number, data: Record<string, any>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/servers/${id}/config`, data);
  }

  // Backups
  getBackups(serverId: number): Observable<BackupDto[]> {
    return this.http.get<BackupDto[]>(`${this.baseUrl}/servers/${serverId}/backups`);
  }

  createBackup(serverId: number): Observable<BackupDto> {
    return this.http.post<BackupDto>(`${this.baseUrl}/servers/${serverId}/backups`, {});
  }

  // Schedules
  getSchedules(serverId: number): Observable<ScheduleDto[]> {
    return this.http.get<ScheduleDto[]>(`${this.baseUrl}/servers/${serverId}/schedules`);
  }

  createSchedule(serverId: number, data: Partial<ScheduleDto>): Observable<ScheduleDto> {
    return this.http.post<ScheduleDto>(`${this.baseUrl}/servers/${serverId}/schedules`, data);
  }

  updateSchedule(serverId: number, scheduleId: number, data: Partial<ScheduleDto>): Observable<ScheduleDto> {
    return this.http.put<ScheduleDto>(`${this.baseUrl}/servers/${serverId}/schedules/${scheduleId}`, data);
  }

  deleteSchedule(serverId: number, scheduleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/servers/${serverId}/schedules/${scheduleId}`);
  }
}
