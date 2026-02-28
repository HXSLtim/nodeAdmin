import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/Components/Ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/Components/Ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/Ui/table';
import { useApiClient } from '@/Hooks/useApiClient';

interface TenantRow {
  key: string;
  name: string;
  roleCount: number;
  status: 'active' | 'review';
}

interface TenantResponse {
  rows: TenantRow[];
}

export function TenantControlPanel(): JSX.Element {
  const apiClient = useApiClient();
  const tenantQuery = useQuery({
    queryFn: () => apiClient.get<TenantResponse>('/api/v1/console/tenants'),
    queryKey: ['console-tenants'],
  });

  const tenantRows = tenantQuery.data?.rows ?? [];

  return (
    <Card className="p-4">
      <CardHeader className="mb-3 p-0">
        <CardTitle className="text-base">Tenants and Roles</CardTitle>
        <CardDescription>Inspect tenant status, role footprint, and review progression.</CardDescription>
      </CardHeader>

      {tenantQuery.isLoading ? <p className="mb-3 text-sm text-muted-foreground">Loading tenant data...</p> : null}
      {tenantQuery.isError ? <p className="mb-3 text-sm text-destructive">Failed to load tenant data.</p> : null}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tenant ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role Count</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tenantRows.map((tenant) => (
            <TableRow key={tenant.key}>
              <TableCell className="font-medium">{tenant.key}</TableCell>
              <TableCell>{tenant.name}</TableCell>
              <TableCell>{tenant.roleCount}</TableCell>
              <TableCell>
                <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>{tenant.status}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
