import { plugin } from './functions/pluginWithOptions.ts'
import { PluginOptions, ThemeColors } from './types.ts';
import { builtInThemes } from './themes/index.ts';
//import processCSS from "./functions/processCSS.ts";
import splitStyles from './functions/splitStyles.ts';

import {
  hexToRgb,
  generateColorUtilities,
  cssVarName,
} from './utilities/index.ts';
/** 
 * Import button styles from themes *
 */

//import { buttonStyles } from './themes/imports.ts';

/**
 * Generate CSS custom properties for a theme
 */
const  generateThemeProperties = (
  theme: ThemeColors
): Record<string, string> => {
  const properties: Record<string, string> = {};

  // Generate CSS custom properties for each color
  Object.entries(theme).forEach(([colorName, colorValue]) => {
    // Convert hex colors to RGB values for better alpha support
    if (colorValue.startsWith('#')) {
      properties[cssVarName(colorName)] = hexToRgb(colorValue);
    } else {
      properties[cssVarName(colorName)] = colorValue;
    }
  });

  return properties;
};

/**
 * Create the Tailwind plugin
 */
const createPlugin = () => {
  return plugin.withOptions(function (options: PluginOptions = {}) {
    return function ({ addBase, addUtilities, addComponents }) {
      const {
        root = ':root',
        colorScheme = 'light dark',      
      } = options;
      const flags = ['--default', '--prefersdark']
      const themes = [`light ${flags[0]}`, `dark ${flags[1]}`];
      const defaultThemes = themes.filter((theme) => flags.includes(theme.split(" ").pop() || ''))
                                  .map((theme) => theme.split(" ")[0]);

    try {
      // Add base styles with CSS custom properties for each theme
      const defaultSelector = `:where(${root}),[data-theme="${defaultThemes[0]}"]`;

      
      // Add root theme light and dark      
      addBase({
        [root]: { 'color-scheme': colorScheme },
        [root]: { ...builtInThemes.root },
        [defaultSelector]: generateThemeProperties(builtInThemes.light),
        '@media (prefers-color-scheme: dark)': {
          [root]: generateThemeProperties(builtInThemes.dark),
        },
        [`[data-theme="${defaultThemes[1]}"]`]: generateThemeProperties(builtInThemes.dark),
      });
  
      // Add utility classes - use type assertion only at the API boundary
      addUtilities(generateColorUtilities());

      // Add Components
      try {
        // button
        //const buttonStyles = processCSS({ fileName: "button" });
        const {buttonStyles} = require('./build/components');
        const { classes, rest } = splitStyles(buttonStyles);
        addComponents(classes);
        addBase(rest);
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
