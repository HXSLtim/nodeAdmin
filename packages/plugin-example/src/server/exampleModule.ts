import { Module } from '@nestjs/common';
import { ExampleController } from './exampleController';

@Module({
  controllers: [ExampleController],
})
export class ExampleModule {}
