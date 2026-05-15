export type ConfigFieldType = 'string' | 'number' | 'boolean' | 'select';

export interface ConfigFieldSchema {
  type: ConfigFieldType;
  label: string;
  description?: string;
  defaultValue?: string | number | boolean;
  min?: number;
  max?: number;
  options?: string[];
  required?: boolean;
}

export type ConfigSchema = Record<string, ConfigFieldSchema>;
