import { Module } from '@nestjs/common';
import { ConversationRepository } from '../../Infrastructure/Database/conversationRepository.js';
import { DatabaseService } from '../../Infrastructure/Database/databaseService.js';
import { InfrastructureModule } from '../../Infrastructure/infrastructureModule';
import { ConsoleController } from './consoleController';

@Module({
  imports: [InfrastructureModule],
  controllers: [ConsoleController],
  providers: [DatabaseService, ConversationRepository],
})
export class ConsoleModule {}
