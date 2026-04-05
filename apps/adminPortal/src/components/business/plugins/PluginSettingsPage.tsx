import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useIntl } from 'react-intl';
import { usePluginStore } from '@/stores/usePluginStore';
import { usePluginManagement } from '@/hooks/useMarketplace';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { NavIcon } from '@/app/layout/navIcon';

export function PluginSettingsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatMessage: t } = useIntl();
  const plugins = usePluginStore((s) => s.plugins);
  const plugin = plugins.find(p => p.name === id);
  const { updateConfig } = usePluginManagement();

  // Mocking settings schema for now, as it would come from entrypoints.settings or manifest
  const [config, setConfig] = useState<Record<string, any>>({});
  
  useEffect(() => {
    if (plugin?.config) {
      setConfig(plugin.config);
    }
  }, [plugin]);

  if (!plugin) return <div className="text-destructive">Plugin not found.</div>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig.mutate({ id: plugin.name, config });
  };

  const handleFieldChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
            Back
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">
            {plugin.manifest?.displayName || plugin.name} Settings
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Configure the behavior and parameters for this plugin.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dynamic fields would go here. For now, we mock some based on common plugin needs or existing config */}
            {Object.entries(config).length === 0 ? (
              <p className="text-sm text-muted-foreground italic">No configurable settings for this plugin.</p>
            ) : (
              Object.entries(config).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key} className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                  {typeof value === 'boolean' ? (
                    <Checkbox 
                      id={key} 
                      checked={value} 
                      label={`${key} is ${value ? 'enabled' : 'disabled'}`}
                      onChange={(checked: boolean) => handleFieldChange(key, checked)} 
                    />
                  ) : typeof value === 'number' ? (
                    <Input 
                      id={key} 
                      type="number" 
                      value={value} 
                      onChange={(e) => handleFieldChange(key, Number(e.target.value))} 
                    />
                  ) : (
                    <Input 
                      id={key} 
                      value={value as string} 
                      onChange={(e) => handleFieldChange(key, e.target.value)} 
                    />
                  )}
                </div>
              ))
            )}
          </CardContent>
          <CardFooter className="justify-end space-x-2 border-t pt-6">
            <Button variant="outline" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" disabled={updateConfig.isPending}>
              {updateConfig.isPending ? <Spinner className="mr-2 h-4 w-4" /> : null}
              Save Changes
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
