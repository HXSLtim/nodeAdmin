import { Module } from '@nestjs/common';
import { RolesController } from './rolesController';
import { RolesService } from './rolesService';

@Module({
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
