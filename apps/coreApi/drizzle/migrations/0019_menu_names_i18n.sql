-- Update menu names from Chinese display text to i18n keys
-- This allows the sidebar to translate menu names based on the user's locale

-- Leaf menus: use existing i18n keys from en.json / zh.json
UPDATE menus SET name = 'nav.overview' WHERE id = 'menu-overview';
UPDATE menus SET name = 'nav.im' WHERE id = 'menu-im';
UPDATE menus SET name = 'nav.users' WHERE id = 'menu-users';
UPDATE menus SET name = 'nav.roles' WHERE id = 'menu-roles';
UPDATE menus SET name = 'nav.audit' WHERE id = 'menu-audit';
UPDATE menus SET name = 'nav.menus' WHERE id = 'menu-menus';
UPDATE menus SET name = 'nav.tenants' WHERE id = 'menu-tenants';
UPDATE menus SET name = 'nav.release' WHERE id = 'menu-release';
UPDATE menus SET name = 'nav.modernizer' WHERE id = 'menu-modernizer';
UPDATE menus SET name = 'nav.settings' WHERE id = 'menu-settings';
UPDATE menus SET name = 'nav.backlog' WHERE id = 'menu-backlog';

-- Group menus: use i18n keys (will add to locale files)
UPDATE menus SET name = 'nav.group.overview' WHERE id = 'menu-group-overview';
UPDATE menus SET name = 'nav.group.access' WHERE id = 'menu-group-access';
UPDATE menus SET name = 'nav.group.system' WHERE id = 'menu-group-system';
UPDATE menus SET name = 'nav.group.devtools' WHERE id = 'menu-group-devtools';
