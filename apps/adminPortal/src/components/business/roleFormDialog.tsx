import { useMutation, useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useState } from 'react';
import { type RoleItem, type PaginatedResponse } from '@nodeadmin/shared-types';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useApiClient } from '@/hooks/useApiClient';

interface PermissionItem {
  id: string;
  code: string;
  name: string;
  description: string;
  module: string;
}

interface RoleFormDialogProps {
  open: boolean;
  onClose: () => void;
  role?: RoleItem;
  onSaved: () => void;
}

export function RoleFormDialog({ onClose, onSaved, open, role }: RoleFormDialogProps): JSX.Element {
  const { formatMessage: t } = useIntl();
  const apiClient = useApiClient();

  const [name, setName] = useState(role?.name ?? '');
  const [description, setDescription] = useState(role?.description ?? '');
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    role?.permissions.map((p) => p.id) ?? []
  );

  const isEditMode = !!role;

  const permissionsQuery = useQuery({
    queryFn: () =>
      apiClient.get<PaginatedResponse<PermissionItem>>('/api/v1/permissions?limit=200'),
    queryKey: ['permissions'],
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; permissionIds: string[] }) => {
      if (isEditMode && role) {
        await apiClient.put(`/api/v1/roles/${role.id}`, data);
      } else {
        await apiClient.post('/api/v1/roles', data);
      }
    },
    onSuccess: () => {
      onSaved();
      handleClose();
    },
  });

  const permissions = permissionsQuery.data?.items ?? [];

  const groupedPermissions = permissions.reduce<Record<string, PermissionItem[]>>((acc, perm) => {
    if (!acc[perm.module]) {
      acc[perm.module] = [];
    }
    acc[perm.module].push(perm);
    return acc;
  }, {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({ name, description, permissionIds: selectedPermissionIds });
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSelectedPermissionIds([]);
    onClose();
  };

  const togglePermission = (id: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      title={t({ id: isEditMode ? 'roles.edit' : 'roles.create' })}
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">{t({ id: 'roles.fieldName' })}</Label>
            <Input id="role-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role-description">{t({ id: 'roles.fieldDescription' })}</Label>
            <Input
              id="role-description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ id: 'roles.fieldPermissions' })}</Label>
            {permissionsQuery.isLoading ? (
              <div className="text-sm text-muted-foreground">
                {t({ id: 'roles.loadingPermissions' })}
              </div>
            ) : (
              <div className="max-h-60 space-y-3 overflow-y-auto rounded-md border border-border p-3">
                {Object.entries(groupedPermissions).map(([module, modulePerms]) => (
                  <div key={module}>
                    <div className="mb-2 text-sm font-semibold text-foreground">{module}</div>
                    <div className="space-y-1 pl-2">
                      {modulePerms.map((perm) => (
                        <div className="flex items-center space-x-2" key={perm.id}>
                          <input
                            checked={selectedPermissionIds.includes(perm.id)}
                            className="h-4 w-4 rounded border-border"
                            id={`perm-${perm.id}`}
                            onChange={() => togglePermission(perm.id)}
                            type="checkbox"
                          />
                          <label
                            className="text-sm text-foreground cursor-pointer"
                            htmlFor={`perm-${perm.id}`}
                          >
                            {perm.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t({ id: 'common.cancel' })}
          </Button>
          <Button disabled={saveMutation.isPending} type="submit">
            {saveMutation.isPending ? '...' : t({ id: 'common.save' })}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
