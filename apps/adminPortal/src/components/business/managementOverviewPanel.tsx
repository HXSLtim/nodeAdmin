import { useQuery } from '@tanstack/react-query';
import { useIntl } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timeline } from '@/components/ui/timeline';
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

interface MessageRow {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  conversationId: string;
}

interface RecentMessagesResponse {
  items: MessageRow[];
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

  const messagesQuery = useQuery({
    queryFn: () => apiClient.get<RecentMessagesResponse>('/api/v1/console/recent-messages'),
    queryKey: ['recent-messages'],
  });

  const stats = overviewQuery.data?.stats ?? [];
  const health = healthQuery.data;
  const recentLogs = auditQuery.data?.items ?? [];
  const recentMessages = messagesQuery.data?.items ?? [];

  // Combine and sort activities
  const activities = [
    ...recentLogs.map((log) => ({
      id: `log-${log.id}`,
      type: 'log',
      user: log.userId,
      action: log.action,
      time: new Date(log.createdAt),
      raw: log,
    })),
    ...recentMessages.map((msg) => ({
      id: `msg-${msg.id}`,
      type: 'message',
      user: msg.userId,
      action: 'im.send',
      time: new Date(msg.createdAt),
      content: msg.content,
      conversationId: msg.conversationId,
    })),
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);

  const isOverviewPending = overviewQuery.isLoading;
  const isHealthPending = healthQuery.isLoading;
  const isAuditPending = auditQuery.isLoading || messagesQuery.isLoading;

  const renderTrendChart = () => {
    // Simple SVG mock chart with two lines (Messages and Connections)
    const msgData = [40, 70, 45, 90, 65, 80, 95];
    const connData = [20, 30, 25, 40, 35, 45, 50];
    
    const max = 100;
    const getPoints = (data: number[]) => data
      .map((val, i) => `${(i * 100) / (data.length - 1)},${100 - (val * 100) / max}`)
      .join(' ');

    const msgPoints = getPoints(msgData);
    const connPoints = getPoints(connData);

    const weekDays = [
      t({ id: 'day.monday' }),
      t({ id: 'day.tuesday' }),
      t({ id: 'day.wednesday' }),
      t({ id: 'day.thursday' }),
      t({ id: 'day.friday' }),
      t({ id: 'day.saturday' }),
      t({ id: 'day.sunday' }),
    ];

    return (
      <Card className="col-span-full lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">{t({ id: 'overview.trends' })}</CardTitle>
          <CardDescription>{t({ id: 'overview.trends.desc' })}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full pt-4 relative">
            <svg
              className="h-full w-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <defs>
                <linearGradient id="msgGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="connGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="100"
                  y1={y}
                  y2={y}
                  className="stroke-muted/10"
                  strokeWidth="0.5"
                />
              ))}

              {/* Message line */}
              <polygon fill="url(#msgGradient)" points={`0,100 ${msgPoints} 100,100`} />
              <polyline
                className="text-blue-500"
                fill="none"
                points={msgPoints}
                stroke="currentColor"
                strokeWidth="2"
              />

              {/* Connection line */}
              <polygon fill="url(#connGradient)" points={`0,100 ${connPoints} 100,100`} />
              <polyline
                className="text-emerald-500"
                fill="none"
                points={connPoints}
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray="2 1"
              />
              
              {msgData.map((_, i) => (
                <line
                  className="stroke-muted/20"
                  key={i}
                  x1={(i * 100) / (msgData.length - 1)}
                  x2={(i * 100) / (msgData.length - 1)}
                  y1="0"
                  y2="100"
                />
              ))}
            </svg>
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              {weekDays.map(day => <span key={day}>{day}</span>)}
            </div>
            <div className="absolute top-0 right-0 flex gap-4 text-[10px] pr-4">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>{t({ id: 'overview.trends.messages' })}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{t({ id: 'overview.trends.connections' })}</span>
              </div>
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

  const getActivityTitle = (activity: any) => {
    if (activity.type === 'message') {
      return `${activity.user}: ${activity.content.slice(0, 30)}${activity.content.length > 30 ? '...' : ''}`;
    }
    
    let actionText = activity.action;
    if (activity.action === 'auth.login') actionText = t({ id: 'audit.action.login' });
    else if (activity.action.endsWith('.create'))
      actionText = `${t({ id: 'audit.action.created' })} ${activity.action.split('.')[0]}`;
    else if (activity.action.endsWith('.update'))
      actionText = `${t({ id: 'audit.action.updated' })} ${activity.action.split('.')[0]}`;
    else if (activity.action.endsWith('.delete'))
      actionText = `${t({ id: 'audit.action.deleted' })} ${activity.action.split('.')[0]}`;

    return `${activity.user} ${actionText}`;
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
            <CardDescription>{t({ id: 'overview.quickActions.desc' })}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Button
              className="justify-start gap-2 h-11"
              onClick={() => navigate('/users')}
              variant="outline"
            >
              <NavIcon name="plus" />
              {t({ id: 'users.create' })}
            </Button>
            <Button
              className="justify-start gap-2 h-11"
              onClick={() => navigate('/tenants')}
              variant="outline"
            >
              <NavIcon name="plus" />
              {t({ id: 'tenant.create' })}
            </Button>
            <Button
              className="justify-start gap-2 h-11"
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
              <CardDescription>{t({ id: 'overview.recentActivity.messages' })}</CardDescription>
            </div>
            <Button onClick={() => navigate('/audit')} size="sm" variant="ghost">
              {t({ id: 'common.viewAll' })}
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
              <Timeline
                emptyMessage={t({ id: 'audit.empty' })}
                isError={false}
                isLoading={false}
                items={activities.map((activity) => ({
                  id: activity.id,
                  subtitle: activity.time.toLocaleString(),
                  title: getActivityTitle(activity),
                }))}
              />
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t({ id: 'overview.systemStatus' })}</CardTitle>
            <CardDescription>{t({ id: 'overview.systemStatus.desc' })}</CardDescription>
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
                <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <span className="text-sm font-medium">{t({ id: 'overview.health.database' })}</span>
                  <Badge
                    className={getStatusColor(health.checks.database.status)}
                    variant="secondary"
                  >
                    {health.checks.database.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <span className="text-sm font-medium">{t({ id: 'overview.health.redis' })}</span>
                  <Badge className={getStatusColor(health.checks.redis.status)} variant="secondary">
                    {health.checks.redis.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
                  <span className="text-sm font-medium">{t({ id: 'overview.health.kafka' })}</span>
                  <Badge className={getStatusColor(health.checks.kafka.status)} variant="secondary">
                    {health.checks.kafka.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="pt-2 border-t border-border mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{t({ id: 'overview.health.uptime' })}</span>
                    <span>{stats.find((s) => s.label === 'overview.stat.uptime')?.value}</span>
                  </div>
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>{t({ id: 'overview.health.versionShort' })}</span>
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
