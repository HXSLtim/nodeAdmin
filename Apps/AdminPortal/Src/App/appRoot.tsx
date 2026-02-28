import { useEffect } from 'react';
import { Navigate, NavLink, Route, Routes, useParams } from 'react-router-dom';
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
  key: string;
  label: string;
  path: string;
  permission: AppPermission;
}

const navItems: NavItem[] = [
  { key: 'overview', label: 'Overview', path: '/overview', permission: 'overview:view' },
  { key: 'im', label: 'IM Operations', path: '/im', permission: 'im:view' },
  { key: 'tenant', label: 'Tenants', path: '/tenant', permission: 'tenant:view' },
  { key: 'release', label: 'Release', path: '/release', permission: 'release:view' },
  { key: 'settings', label: 'Settings', path: '/settings', permission: 'settings:view' },
];

function toNavLinkClassName(isActive: boolean): string {
  return [
    'inline-flex h-10 items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors',
    isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80',
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
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);
  const setPermissionsFromRoles = usePermissionStore((state) => state.setPermissionsFromRoles);
  const hasPermission = usePermissionStore((state) => state.hasPermission);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    setPermissionsFromRoles(readRolesFromEnv());
  }, [setPermissionsFromRoles]);

  const visibleNavItems = navItems.filter((item) => hasPermission(item.permission));

  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto mb-6 flex max-w-5xl items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Node Admin Console</h1>
          <p className="text-sm text-muted-foreground">AdminPortal powered by React Router, Tailwind and Zustand</p>

          <nav className="mt-4 flex flex-wrap gap-2">
            {visibleNavItems.map((navItem) => (
              <NavLink className={({ isActive }) => toNavLinkClassName(isActive)} key={navItem.key} to={navItem.path}>
                {navItem.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <button
          className="rounded-md border border-border bg-card px-3 py-2 text-sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          type="button"
        >
          {theme === 'dark' ? 'Switch To Light' : 'Switch To Dark'}
        </button>
      </div>

      <div className="mx-auto max-w-5xl">
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
      </div>
    </main>
  );
}
