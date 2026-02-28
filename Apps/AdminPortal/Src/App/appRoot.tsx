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

function NavIcon({ name }: { name: string }): JSX.Element {
  const paths: Record<string, string> = {
    bar: 'M4 20h4V10H4zm6 0h4V4h-4zm6 0h4v-8h-4z',
    chat: 'M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z',
    gear: 'M19.14 12.94a7.07 7.07 0 000-1.88l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96a7.04 7.04 0 00-1.63-.94l-.36-2.54A.48.48 0 0013.92 2h-3.84a.48.48 0 00-.48.41l-.36 2.54a7.04 7.04 0 00-1.63.94l-2.39-.96a.49.49 0 00-.59.22L2.71 8.47a.49.49 0 00.12.61l2.03 1.58a7.07 7.07 0 000 1.88l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32a.49.49 0 00.59.22l2.39-.96c.5.38 1.04.7 1.63.94l.36 2.54a.48.48 0 00.48.41h3.84a.48.48 0 00.48-.41l.36-2.54c.59-.24 1.13-.56 1.63-.94l2.39.96a.49.49 0 00.59-.22l1.92-3.32a.49.49 0 00-.12-.61zM12 15.5A3.5 3.5 0 1115.5 12 3.5 3.5 0 0112 15.5z',
    rocket: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2zm6.9-2.54A2 2 0 0016 16h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41A7.99 7.99 0 0120 12c0 2.08-.8 3.97-2.1 5.39z',
    users: 'M16 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 3-1.34 3-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05A4.22 4.22 0 0119 16.5V19h4v-2.5c0-2.33-4.67-3.5-7-3.5z',
  };

  return (
    <svg className="h-5 w-5 shrink-0" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d={paths[name] ?? paths.bar} />
    </svg>
  );
}

const navItems: NavItem[] = [
  { icon: 'bar', key: 'overview', label: 'Overview', path: '/overview', permission: 'overview:view' },
  { icon: 'chat', key: 'im', label: 'IM Operations', path: '/im', permission: 'im:view' },
  { icon: 'users', key: 'tenant', label: 'Tenants', path: '/tenant', permission: 'tenant:view' },
  { icon: 'rocket', key: 'release', label: 'Release', path: '/release', permission: 'release:view' },
  { icon: 'gear', key: 'settings', label: 'Settings', path: '/settings', permission: 'settings:view' },
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
              <NavIcon name={navItem.icon} />
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
              {theme === 'dark' ? (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zm0-5a1 1 0 011 1v1a1 1 0 01-2 0V3a1 1 0 011-1zm0 18a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1zM5.64 5.64a1 1 0 011.41 0l.71.71a1 1 0 01-1.41 1.41l-.71-.71a1 1 0 010-1.41zm12.02 12.02a1 1 0 011.41 0l.71.71a1 1 0 01-1.41 1.41l-.71-.71a1 1 0 010-1.41zM2 12a1 1 0 011-1h1a1 1 0 010 2H3a1 1 0 01-1-1zm18 0a1 1 0 011-1h1a1 1 0 010 2h-1a1 1 0 01-1-1zM5.64 18.36a1 1 0 010-1.41l.71-.71a1 1 0 011.41 1.41l-.71.71a1 1 0 01-1.41 0zm12.02-12.02a1 1 0 010-1.41l.71-.71a1 1 0 011.41 1.41l-.71.71a1 1 0 01-1.41 0z" /></svg>
              ) : (
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" /></svg>
              )}
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
