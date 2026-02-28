import { ReactNode } from 'react';
import type { AppPermission } from '@nodeadmin/shared-types';
import { usePermissionStore } from '@/Stores/usePermissionStore';

interface RequirePermissionProps {
  children: ReactNode;
  permission: AppPermission;
}

export function RequirePermission({ children, permission }: RequirePermissionProps): JSX.Element {
  const hasPermission = usePermissionStore((state) => state.hasPermission(permission));

  if (!hasPermission) {
    return (
      <section className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        You do not have permission for this module: <strong>{permission}</strong>
      </section>
    );
  }

  return <>{children}</>;
}
