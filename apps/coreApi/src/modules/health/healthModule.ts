import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../../infrastructure/infrastructureModule';
import { HealthController } from './healthController';
import { HealthService } from './healthService';

@Module({
  imports: [InfrastructureModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
