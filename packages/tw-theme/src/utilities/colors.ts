import { SemanticColorName, SemanticColorVariant, SurfaceColorName } from "../types.ts";

/**
 * List of all semantic color names
 */
export const semanticColorNames: SemanticColorName[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

/**
 * List of all semantic color variants
 */
export const semanticColorVariants: SemanticColorVariant[] = ["", "-content", "-focus"];

/**
 * List of all surface color names (escala de superficies).
 *
 * Lista **separada** de `semanticColorNames` a proposito: el generador
 * semantico multiplica cada nombre por `semanticColorVariants`, asi que meter
 * las superficies ahi emitiria `.bg-base-100-content`, `.bg-base-100-focus` y
 * 13 clases mas apuntando a tokens que ningun tema define. Ver
 * `specs/lote-4.md` O-01.
 */
export const surfaceColorNames: SurfaceColorName[] = [
  "base-100",
  "base-200",
  "base-300",
  "base-content",
];

/**
 * Generate CSS variable name for a semantic color
 */
export const cssVarName = (colorName: string): string => {
  if (colorName.startsWith("--")) {
    return colorName;
  }
  return `--${colorName}`;
};

/**
 * Generate CSS variable reference for a semantic color
 */
export const cssVarRef = (colorName: string): string => {
  // Add 'color-' prefix if not present
  const varName = colorName.startsWith("--color-") ? colorName : `--color-${colorName}`;
  return `var(${varName})`;
};

/**
 * Generate CSS variable reference with alpha channel
 */
export const cssVarRefRgb = (colorName: string): string => {
  return `rgb(var(${cssVarName(colorName)}))`;
};

/**
 * Convert hex color to RGB values
 * @example #ff0000 -> 255 0 0
 */
export const hexToRgb = (hex: string): string => {
  // Remove # if present
  hex = hex.replace("#", "");

  // Handle shorthand hex
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }

  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `${r} ${g} ${b}`;
};

/**
 * Declaracion CSS que emite cada prefijo de utilidad de superficie.
 *
 * Las superficies emiten 4 prefijos, no los 5 de los colores semanticos: se
 * deja fuera `ring`, porque un anillo de foco del color de la propia
 * superficie no contrasta con ella. Ver `specs/lote-4.md` D-04 / P-01.
 */
const surfaceUtilityDeclarations: Record<string, (ref: string) => Record<string, string>> = {
  bg: (ref) => ({ "background-color": ref }),
  text: (ref) => ({ color: ref }),
  border: (ref) => ({ "border-color": ref }),
  divide: (ref) => ({ "--tw-divide-color": ref }),
};

/**
 * Generate utility classes for the surface scale (`base-100/200/300/-content`).
 *
 * Emite 4 tokens x 4 prefijos = 16 clases, sin variantes `-content`/`-focus`.
 */
export const generateSurfaceUtilities = (): Record<string, Record<string, string>> => {
  const utilities: Record<string, Record<string, string>> = {};

  surfaceColorNames.forEach((tokenName) => {
    Object.entries(surfaceUtilityDeclarations).forEach(([prefix, toDeclaration]) => {
      utilities[`.${prefix}-${tokenName}`] = toDeclaration(cssVarRef(tokenName));
    });
  });

  return utilities;
};

/**
 * Generate utility classes for semantic colors
 */

export const generateColorUtilities = () => {
  const utilities = {};

  // const colorsVarsKeys = Object.keys(vars)

  // for (let i = 0; i < colorsVarsKeys.length; i++ ){
  //   if (colorsVarsKeys[i].startsWith("--color-")) {
  //     const token = colorsVarsKeys[i];
  //     const tokenName = colorsVarsKeys[i].replace("--color", "").trim()

  //     const bgClassName = `.bg-${tokenName}`;
  //     const colorClassName = `.text-${tokenName}`;
  //     const borderClassName = `.border-${tokenName}`;
  //     const ringClassName = `.ring-${tokenName}`;
  //     const divideClassName = `.divide-${tokenName}`;

  //     utilities[bgClassName] = {
  //       'background-color': cssVarRef(token),
  //     };

  //     utilities[colorClassName] = {
  //       color: cssVarRef(token),
  //     };

  //     utilities[borderClassName] = {
  //       'border-color': cssVarRef(token),
  //     };

  //     utilities[divideClassName] = {
  //       '--tw-divide-color': cssVarRef(token),
  //     };

  //     utilities[ringClassName] = {
  //       '--tw-ring-color': cssVarRef(token),
  //     };
  //   }
  // }

  // Generate background color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.bg-${tokenName}`;

      utilities[className] = {
        "background-color": cssVarRef(tokenName),
      };
    });
  });

  // Generate text color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.text-${tokenName}`;

      utilities[className] = {
        color: cssVarRef(tokenName),
      };
    });
  });

  // Generate border color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.border-${tokenName}`;

      utilities[className] = {
        "border-color": cssVarRef(tokenName),
      };
    });
  });

  // Generate ring color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.ring-${tokenName}`;

      utilities[className] = {
        "--tw-ring-color": cssVarRef(tokenName),
      };
    });
  });

  // Generate divide color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.divide-${tokenName}`;

      utilities[className] = {
        "--tw-divide-color": cssVarRef(tokenName),
      };
    });
  });

  // Utilidades de la escala de superficies (lote 4). Van en la misma llamada a
  // `addUtilities()` que las semanticas: para el plugin es un unico objeto.
  Object.assign(utilities, generateSurfaceUtilities());

  return utilities;
};
