import { Module, forwardRef } from '@nestjs/common';
import { ConfigsController } from './configs.controller';
import { ConfigsService } from './configs.service';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [forwardRef(() => GamesModule)],
  controllers: [ConfigsController],
  providers: [ConfigsService],
  exports: [ConfigsService],
})
export class ConfigsModule {}
