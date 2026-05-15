import { Controller, Get, Post, Param, ParseIntPipe } from '@nestjs/common';
import { BackupsService } from './backups.service';

@Controller('servers/:id/backups')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get()
  getBackups(@Param('id', ParseIntPipe) id: number) {
    return this.backupsService.getBackups(id);
  }

  @Post()
  createBackup(@Param('id', ParseIntPipe) id: number) {
    return this.backupsService.createBackup(id);
  }
}
