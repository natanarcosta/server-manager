import * as ini from 'ini';
import { FilesystemService } from '../../../shared/filesystem/filesystem.service';

export class PalworldConfigAdapter {
  constructor(private readonly filesystem: FilesystemService) {}

  async read(configPath: string): Promise<Record<string, any>> {
    const content = await this.filesystem.readFile(configPath);
    const parsed = ini.parse(content);
    const settings = parsed['/Script/Pal.PalGameWorldSettings'] || {};
    const optionString = settings.OptionSettings || '';

    const config: Record<string, any> = {};
    if (typeof optionString === 'string' && optionString.startsWith('(') && optionString.endsWith(')')) {
      const inner = optionString.slice(1, -1);
      const pairs = inner.split(',');
      for (const pair of pairs) {
        const eqIdx = pair.indexOf('=');
        if (eqIdx !== -1) {
          const key = pair.substring(0, eqIdx).trim();
          let value: any = pair.substring(eqIdx + 1).trim();
          if (value === 'True') value = true;
          else if (value === 'False') value = false;
          else if (!isNaN(Number(value)) && value !== '') value = Number(value);
          else value = value.replace(/^"|"$/g, '');
          config[key] = value;
        }
      }
    }

    return config;
  }

  async write(configPath: string, data: Record<string, any>): Promise<void> {
    const pairs = Object.entries(data).map(([key, value]) => {
      if (typeof value === 'boolean') return `${key}=${value ? 'True' : 'False'}`;
      if (typeof value === 'string') return `${key}="${value}"`;
      return `${key}=${value}`;
    });

    const optionSettings = `(${pairs.join(',')})`;
    const config = {
      '/Script/Pal.PalGameWorldSettings': {
        OptionSettings: optionSettings,
      },
    };

    const content = ini.stringify(config);
    await this.filesystem.writeFile(configPath, content);
  }
}
