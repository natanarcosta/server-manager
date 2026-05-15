import { Module, forwardRef } from '@nestjs/common';
import { GamesService } from './games.service';
import { ServersModule } from '../servers/servers.module';
import { FilesystemModule } from '../../shared/filesystem/filesystem.module';
import { SteamcmdModule } from '../steamcmd/steamcmd.module';
import { BackupsModule } from '../backups/backups.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    forwardRef(() => ServersModule),
    FilesystemModule,
    forwardRef(() => SteamcmdModule),
    forwardRef(() => BackupsModule),
    forwardRef(() => LogsModule),
  ],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}
