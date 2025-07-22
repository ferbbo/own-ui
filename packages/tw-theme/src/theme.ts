import { PluginOptions, ThemeColors , Flags} from './types.ts';
import {
  generateThemeProperties,
  formatAndCleanPluginConfig,
  plugin,
} from './functions/index.ts';


/**
 * Extracts CSS custom properties from plugin options and associates them with a theme name.
 *
 * @param pluginOptions - The plugin configuration options.
 * @param themeName - The name of the theme to associate with the variables.
 * @returns An object containing the theme name and its variables, or null if invalid.
 */
const extractThemeVariablesFromOptions = ({pluginOptions, themeName}: { pluginOptions: PluginOptions, themeName: string }): { name: string, vars: ThemeColors } | null => {
  const themeVariables: ThemeColors = {};
  if (themeName) {
    Object.entries(pluginOptions).forEach(([key, value]) => {
      if (key.startsWith('--') && typeof value === 'string') {
        themeVariables[key] = value;
      }
    });  

    return { name: themeName, vars: themeVariables };
  }
  return null;
}

/**
 * Parses a theme string to extract its name and flag.
 *
 * @param theme - A string containing the theme name and flag.
 * @returns An object with the theme name and flag, or null if invalid.
 */
const getThemeNameConfig = (theme: string): { name: string; flag: Flags } | null => {
  const [name, flag] = theme.split(' ');
  if (
    name && typeof flag === 'string' &&
    Object.values(Flags).includes(flag as Flags) &&
    theme.includes(flag)
  ) {
    return { name, flag: flag as Flags };
  }
  return null;
};

/**
 * Creates a Tailwind CSS plugin for semantic theming.
 *
 * @returns A configured Tailwind plugin with theme support.
 */
const createSemanticThemePlugin = () => {
  return plugin.withOptions(function (options: PluginOptions = {}) {
    return function ({ addBase }) {
      const {
        root,
        name,
        ...pluginOptions
      } = formatAndCleanPluginConfig(options);

      const nameCnf = getThemeNameConfig(name);
      if (!nameCnf) return;
      const customTheme = extractThemeVariablesFromOptions({ themeName: nameCnf.name, pluginOptions });
    
      if (!customTheme) return

      try {
        // Add base styles with CSS custom properties for each theme
        const defaultSelector =   `[data-theme="${customTheme.name}"]`;
        // Add root theme light and dark
        addBase({
           // If the theme is light, add the root selector
          ...(nameCnf.flag === Flags.DEFAULT ? {
            [`:where(${root}),${defaultSelector}`]: generateThemeProperties(customTheme.vars),
          } : 
          { [defaultSelector]: generateThemeProperties(customTheme.vars) }),
          // If the theme is prefers dark, add the dark media query
          ...(nameCnf.flag === Flags.PREFER_DARK ? {
            [`@media (prefers-color-scheme: dark)`]: {
              [root]: generateThemeProperties(customTheme.vars),
            },
          } : {}),
        });
      } catch (error) {
        console.error('Error in @ownui/tw-theme/theme plugin:', error);
      }
    }
  });
};

const tailwindThemePlugin = createSemanticThemePlugin();

export default tailwindThemePlugin;
