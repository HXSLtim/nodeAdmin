import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/Components/Ui/badge';
import { Card, CardDescription, CardHeader, CardTitle } from '@/Components/Ui/card';
import { useApiClient } from '@/Hooks/useApiClient';

interface ReleaseCheck {
  done: boolean;
  title: string;
}

interface ReleaseCheckResponse {
  checks: ReleaseCheck[];
}

export function ReleaseControlPanel(): JSX.Element {
  const apiClient = useApiClient();
  const releaseQuery = useQuery({
    queryFn: () => apiClient.get<ReleaseCheckResponse>('/api/v1/console/release-checks'),
    queryKey: ['console-release-checks'],
  });

  const releaseChecks = releaseQuery.data?.checks ?? [];

  return (
    <Card className="p-4">
      <CardHeader className="mb-3 p-0">
        <CardTitle className="text-base">Release Controls</CardTitle>
        <CardDescription>MVP release gates and current checkpoint status.</CardDescription>
      </CardHeader>

      {releaseQuery.isLoading ? <p className="mb-3 text-sm text-muted-foreground">Loading release checks...</p> : null}
      {releaseQuery.isError ? <p className="mb-3 text-sm text-destructive">Failed to load release checks.</p> : null}

      <ul className="space-y-2">
        {releaseChecks.map((releaseCheck) => (
          <li
            className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            key={releaseCheck.title}
          >
            <span className="text-sm">{releaseCheck.title}</span>
            <Badge variant={releaseCheck.done ? 'default' : 'secondary'}>
              {releaseCheck.done ? 'done' : 'pending'}
            </Badge>
          </li>
        ))}
      </ul>
    </Card>
  );
}
