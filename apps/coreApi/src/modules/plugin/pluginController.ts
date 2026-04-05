import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/currentUser.decorator';
import type { AuthIdentity } from '../auth/authIdentity';
import { PluginService } from './pluginService';

@ApiTags('plugins')
@ApiBearerAuth()
@Controller('tenants/me/plugins')
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Get()
  @ApiOperation({ summary: 'List plugins enabled or configured for the current tenant' })
  async findMine(@CurrentUser() identity: AuthIdentity) {
    return {
      plugins: await this.pluginService.listTenantPlugins(identity.tenantId),
    };
  }
}
