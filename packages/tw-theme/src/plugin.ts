import { PluginOptions, ThemeColors, Flags } from './types.ts';
import { builtInThemes } from './themes/index.ts';
import { 
  separateClassSelectorsFromStyles,
  formatAndCleanPluginConfig,
  plugin 
} from './functions/index.ts';

import {
  generateColorUtilities,
  cssVarName,
} from './utilities/colors.ts';


/**
 * Generates CSS custom properties for a given theme.
 *
 * @param theme - The theme object containing color definitions.
 * @returns A record of CSS custom properties.
 */
const generateThemeProperties = (
  theme: ThemeColors
): Record<string, string> => {
  const properties: Record<string, string> = {};

  // Generate CSS custom properties for each color
  Object.entries(theme).map(([colorName, colorValue]) => {
    properties[cssVarName(colorName)] = colorValue;

  });

  return properties;
};

/**
 * Combines default and custom themes into a single configuration.
 *
 * @param theme - An array of theme strings.
 * @returns A record mapping theme names to their configurations.
 */
const getThemeConfig = (theme : string[]): Record<string, string> => {

  return theme.reduce((acc, theme) => {
    const themeParts = theme.split(' ');
    if (themeParts[1]?.includes('--default')) {
      acc['light'] = themeParts[0];
    }
    if (themeParts[1]?.includes('--prefersdark')) {
      acc['dark'] = themeParts[0];
    }
    if (acc[themeParts[0]]) {
      acc[themeParts[0]] = themeParts[0];
    }
    return acc;
  }, {})
};


/**
 * Creates a Tailwind CSS plugin for semantic theming.
 *
 * @returns A configured Tailwind plugin with theme support.
 */
const createPlugin = () => {
  return plugin.withOptions(function (options: PluginOptions = {}) {
    return function ({ addBase, addUtilities, addComponents }) {
      const flagList= [Flags.DEFAULT, Flags.PREFER_DARK];
      const defaultThemeCnf = [`light ${flagList[0]}`, `dark ${flagList[1]}`];
      const {
        root,
        colorScheme,
        themes
      } = formatAndCleanPluginConfig(options);
      
      // Check if default themes should be disabled
      const useDefaultThemes = themes !== 'false';
      let themesToUse = useDefaultThemes ? [...defaultThemeCnf] : [];
      
      // Only add custom themes if there are any
      if (themes && themes !== 'false' && themes.length > 0) {
        // Add custom themes from the themes option
        themesToUse.push(...themes.split(','));
      }
      
      // Always include user-defined themes with @plugin "@ownui/tw-theme/theme"
      // These themes are registered independently through theme.ts plugin
      
      const themeCnf = getThemeConfig(themesToUse);
      try {
        // Add base styles with CSS custom properties for each theme
        const baseStyles: Record<string, any> = {
          [root]: { 'color-scheme': colorScheme },
          [root]: { ...builtInThemes.root },
        };
        
        // Only add default themes if they're not disabled
        if (useDefaultThemes) {
          const defaultSelector = `:where(${root}),[data-theme="${themeCnf.light}"]`;
          const darkSelector = `[data-theme="${themeCnf.dark}"]`;
          
          // Add light theme
          if (themeCnf.light) {
            baseStyles[defaultSelector] = generateThemeProperties(builtInThemes.light);
          }
          
          // Add dark theme
          if (themeCnf.dark) {
            baseStyles['@media (prefers-color-scheme: dark)'] = {
              [root]: generateThemeProperties(builtInThemes.dark),
            };
            baseStyles[darkSelector] = generateThemeProperties(builtInThemes.dark);
          }
        }
        
        // Add other custom themes if any
        const othersSelectors: Record<string, Record<string, string>> = Object.keys(themeCnf)
          .filter((name) => !['light', 'dark'].includes(name) && builtInThemes[name])
          .reduce((acc, name) => {
            acc[`[data-theme="${name}"]`] = generateThemeProperties(builtInThemes[name]);
            return acc;
          }, {});
          
        // Add base styles
        addBase({
          ...baseStyles,
          ...othersSelectors
        });
    
        // Add utility classes - use type assertion only at the API boundary
        addUtilities(generateColorUtilities());

        // Add Components
        try {
          /* button */
          const {buttonStyles} = require('./build/components');
          const { classSelectors, otherStyles } = separateClassSelectorsFromStyles(buttonStyles);
          addComponents(classSelectors);
          addBase(otherStyles);
        } catch (error) {
          console.error('Error loading component:', error);
        }

      } catch (error) {
        console.error('Error in @ownui/tw-theme plugin:', error);
      }
    };
  })
};

export default createPlugin;
