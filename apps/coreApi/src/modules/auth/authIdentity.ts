import type { AuthPrincipal } from '../../infrastructure/tenant/authPrincipal';

export interface AuthIdentity extends AuthPrincipal {
  principalType: 'user';
  tenantId: string;
  userId: string;
}

export type { AuthPrincipal } from '../../infrastructure/tenant/authPrincipal';
