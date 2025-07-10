import { ThemeColors } from '../types.ts';
import lightTheme from './light.ts';
import darkTheme from './dark.ts';
import rootTheme from './root.ts';
import rootColors from './rootColors.ts';

/**
 * Built-in themes
 */
export const builtInThemes: Record<string, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
  root: {...rootTheme, ...rootColors},
};

/**
 * Get a built-in theme by name
 */
export const getBuiltInTheme = (name: string): ThemeColors | undefined => {
  return builtInThemes[name];
};

export { lightTheme, darkTheme, rootTheme  };