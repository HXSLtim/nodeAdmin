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

const statBorderClasses = ['border-blue-500', 'border-green-500', 'border-amber-500', 'border-purple-500'] as const;

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
  const isOverviewPending = overviewQuery.isLoading || overviewQuery.isError;
  const isHealthPending = healthQuery.isLoading || healthQuery.isError;

  const healthVersion = healthQuery.data ? `v${healthQuery.data.version}` : 'Unavailable';
  const healthStatus = healthQuery.data ? `${healthQuery.data.service} / ${healthQuery.data.status}` : 'Unavailable';

  return (
    <section className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Welcome back, Administrator</CardTitle>
          <CardDescription>Here&apos;s your platform status at a glance.</CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Platform Overview</CardTitle>
          <CardDescription>Operational metrics and current delivery focus.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isOverviewPending ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="rounded-md border border-border p-3" key={`overview-stat-skeleton-${index}`}>
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div
                  className={`rounded-md border border-border border-l-4 p-3 ${
                    statBorderClasses[index % statBorderClasses.length]
                  }`}
                  key={stat.label}
                >
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-md border border-border bg-muted/20 px-4 py-3">
            {isHealthPending ? (
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">CoreApi version</p>
                <p className="mt-1 text-sm font-medium">
                  <span aria-hidden className="mr-2 inline-block h-2 w-2 rounded-full bg-green-500" />
                  {healthVersion}
                </p>
                <p className="text-xs text-muted-foreground">{healthStatus}</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current Focus</CardTitle>
          <CardDescription>Priorities that need execution attention today.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {isOverviewPending ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div className="h-4 w-full animate-pulse rounded bg-muted" key={`overview-todo-skeleton-${index}`} />
            ))
          ) : todos.length === 0 ? (
            <div className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
              {'\u25FB'} No current focus items
            </div>
          ) : (
            todos.map((todo, index) => {
              const isCompleted = index === 0;

              return (
                <div
                  className="flex items-start gap-2 rounded-md border border-border bg-muted/20 px-3 py-2 text-sm"
                  key={todo}
                >
                  <span className={isCompleted ? 'text-green-600' : 'text-muted-foreground'}>
                    {isCompleted ? '\u2611' : '\u25FB'}
                  </span>
                  <span className={isCompleted ? 'text-foreground' : 'text-muted-foreground'}>{todo}</span>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
}
