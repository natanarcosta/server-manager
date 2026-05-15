import { Module } from '@nestjs/common';
import { SchedulerController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';
import { ServersModule } from '../servers/servers.module';
import { BackupsModule } from '../backups/backups.module';

@Module({
  imports: [ServersModule, BackupsModule],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
