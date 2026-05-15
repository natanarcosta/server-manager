import { Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { FilesystemModule } from '../../shared/filesystem/filesystem.module';

@Module({
  imports: [FilesystemModule],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
