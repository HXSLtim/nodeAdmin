import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthIdentity } from '../auth/authIdentity';
import { PLUGIN_METADATA_KEY } from './plugin.decorator';
import { PluginService } from './pluginService';

@Injectable()
export class PluginGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly pluginService: PluginService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const pluginName = this.reflector.getAllAndOverride<string | undefined>(PLUGIN_METADATA_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!pluginName) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthIdentity }>();
    const tenantId = request.user?.tenantId;

    if (typeof tenantId !== 'string' || tenantId.trim().length === 0) {
      throw new ForbiddenException('Tenant context is required for plugin-protected routes');
    }

    const enabled = await this.pluginService.isPluginEnabled(tenantId, pluginName);
    if (!enabled) {
      throw new ForbiddenException(`Plugin '${pluginName}' is not enabled for this tenant`);
    }

    return true;
  }
}
