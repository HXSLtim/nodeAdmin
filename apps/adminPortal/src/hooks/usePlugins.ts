import { useQuery } from '@tanstack/react-query';
import type { TenantPluginResponse } from '@nodeadmin/shared-types';
import { useApiClient } from './useApiClient';
import { usePluginStore } from '@/stores/usePluginStore';
import { useEffect } from 'react';

export function usePlugins() {
  const apiClient = useApiClient();
  const setPlugins = usePluginStore((s) => s.setPlugins);

  const query = useQuery({
    queryKey: ['tenantPlugins'],
    queryFn: () => apiClient.get<TenantPluginResponse>('/api/v1/tenants/me/plugins'),
  });

  useEffect(() => {
    if (query.data?.plugins) {
      setPlugins(query.data.plugins);
    }
  }, [query.data, setPlugins]);

  return query;
}
