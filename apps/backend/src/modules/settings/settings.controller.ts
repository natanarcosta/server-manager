import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from '@server-manager/shared';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  get(@Param('key') key: string) {
    return this.settingsService.get(key);
  }

  @Post()
  set(@Body() dto: UpsertSettingDto) {
    return this.settingsService.set(dto);
  }

  @Delete(':key')
  delete(@Param('key') key: string) {
    return this.settingsService.delete(key);
  }
}
