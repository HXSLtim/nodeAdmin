import { Module } from '@nestjs/common';
import { PermissionsController } from './permissionsController';
import { PermissionsService } from './permissionsService';

@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
