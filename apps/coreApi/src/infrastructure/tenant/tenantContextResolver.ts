import { Injectable } from '@nestjs/common';
import { runtimeConfig } from '../../app/runtimeConfig';
import type { AuthPrincipal } from './authPrincipal';

export interface TenantContext {
  tenantId: string;
  source: 'jwt' | 'default' | 'system';
}

@Injectable()
export class TenantContextResolver {
  resolve(principal?: AuthPrincipal): TenantContext {
    if (runtimeConfig.tenant.singleTenantMode) {
      return {
        source: 'default',
        tenantId: runtimeConfig.tenant.defaultTenantId,
      };
    }

    const tenantId = principal?.tenantId?.trim();
    if (!tenantId) {
      throw new Error('Tenant context is missing for the authenticated principal.');
    }

    return {
      source: 'jwt',
      tenantId,
    };
  }
}
