-- 0016 seed: default tenant, admin roles, permissions, menus

-- Default tenant
INSERT INTO tenants (id, name, slug, is_active, config_json)
VALUES ('default', 'Default Tenant', 'default', 1, '{}')
ON CONFLICT (slug) DO NOTHING;

-- System roles
INSERT INTO roles (id, tenant_id, name, description, is_system) VALUES
  ('role-super-admin', 'default', 'super-admin', '系统超级管理员', 1),
  ('role-admin', 'default', 'admin', '租户管理员', 1),
  ('role-viewer', 'default', 'viewer', '只读用户', 1)
ON CONFLICT DO NOTHING;

-- Permissions
INSERT INTO permissions (id, code, name, module, description) VALUES
  ('perm-overview-view', 'overview:view', '查看概览', 'overview', NULL),
  ('perm-im-view', 'im:view', '查看即时通讯', 'im', NULL),
  ('perm-im-send', 'im:send', '发送消息', 'im', NULL),
  ('perm-user-view', 'users:view', '查看用户', 'users', NULL),
  ('perm-user-create', 'users:create', '创建用户', 'users', NULL),
  ('perm-user-update', 'users:update', '编辑用户', 'users', NULL),
  ('perm-user-delete', 'users:delete', '删除用户', 'users', NULL),
  ('perm-role-view', 'roles:view', '查看角色', 'roles', NULL),
  ('perm-role-create', 'roles:create', '创建角色', 'roles', NULL),
  ('perm-role-update', 'roles:update', '编辑角色', 'roles', NULL),
  ('perm-role-delete', 'roles:delete', '删除角色', 'roles', NULL),
  ('perm-menu-view', 'menus:view', '查看菜单', 'menus', NULL),
  ('perm-menu-manage', 'menus:manage', '管理菜单', 'menus', NULL),
  ('perm-tenant-view', 'tenants:view', '查看租户', 'tenants', NULL),
  ('perm-tenant-manage', 'tenants:manage', '管理租户', 'tenants', NULL),
  ('perm-release-view', 'release:view', '查看发布', 'release', NULL),
  ('perm-modernizer-view', 'modernizer:view', '查看代码分析', 'modernizer', NULL),
  ('perm-settings-view', 'settings:view', '查看设置', 'settings', NULL),
  ('perm-audit-view', 'audit:view', '查看审计日志', 'audit', NULL)
ON CONFLICT (code) DO NOTHING;

-- super-admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-super-admin', id FROM permissions
ON CONFLICT DO NOTHING;

-- admin gets all except tenant:manage
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-admin', id FROM permissions WHERE code != 'tenant:manage'
ON CONFLICT DO NOTHING;

-- viewer gets view-only permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role-viewer', id FROM permissions WHERE code LIKE '%:view'
ON CONFLICT DO NOTHING;

-- Default menus
INSERT INTO menus (id, parent_id, name, path, icon, sort_order, permission_code, is_visible) VALUES
  ('menu-group-overview', NULL, '平台概览', NULL, 'barChart', 0, NULL, 1),
  ('menu-overview', 'menu-group-overview', '概览', '/overview', 'bar', 0, 'overview:view', 1),
  ('menu-im', 'menu-group-overview', '即时通讯', '/im', 'chat', 1, 'im:view', 1),

  ('menu-group-access', NULL, '用户与权限', NULL, 'users', 1, NULL, 1),
  ('menu-users', 'menu-group-access', '用户管理', '/users', 'users', 0, 'users:view', 1),
  ('menu-roles', 'menu-group-access', '角色管理', '/roles', 'shield', 1, 'roles:view', 1),

  ('menu-group-system', NULL, '系统管理', NULL, 'settings', 2, NULL, 1),
  ('menu-audit', 'menu-group-system', '审计日志', '/audit', 'fileSearch', 0, 'audit:view', 1),
  ('menu-menus', 'menu-group-system', '菜单管理', '/menus', 'menu', 1, 'menus:view', 1),
  ('menu-tenants', 'menu-group-system', '租户管理', '/tenants', 'building', 2, 'tenants:view', 1),

  ('menu-group-devtools', NULL, '开发工具', NULL, 'code', 3, NULL, 1),
  ('menu-release', 'menu-group-devtools', '发布控制', '/release', 'rocket', 0, 'release:view', 1),
  ('menu-modernizer', 'menu-group-devtools', '代码分析', '/modernizer', 'search', 1, 'modernizer:view', 1),

  ('menu-settings', NULL, '系统设置', '/settings', 'gear', 4, 'settings:view', 1)
ON CONFLICT DO NOTHING;
