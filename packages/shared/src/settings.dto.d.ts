export interface SettingDto {
    id: number;
    key: string;
    value: string;
}
export interface UpsertSettingDto {
    key: string;
    value: string;
}
