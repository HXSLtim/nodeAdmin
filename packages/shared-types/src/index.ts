export type ImMessageType = 'file' | 'image' | 'system' | 'text';

export interface MessageMetadata {
  fileName?: string;
  fileSizeBytes?: number;
  url?: string;
}

export interface ImMessage {
  content: string;
  conversationId: string;
  createdAt: string;
  messageId: string;
  messageType: ImMessageType;
  metadata: MessageMetadata | null;
  sequenceId: number;
  tenantId: string;
  traceId: string;
  userId: string;
}

export interface AuthIdentitySnapshot {
  roles: string[];
  tenantId: string;
  userId: string;
}

export type AppPermission =
  | 'im:send'
  | 'im:view'
  | 'menus:manage'
  | 'menus:view'
  | 'overview:view'
  | 'release:view'
  | 'roles:manage'
  | 'roles:view'
  | 'settings:view'
  | 'tenant:view'
  | 'users:manage'
  | 'users:view';

// ─── API Response Types ──────────────────────────────────────────────

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserItem;
}

export interface UserItem {
  created_at: string;
  email: string;
  id: string;
  is_active: boolean;
  name: string;
  roles: RoleItem[];
  tenant_id: string;
  updated_at: string;
}

export interface RoleItem {
  created_at: string;
  description: string;
  id: string;
  is_system: boolean;
  name: string;
  permissions: PermissionItem[];
  tenant_id: string;
  updated_at: string;
}

export interface PermissionItem {
  code: string;
  description: string;
  id: string;
  module: string;
  name: string;
}

export interface MenuItem {
  children: MenuItem[];
  icon: string;
  id: string;
  is_visible: boolean;
  name: string;
  parent_id: string | null;
  path: string;
  permission_code: string;
  sort_order: number;
  tenant_id: string;
}

export interface TenantItem {
  created_at: string;
  id: string;
  is_active: boolean;
  name: string;
  plan: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  limit: number;
  offset: number;
  total: number;
}
