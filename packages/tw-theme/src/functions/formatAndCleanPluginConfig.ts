import { PluginOptions } from "src/types.ts";

/**
 * Cleans and formats the plugin configuration options.
 *
 * @param options - The raw plugin options provided by the user.
 * @returns A record of sanitized and formatted configuration options.
 */
const formatAndCleanPluginConfig = (options: PluginOptions): Record<string, string> => {
  const { 
    root,
    colorScheme,
    themes,
    name,
    ...rest
  } = options;

  return {
    root: root && !Number.isNaN(root) 
      ? root.toString().replace(/[^/w]+/g,'').trim().toLowerCase()
      : ':root',
    colorScheme: colorScheme && !Number.isNaN(colorScheme)  
      ? colorScheme.replace(/[^a-z\s]+/g,'').trim().toLowerCase()
      : 'light dark',
    themes: themes && !Number.isNaN(themes)
      ? themes.toString().replace(/[^a-z,-\s]+/g,'').trim().toLowerCase().split(',').filter((config) => config.length > 0 ).join(',')
      : '',
    name: name && !Number.isNaN(name)
      ? name.replace(/[^a-z\s]+/g,'').trim().toLowerCase()
      : '',
    ...rest
  };
};

export default formatAndCleanPluginConfig;