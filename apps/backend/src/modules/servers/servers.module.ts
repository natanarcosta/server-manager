import { Module, forwardRef } from '@nestjs/common';
import { ServersController } from './servers.controller';
import { ServersService } from './servers.service';
import { ProcessManagerService } from './process-manager.service';
import { GamesModule } from '../games/games.module';
import { LogsModule } from '../logs/logs.module';

@Module({
  imports: [
    forwardRef(() => GamesModule),
    forwardRef(() => LogsModule),
  ],
  controllers: [ServersController],
  providers: [ServersService, ProcessManagerService],
  exports: [ServersService, ProcessManagerService],
})
export class ServersModule {}
