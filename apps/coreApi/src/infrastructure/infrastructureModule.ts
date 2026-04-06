import { Module } from '@nestjs/common';
import { AuditLogService } from './audit/auditLogService';
import { AuditLogRepository } from './database/auditLogRepository';
import { DatabaseService } from './database/databaseService';
import { TenantContextResolver } from './tenant/tenantContextResolver';
import { TenantScopedExecutor } from './tenant/tenantScopedExecutor';

@Module({
  providers: [
    DatabaseService,
    TenantContextResolver,
    TenantScopedExecutor,
    {
      provide: AuditLogRepository,
      useFactory: (databaseService: DatabaseService) => {
        if (!databaseService.drizzle) {
          return null;
        }
        return new AuditLogRepository(databaseService.drizzle);
      },
      inject: [DatabaseService],
    },
    AuditLogService,
  ],
  exports: [AuditLogService, DatabaseService, TenantContextResolver, TenantScopedExecutor],
})
export class InfrastructureModule {}
