import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './prisma/prisma.module';
import { ServersModule } from './modules/servers/servers.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { ConfigsModule } from './modules/configs/configs.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { BackupsModule } from './modules/backups/backups.module';
import { SteamcmdModule } from './modules/steamcmd/steamcmd.module';
import { LogsModule } from './modules/logs/logs.module';
import { WebsocketModule } from './modules/websocket/websocket.module';
import { SettingsModule } from './modules/settings/settings.module';
import { GamesModule } from './modules/games/games.module';
import { FilesystemModule } from './shared/filesystem/filesystem.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    PrismaModule,
    FilesystemModule,
    ServersModule,
    MetricsModule,
    ConfigsModule,
    SchedulerModule,
    BackupsModule,
    SteamcmdModule,
    LogsModule,
    WebsocketModule,
    SettingsModule,
    GamesModule,
  ],
})
export class AppModule {}
