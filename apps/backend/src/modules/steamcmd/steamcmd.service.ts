import { Injectable, Logger } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class SteamcmdService {
  private readonly logger = new Logger(SteamcmdService.name);
  private readonly steamcmdPath: string;

  constructor() {
    this.steamcmdPath = process.env.STEAMCMD_PATH || 'steamcmd';
  }

  async updateApp(appId: string, installDir: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const args = [
        '+login', 'anonymous',
        '+force_install_dir', installDir,
        '+app_update', appId, 'validate',
        '+quit',
      ];

      const process = spawn(this.steamcmdPath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let output = '';

      process.stdout?.on('data', (data: Buffer) => {
        const line = data.toString();
        output += line;
        this.logger.log(`SteamCMD: ${line.trim()}`);
      });

      process.stderr?.on('data', (data: Buffer) => {
        output += data.toString();
      });

      process.on('exit', (code) => {
        if (code === 0) {
          this.logger.log(`SteamCMD update completed for appId ${appId}`);
          resolve(output);
        } else {
          this.logger.error(`SteamCMD failed with code ${code}`);
          reject(new Error(`SteamCMD exited with code ${code}`));
        }
      });

      process.on('error', (err) => {
        this.logger.error(`SteamCMD error: ${err.message}`);
        reject(err);
      });
    });
  }
}
