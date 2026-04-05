import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { usePluginStore } from '@/stores/usePluginStore';

interface PluginGuardProps {
  children: ReactNode;
  pluginCode: string;
}

export function PluginGuard({ children, pluginCode }: PluginGuardProps): JSX.Element {
  const isEnabled = usePluginStore((state) => state.isPluginEnabled(pluginCode));
  const { formatMessage: t } = useIntl();

  if (!isEnabled) {
    return (
      <section className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
        {t({ id: 'plugin.disabled' }, { plugin: pluginCode })}
      </section>
    );
  }

  return <>{children}</>;
}
