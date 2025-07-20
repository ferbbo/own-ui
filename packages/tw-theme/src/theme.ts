import { plugin } from './functions/pluginWithOptions.ts'
import { PluginOptions, ThemeColors , Flags} from './types.ts';
import generateThemeProperties from './functions/generateThemeProperties.ts';
import getThemeNameConfig from './functions/getThemeNameConfig.ts';


/**
 * Extracts theme variables from plugin options and associates them with a theme name.
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
 * Creates the Tailwind plugin for semantic theming.
 */
const createSemanticThemePlugin = () => {
  return plugin.withOptions(function (options: PluginOptions = {}) {
    return function ({ addBase }) {
      const {
        root = ':root',
        name = '',
        ...pluginOptions
      } = options;
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
