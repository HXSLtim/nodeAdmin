import { Module } from '@nestjs/common';
import { ConversationRepository } from '../../Infrastructure/Database/conversationRepository';
import { DatabaseService } from '../../Infrastructure/Database/databaseService';
import { InfrastructureModule } from '../../Infrastructure/infrastructureModule';
import { ConsoleController, MetricsController } from './consoleController';

@Module({
  imports: [InfrastructureModule],
  controllers: [ConsoleController, MetricsController],
  providers: [DatabaseService, ConversationRepository],
})
export class ConsoleModule {}
