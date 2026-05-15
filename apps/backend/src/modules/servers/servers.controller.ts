import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { ServersService } from './servers.service';
import { CreateServerDto, UpdateServerDto } from '@server-manager/shared';

@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get()
  findAll() {
    return this.serversService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateServerDto) {
    return this.serversService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateServerDto) {
    return this.serversService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.delete(id);
  }

  @Post(':id/start')
  start(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.startServer(id);
  }

  @Post(':id/stop')
  stop(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.stopServer(id);
  }

  @Post(':id/restart')
  restart(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.restartServer(id);
  }

  @Post(':id/kill')
  kill(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.killServer(id);
  }

  @Post(':id/update')
  updateServer(@Param('id', ParseIntPipe) id: number) {
    return this.serversService.updateServer(id);
  }
}
