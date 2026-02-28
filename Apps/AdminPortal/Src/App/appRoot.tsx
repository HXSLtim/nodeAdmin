import { useEffect } from 'react';
import { Navigate, NavLink, Route, Routes, useLocation, useParams } from 'react-router-dom';
import type { AppPermission } from '@nodeadmin/shared-types';
import { ManagementOverviewPanel } from '@/Components/Business/managementOverviewPanel';
import { MessagePanel } from '@/Components/Business/messagePanel';
import { ReleaseControlPanel } from '@/Components/Business/releaseControlPanel';
import { TenantControlPanel } from '@/Components/Business/tenantControlPanel';
import { usePermissionStore } from '@/Stores/usePermissionStore';
import { useUiStore } from '@/Stores/useUiStore';
import { ModuleErrorBoundary } from './moduleErrorBoundary';
import { RequirePermission } from './requirePermission';

interface NavItem {
  icon: string;
  key: string;
  label: string;
  path: string;
  permission: AppPermission;
}

const navItems: NavItem[] = [
  { icon: '📊', key: 'overview', label: 'Overview', path: '/overview', permission: 'overview:view' },
  { icon: '💬', key: 'im', label: 'IM Operations', path: '/im', permission: 'im:view' },
  { icon: '👥', key: 'tenant', label: 'Tenants', path: '/tenant', permission: 'tenant:view' },
  { icon: '🚀', key: 'release', label: 'Release', path: '/release', permission: 'release:view' },
  { icon: '⚙', key: 'settings', label: 'Settings', path: '/settings', permission: 'settings:view' },
];

function isNavItemActive(pathname: string, navPath: string): boolean {
  return pathname === navPath || pathname.startsWith(`${navPath}/`);
}

function resolveCurrentPageTitle(pathname: string): string {
  if (pathname === '/') {
    return 'Overview';
  }

  const matchedNavItem = navItems.find((navItem) => isNavItemActive(pathname, navItem.path));
  return matchedNavItem?.label ?? 'Node Admin';
}

function toSidebarClassName(sidebarCollapsed: boolean): string {
  return [
    'flex shrink-0 flex-col border-r bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))] transition-all duration-200',
    sidebarCollapsed ? 'w-16' : 'w-60',
  ].join(' ');
}

function toSidebarNavLinkClassName(isActive: boolean, sidebarCollapsed: boolean): string {
  return [
    'flex h-10 items-center rounded-md text-sm font-medium transition-colors',
    sidebarCollapsed ? 'justify-center px-2' : 'gap-3 px-3',
    isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-[hsl(var(--sidebar-accent))]',
  ].join(' ');
}

function ImConversationRoute(): JSX.Element {
  const { convId } = useParams<{ convId: string }>();

  return <MessagePanel conversationIdOverride={convId} />;
}

function RouteModule({ children }: { children: JSX.Element }): JSX.Element {
  return <ModuleErrorBoundary>{children}</ModuleErrorBoundary>;
}

function readRolesFromEnv(): string[] {
  const rolesRaw = (import.meta.env.VITE_IM_ROLES as string | undefined)?.trim();
  if (!rolesRaw) {
    return ['tenant:admin'];
  }

  const roles = rolesRaw
    .split(',')
    .map((role) => role.trim())
    .filter((role) => role.length > 0);
  return roles.length > 0 ? roles : ['tenant:admin'];
}

export function AppRoot(): JSX.Element {
  const location = useLocation();
  const sidebarCollapsed = useUiStore((state) => state.sidebarCollapsed);
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const setPermissionsFromRoles = usePermissionStore((state) => state.setPermissionsFromRoles);
  const hasPermission = usePermissionStore((state) => state.hasPermission);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    setPermissionsFromRoles(readRolesFromEnv());
  }, [setPermissionsFromRoles]);

  const visibleNavItems = navItems.filter((item) => hasPermission(item.permission));
  const currentPageTitle = resolveCurrentPageTitle(location.pathname);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <aside className={toSidebarClassName(sidebarCollapsed)}>
        <div className="flex h-14 items-center border-b px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground">
            NA
          </div>
          {!sidebarCollapsed ? <span className="ml-3 text-sm font-semibold">Node Admin</span> : null}
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {visibleNavItems.map((navItem) => (
            <NavLink
              className={({ isActive }) => toSidebarNavLinkClassName(isActive, sidebarCollapsed)}
              key={navItem.key}
              to={navItem.path}
            >
              <span className="text-base leading-none">{navItem.icon}</span>
              {!sidebarCollapsed ? <span className="truncate">{navItem.label}</span> : null}
            </NavLink>
          ))}
        </nav>

        <div className="border-t p-2">
          <p className="mb-2 text-center text-xs text-muted-foreground">v0.1.0</p>
          <button
            className="flex h-9 w-full items-center justify-center rounded-md border border-border bg-card text-sm transition-colors hover:bg-accent"
            onClick={toggleSidebar}
            type="button"
          >
            {sidebarCollapsed ? '»' : '«'}
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-card px-6">
          <h1 className="text-base font-semibold">{currentPageTitle}</h1>
          <div className="flex items-center gap-3">
            <button
              className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-base transition-colors hover:bg-accent"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              type="button"
            >
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Routes>
            <Route element={<Navigate replace to="/overview" />} path="/" />
            <Route
              element={
                <RouteModule>
                  <RequirePermission permission="overview:view">
                    <ManagementOverviewPanel />
                  </RequirePermission>
                </RouteModule>
              }
              path="/overview"
            />
            <Route
              element={
                <RouteModule>
                  <RequirePermission permission="im:view">
                    <MessagePanel />
                  </RequirePermission>
                </RouteModule>
              }
              path="/im"
            />
            <Route
              element={
                <RouteModule>
                  <RequirePermission permission="im:view">
                    <ImConversationRoute />
                  </RequirePermission>
                </RouteModule>
              }
              path="/im/:convId"
            />
            <Route
              element={
                <RouteModule>
                  <RequirePermission permission="tenant:view">
                    <TenantControlPanel />
                  </RequirePermission>
                </RouteModule>
              }
              path="/tenant"
            />
            <Route
              element={
                <RouteModule>
                  <RequirePermission permission="release:view">
                    <ReleaseControlPanel />
                  </RequirePermission>
                </RouteModule>
              }
              path="/release"
            />
            <Route
              element={
                <RouteModule>
                  <RequirePermission permission="settings:view">
                    <section className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
                      Settings module is reserved for platform administrators.
                    </section>
                  </RequirePermission>
                </RouteModule>
              }
              path="/settings"
            />
            <Route element={<Navigate replace to="/overview" />} path="*" />
          </Routes>
        </main>
      </div>
    </div>
  );
}
