/**
 * Semantic color token names
 */
export type SemanticColorName =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/**
 * Semantic color variant suffixes
 */
export type SemanticColorVariant = "" | "-content" | "-focus";

/**
 * Full semantic color token (name + optional variant)
 */
export type SemanticColorToken = `${SemanticColorName}${SemanticColorVariant}`;

/**
 * Escala de superficies. Definida por tema en `themes/light.ts` y
 * `themes/dark.ts` (no en `root.ts`: una superficie fija no puede servir a un
 * tema claro y a uno oscuro a la vez). Ver AGENTS.md §4.2.
 *
 * A diferencia de los colores semanticos, las superficies **no** tienen
 * variantes `-content` ni `-focus`: `base-content` es el unico color de texto
 * de la escala, y no existe `--color-base-100-focus`. Mezclarlas en
 * `SemanticColorName` generaria 15 utilidades apuntando a tokens inexistentes.
 */
export type SurfaceColorName = "base-100" | "base-200" | "base-300" | "base-content";

/**
 * Cualquier token de color del sistema: semantico o de superficie.
 */
export type ColorToken = SemanticColorToken | SurfaceColorName;

/**
 * Color value in hex, rgb, hsl, oklch format
 */
export type ColorValue = string;

/**
 * Theme colors mapping
 */
export interface ThemeColors {
  [key: string]: ColorValue;
}

/**
 * Named theme definition
 */
export interface NamedTheme {
  [themeName: string]: ThemeColors;
}

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  themes: (string | NamedTheme)[];
}

/**
 * Plugin options for @plugin directive
 */
interface PluginOptionsBase {
  root?: string;
  colorScheme?: "light" | "dark";
  // prefix?: string; TODO: HABILITAR SEGUN SE REQUIERA
  // logs?: boolean; TODO: HABILITAR SEGUN SE REQUIERA
  name?: string;
  config?: string;
  themes?: string | boolean;
}

export type PluginOptions = PluginOptionsBase & {
  [key: string]: ColorValue | undefined;
};

/**
 * CSS-in-JS style object
 */
export type CssStyles = {
  [key: string]: string | string[] | CssStyles | CssStyles[];
};
export enum Flags {
  DEFAULT = "--default",
  PREFER_DARK = "--prefersdark",
}
