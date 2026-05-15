export type ScheduleType = 'restart' | 'backup' | 'update' | 'health_check';
export interface ScheduleDto {
    id: number;
    serverId: number;
    type: ScheduleType;
    cronExpression: string;
    enabled: boolean;
    payload: string | null;
    lastRunAt: string | null;
    nextRunAt: string | null;
    createdAt: string;
}
export interface CreateScheduleDto {
    serverId: number;
    type: ScheduleType;
    cronExpression: string;
    enabled: boolean;
    payload?: string;
}
export interface UpdateScheduleDto {
    cronExpression?: string;
    enabled?: boolean;
    payload?: string;
}
