import { create } from 'zustand';
import type { TenantPluginInfo } from '@nodeadmin/shared-types';

interface PluginState {
  loaded: boolean;
  enabledPlugins: string[]; // List of plugin names
  plugins: TenantPluginInfo[];
  setPlugins: (plugins: TenantPluginInfo[]) => void;
  isPluginEnabled: (name: string) => boolean;
}

export const usePluginStore = create<PluginState>((set, get) => ({
  loaded: false,
  enabledPlugins: [],
  plugins: [],
  setPlugins: (plugins) => {
    const enabledPlugins = plugins.filter((tp) => tp.enabled).map((tp) => tp.name);
    set({ loaded: true, plugins, enabledPlugins });
  },
  isPluginEnabled: (name: string) => {
    return get().enabledPlugins.includes(name);
  },
}));
