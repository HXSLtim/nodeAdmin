import { Module } from '@nestjs/common';
import { HealthModule } from '../Modules/Health/healthModule';
import { ImModule } from '../Modules/Im/imModule';

@Module({
  imports: [HealthModule, ImModule],
})
export class AppModule {}
