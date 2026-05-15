import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { CreateScheduleDto, UpdateScheduleDto } from '@server-manager/shared';

@Controller('servers/:serverId/schedules')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  @Get()
  findAll(@Param('serverId', ParseIntPipe) serverId: number) {
    return this.schedulerService.findAll(serverId);
  }

  @Post()
  create(
    @Param('serverId', ParseIntPipe) serverId: number,
    @Body() dto: Omit<CreateScheduleDto, 'serverId'>,
  ) {
    return this.schedulerService.create({ ...dto, serverId });
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateScheduleDto) {
    return this.schedulerService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.schedulerService.delete(id);
  }
}
