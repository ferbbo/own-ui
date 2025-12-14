import { ThemeColors } from "../types.ts";

import { cssVarName } from "../utilities/colors.ts";

/**
 * Generates CSS custom properties from a theme object.
 *
 * @param theme - A theme object containing color definitions and their values.
 * @returns A record where keys are CSS custom property names (--color-*) and values are color values.
 *
 * @example
 * const theme = { 'primary': '#3b82f6' };
 * generateThemeProperties(theme); // { '--color-primary': '#3b82f6' }
 */
const generateThemeProperties = (theme: ThemeColors): Record<string, string> => {
  const properties: Record<string, string> = {};

  // Generate CSS custom properties for each color
  Object.entries(theme).forEach(([colorName, colorValue]) => {
    properties[cssVarName(colorName)] = colorValue;
  });

  return properties;
};

export default generateThemeProperties;
