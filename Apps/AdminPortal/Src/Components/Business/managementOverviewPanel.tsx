import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/Ui/card';
import { useApiClient } from '@/Hooks/useApiClient';

interface OverviewResponse {
  stats: Array<{ label: string; value: string }>;
  todos: string[];
}

interface HealthResponse {
  service: string;
  status: string;
  timestamp: string;
  version: string;
}

export function ManagementOverviewPanel(): JSX.Element {
  const apiClient = useApiClient();
  const overviewQuery = useQuery({
    queryFn: () => apiClient.get<OverviewResponse>('/api/v1/console/overview'),
    queryKey: ['console-overview'],
  });
  const healthQuery = useQuery({
    queryFn: () => apiClient.get<HealthResponse>('/api/v1/health'),
    queryKey: ['health'],
    staleTime: 60_000,
  });

  const stats = overviewQuery.data?.stats ?? [];
  const todos = overviewQuery.data?.todos ?? [];

  const healthVersion = healthQuery.isLoading
    ? '...'
    : healthQuery.isError || !healthQuery.data
      ? 'Unavailable'
      : `v${healthQuery.data.version}`;
  const healthStatus = healthQuery.isLoading
    ? '...'
    : healthQuery.isError || !healthQuery.data
      ? 'Unavailable'
      : `${healthQuery.data.service} / ${healthQuery.data.status}`;

  return (
    <section className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Platform Overview</CardTitle>
          <CardDescription>Operational metrics and current delivery focus.</CardDescription>
        </CardHeader>
      </Card>

      {overviewQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading dashboard metrics...</p> : null}
      {overviewQuery.isError ? <p className="text-sm text-destructive">Failed to load dashboard data.</p> : null}

      <Card>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground">CoreApi version</p>
          <p className="text-xl font-semibold">{healthVersion}</p>
          <p className="text-xs text-muted-foreground">{healthStatus}</p>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-3">
          <h3 className="text-sm font-semibold">Current focus</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {todos.map((todo) => (
              <li key={todo}>{todo}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
