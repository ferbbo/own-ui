import { plugin } from './functions/pluginWithOptions.ts'
import { PluginOptions, ThemeColors , Flags} from './types.ts';
import generateThemeProperties from './functions/generateThemeProperties.ts';
import getThemeNameConfig from './functions/getThemeNameConfig.ts';


/**
 * Builds a custom theme from user options.
 */
const getCustomTheme  = ({rest, name}:{ rest: PluginOptions, name: string }): { name: string, vars: ThemeColors } | null => {
  const vars: ThemeColors = {};
  if (name) {
    const themeName = name;
    Object.entries(rest).forEach(([key, value]) => {
      if (key.startsWith('--') && typeof value === 'string') {
        vars[key] = value;
      }
    });  

    return { name: themeName, vars: vars };
  }
  return null;
}

/**
 * Creates the Tailwind plugin for semantic theming.
 */
const createPlugin = () => {
  return plugin.withOptions(function (options: PluginOptions = {}) {
    return function ({ addBase }) {
      const {
        root = ':root',
        name = '',
        ...rest
      } = options;
      const nameCnf = getThemeNameConfig(name);
      if (!nameCnf) return;
      const customTheme = getCustomTheme({ name: nameCnf.name, rest });
    
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

const themePlugin =  createPlugin();

export default themePlugin;
