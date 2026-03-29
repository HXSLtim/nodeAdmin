import { Module } from '@nestjs/common';
import { ModernizerController } from './modernizerController';
import { AnalyzeService } from './analyzeService';
import { DocSyncService } from './docSyncService';

@Module({
  controllers: [ModernizerController],
  providers: [AnalyzeService, DocSyncService],
})
export class ModernizerModule {}
