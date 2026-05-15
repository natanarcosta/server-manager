import { Injectable } from '@nestjs/common';
import { GameProvider, GameDefinition } from '../../shared/types/game-provider.interface';
import { PalworldProvider, PalworldDefinition } from './palworld/palworld.provider';
import { EnshroudedProvider, EnshroudedDefinition } from './enshrouded/enshrouded.provider';
import { WindroseProvider, WindroseDefinition } from './windrose/windrose.provider';
import { ProcessManagerService } from '../servers/process-manager.service';
import { FilesystemService } from '../../shared/filesystem/filesystem.service';
import { SteamcmdService } from '../steamcmd/steamcmd.service';
import { BackupsService } from '../backups/backups.service';
import { LogsService } from '../logs/logs.service';
import { Server } from '@prisma/client';

@Injectable()
export class GamesService {
  private readonly definitions: Map<string, GameDefinition> = new Map();

  constructor(
    private readonly processManager: ProcessManagerService,
    private readonly filesystem: FilesystemService,
    private readonly steamcmd: SteamcmdService,
    private readonly backupsService: BackupsService,
    private readonly logsService: LogsService,
  ) {
    this.definitions.set('palworld', PalworldDefinition);
    this.definitions.set('enshrouded', EnshroudedDefinition);
    this.definitions.set('windrose', WindroseDefinition);
  }

  getProvider(server: Server): GameProvider {
    switch (server.game) {
      case 'palworld':
        return new PalworldProvider(
          server, this.processManager, this.filesystem,
          this.steamcmd, this.backupsService, this.logsService,
        );
      case 'enshrouded':
        return new EnshroudedProvider(
          server, this.processManager, this.filesystem,
          this.steamcmd, this.backupsService, this.logsService,
        );
      case 'windrose':
        return new WindroseProvider(
          server, this.processManager, this.filesystem,
          this.steamcmd, this.backupsService, this.logsService,
        );
      default:
        throw new Error(`Unsupported game: ${server.game}`);
    }
  }

  getDefinition(game: string): GameDefinition | undefined {
    return this.definitions.get(game);
  }

  getSupportedGames(): GameDefinition[] {
    return Array.from(this.definitions.values());
  }
}
