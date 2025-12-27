import { SemanticColorName, SemanticColorVariant } from "../types.ts";

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
  return utilities;
};
