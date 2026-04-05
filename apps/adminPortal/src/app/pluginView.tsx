import { Suspense, type ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { ModuleErrorBoundary } from './moduleErrorBoundary';
import { usePluginLoader } from '@/hooks/usePluginLoader';
import { Spinner } from '@/components/ui/spinner';

interface PluginViewProps {
  pluginName: string;
  uiUrl: string;
}

export function PluginView({ pluginName, uiUrl }: PluginViewProps): JSX.Element {
  const { Component } = usePluginLoader(pluginName, uiUrl);
  const { formatMessage: t } = useIntl();

  if (!Component) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          {t({ id: 'plugin.no_ui' }, { plugin: pluginName })}
        </p>
      </div>
    );
  }

  return (
    <ModuleErrorBoundary>
      <Suspense fallback={<PluginLoadingState />}>
        <Component />
      </Suspense>
    </ModuleErrorBoundary>
  );
}

function PluginLoadingState() {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4">
      <Spinner className="h-8 w-8 text-primary" />
      <p className="text-sm text-muted-foreground">Loading plugin...</p>
    </div>
  );
}
