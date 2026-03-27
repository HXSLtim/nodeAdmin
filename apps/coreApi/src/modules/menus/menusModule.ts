import { Module } from '@nestjs/common';
import { MenusController } from './menusController';
import { MenusService } from './menusService';

@Module({
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService],
})
export class MenusModule {}
