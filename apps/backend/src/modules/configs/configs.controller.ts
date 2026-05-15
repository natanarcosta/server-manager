import { Controller, Get, Put, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ConfigsService } from './configs.service';

@Controller('servers/:id/config')
export class ConfigsController {
  constructor(private readonly configsService: ConfigsService) {}

  @Get()
  getConfig(@Param('id', ParseIntPipe) id: number) {
    return this.configsService.getConfig(id);
  }

  @Put()
  updateConfig(@Param('id', ParseIntPipe) id: number, @Body() data: Record<string, any>) {
    return this.configsService.updateConfig(id, data);
  }
}
