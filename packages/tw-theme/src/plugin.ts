import { plugin } from './functions/pluginWithOptions.ts'
import { PluginOptions, ThemeColors, Flags } from './types.ts';
import { builtInThemes } from './themes/index.ts';
import separateClassSelectorsFromStyles from './functions/splitStyles.ts';

import {
  generateColorUtilities,
  cssVarName,
} from './utilities/index.ts';


/**
 * Generate CSS custom properties for a theme.
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
 * Generates the theme configuration by combining default and custom themes.
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


const formatAndCleanPluginConfig = (options: PluginOptions): Record<string, string> => {
  const { root , colorScheme, themes } = options;

  return {
    root: root && !Number.isNaN(root) 
      ? root.toString().replace(/[^/w]+/g,'').trim().toLowerCase()
      : ':root',
    colorScheme: colorScheme && !Number.isNaN(colorScheme)  
      ? colorScheme.replace(/[^a-z\s]+/g,'').trim().toLowerCase()
      : 'light dark',
    themes: themes && !Number.isNaN(themes)
      ? themes.toString().replace(/[^a-z,-\s]+/g,'').trim().toLowerCase().split(',').filter((config) => config.length > 0 ).join(',')
      : ''
  };
};

/**
 * Creates the Tailwind plugin for semantic theming.
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
      
      const themeCnf = getThemeConfig([...defaultThemeCnf, ...themes.split(',')]);
      try {
        // Add base styles with CSS custom properties for each theme
        const defaultSelector = `:where(${root}),[data-theme="${themeCnf.light}"]`;
        const darkSelector = `[data-theme="${themeCnf.dark}"]`;
        const othersSelectors: Record<string, Record<string, string>> = Object.keys(themeCnf)
          .filter((name) => !['light', 'dark'].includes(name) && builtInThemes[name])
          .reduce((acc, name) => {
            acc[`[data-theme="${name}"]`] = generateThemeProperties(builtInThemes[name]);
            return acc;
          }, {});
        // Add root theme light and dark
        addBase({
          [root]: { 'color-scheme': colorScheme },
          [root]: { ...builtInThemes.root },
          [defaultSelector]: generateThemeProperties(builtInThemes.light),
          '@media (prefers-color-scheme: dark)': {
            [root]: generateThemeProperties(builtInThemes.dark),
          },
          [darkSelector]: generateThemeProperties(builtInThemes.dark),
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
