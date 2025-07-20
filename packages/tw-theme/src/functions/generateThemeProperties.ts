import {ThemeColors } from '../types.ts';

import {
  cssVarName,
} from '../utilities/index.ts';

const generateThemeProperties = (
  theme: ThemeColors
): Record<string, string> => {
  const properties: Record<string, string> = {};

  // Generate CSS custom properties for each color
  Object.entries(theme).forEach(([colorName, colorValue]) => {
    properties[cssVarName(colorName)] = colorValue;
  });

  return properties;
};

export default generateThemeProperties;