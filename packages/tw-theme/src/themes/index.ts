import { ThemeColors } from "../types.ts";
import lightTheme from "./light.ts";
import darkTheme from "./dark.ts";
import rootTheme from "./root.ts";

/**
 * Built-in themes
 */
export const builtInThemes: Record<string, ThemeColors> = {
  light: lightTheme,
  dark: darkTheme,
  // `root` ya no lleva color: los unicos que habia (--color-base-200 y
  // --color-base-content) eran superficies, y las superficies dependen del
  // tema. Viven ahora en light.ts y dark.ts. `root.ts` queda como lo que
  // siempre debio ser: forma, geometria y profundidad. Ver AGENTS.md §4.2.
  root: { ...rootTheme },
};

/**
 * Get a built-in theme by name
 */
export const getBuiltInTheme = (name: string): ThemeColors | undefined => {
  return builtInThemes[name];
};

export { lightTheme, darkTheme, rootTheme };
