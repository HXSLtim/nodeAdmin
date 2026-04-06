export interface AuthPrincipal {
  principalType: 'user' | 'agent' | 'service';
  principalId: string;
  tenantId?: string;
  userId?: string;
  roles: string[];
  jti: string;
}
