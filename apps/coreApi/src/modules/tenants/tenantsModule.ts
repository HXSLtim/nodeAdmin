import { Module } from '@nestjs/common';
import { TenantsController } from './tenantsController';
import { TenantsService } from './tenantsService';

@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
