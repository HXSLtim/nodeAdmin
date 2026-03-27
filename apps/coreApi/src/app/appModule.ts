import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OutboxPublisherService } from '../infrastructure/outbox/outboxPublisherService';
import { AuthModule } from '../modules/auth/authModule';
import { ConsoleModule } from '../modules/console/consoleModule';
import { HealthModule } from '../modules/health/healthModule';
import { ImModule } from '../modules/im/imModule';
import { PermissionsModule } from '../modules/permissions/permissionsModule';
import { RolesModule } from '../modules/roles/rolesModule';
import { UsersModule } from '../modules/users/usersModule';

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, isGlobal: true }),
    HealthModule,
    AuthModule,
    ImModule,
    ConsoleModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
  ],
  providers: [OutboxPublisherService],
})
export class AppModule {}
