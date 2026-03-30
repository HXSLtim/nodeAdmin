import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timeline, TimelineItem } from '@/components/ui/timeline';
import { NavIcon } from '@/app/layout/navIcon';
import { useApiClient } from '@/hooks/useApiClient';

interface StatItem {
  label: string;
  value: string;
}

interface OverviewResponse {
  stats: StatItem[];
  todos: string[];
}

interface HealthCheckResult {
  message: string;
  status: 'ok' | 'degraded' | 'error';
}

interface HealthResponse {
  checks: {
    database: HealthCheckResult;
    kafka: HealthCheckResult;
    redis: HealthCheckResult;
  };
  service: string;
  status: string;
  timestamp: string;
  version: string;
}

interface AuditLogRow {
  id: string;
  userId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  context: any;
}

interface AuditLogResponse {
  items: AuditLogRow[];
  total: number;
}

const statBgClasses = [
  'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
  'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400',
  'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
  'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
  'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
] as const;

const statIconNames = ['users', 'chat', 'bar', 'building', 'rocket'] as const;

export function ManagementOverviewPanel(): JSX.Element {
  const { formatMessage: t } = useIntl();
  const navigate = useNavigate();
  const apiClient = useApiClient();

  const overviewQuery = useQuery({
    queryFn: () => apiClient.get<OverviewResponse>('/api/v1/console/overview'),
    queryKey: ['console-overview'],
  });

  const healthQuery = useQuery({
    queryFn: () => apiClient.get<HealthResponse>('/api/v1/health'),
    queryKey: ['health'],
    staleTime: 30_000,
  });

  const auditQuery = useQuery({
    queryFn: () => apiClient.get<AuditLogResponse>('/api/v1/console/audit-logs?pageSize=10'),
    queryKey: ['recent-audit-logs'],
  });

  const stats = overviewQuery.data?.stats ?? [];
  const health = healthQuery.data;
  const recentActivities = auditQuery.data?.items ?? [];

  const isOverviewPending = overviewQuery.isLoading;
  const isHealthPending = healthQuery.isLoading;
  const isAuditPending = auditQuery.isLoading;

  const renderTrendChart = () => {
    // Simple SVG mock chart
    const data = [40, 70, 45, 90, 65, 80, 95];
    const max = Math.max(...data);
    const points = data
      .map((val, i) => `${(i * 100) / (data.length - 1)},${100 - (val * 100) / max}`)
      .join(' ');

    return (
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">{t({ id: 'overview.trends' })}</CardTitle>
          <CardDescription>Message volume trend (Last 7 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full pt-4">
            <svg
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline
                className="text-primary"
                fill="none"
                points={points}
                stroke="currentColor"
                strokeWidth="2"
              />
              <polygon fill="url(#chartGradient)" points={`0,100 ${points} 100,100`} />
              {data.map((_, i) => (
                <line
                  className="stroke-muted/20"
                  key={i}
                  x1={(i * 100) / (data.length - 1)}
                  x2={(i * 100) / (data.length - 1)}
                  y1="0"
                  y2="100"
                />
              ))}
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <section className="flex h-full flex-col gap-6 overflow-y-auto pb-8">
      {/* Welcome & Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full border-primary/10 bg-gradient-to-r from-primary/5 via-card to-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{t({ id: 'overview.welcome' })}</CardTitle>
            <CardDescription>{t({ id: 'overview.welcomeDesc' })}</CardDescription>
          </CardHeader>
        </Card>

        {isOverviewPending
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                  <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))
          : stats.slice(0, 4).map((stat, index) => (
              <Card key={stat.label}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{t({ id: stat.label })}</CardTitle>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${statBgClasses[index % statBgClasses.length]}`}
                  >
                    <NavIcon name={statIconNames[index % statIconNames.length]} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Trend Chart */}
        {renderTrendChart()}

        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t({ id: 'overview.quickActions' })}</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button
              className="justify-start gap-2"
              onClick={() => navigate('/users')}
              variant="outline"
            >
              <NavIcon name="plus" />
              {t({ id: 'users.create' })}
            </Button>
            <Button
              className="justify-start gap-2"
              onClick={() => navigate('/tenants')}
              variant="outline"
            >
              <NavIcon name="plus" />
              {t({ id: 'tenant.create' })}
            </Button>
            <Button
              className="justify-start gap-2"
              onClick={() => navigate('/audit')}
              variant="outline"
            >
              <NavIcon name="history" />
              {t({ id: 'audit.title' })}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{t({ id: 'overview.recentActivity' })}</CardTitle>
              <CardDescription>Latest system operations</CardDescription>
            </div>
            <Button onClick={() => navigate('/audit')} size="sm" variant="ghost">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {isAuditPending ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div className="flex items-center gap-4" key={i}>
                    <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Timeline className="mt-2">
                {recentActivities.map((log) => {
                  let actionText = log.action;
                  if (log.action === 'auth.login') actionText = t({ id: 'audit.action.login' });
                  else if (log.action === 'user.create')
                    actionText = `${t({ id: 'audit.action.create' })} user`;
                  else if (log.action === 'user.update')
                    actionText = `${t({ id: 'audit.action.update' })} user`;

                  return (
                    <TimelineItem
                      description={new Date(log.createdAt).toLocaleString()}
                      key={log.id}
                      title={`${log.userId} ${actionText}`}
                    />
                  );
                })}
                {recentActivities.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    {t({ id: 'audit.empty' })}
                  </p>
                )}
              </Timeline>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ id: 'overview.systemStatus' })}</CardTitle>
            <CardDescription>Infrastructure health check</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isHealthPending ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div className="flex items-center justify-between" key={i}>
                    <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-12 animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : health ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">Database</span>
                  <Badge
                    className={getStatusColor(health.checks.database.status)}
                    variant="secondary"
                  >
                    {health.checks.database.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">Redis</span>
                  <Badge className={getStatusColor(health.checks.redis.status)} variant="secondary">
                    {health.checks.redis.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm font-medium">Kafka</span>
                  <Badge className={getStatusColor(health.checks.kafka.status)} variant="secondary">
                    {health.checks.kafka.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Uptime</span>
                    <span>{stats.find((s) => s.label === 'overview.stat.uptime')?.value}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>Version</span>
                    <span>v{health.version}</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-destructive">{t({ id: 'overview.unavailable' })}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
