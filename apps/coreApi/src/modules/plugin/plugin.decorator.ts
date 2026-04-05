import { SetMetadata } from '@nestjs/common';

export const PLUGIN_METADATA_KEY = 'plugin:name';

export function Plugin(pluginName: string) {
  return SetMetadata(PLUGIN_METADATA_KEY, pluginName);
}
