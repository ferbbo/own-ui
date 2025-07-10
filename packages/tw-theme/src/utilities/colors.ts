import { SemanticColorName, SemanticColorVariant } from '../types.ts';

/**
 * List of all semantic color names
 */
export const semanticColorNames: SemanticColorName[] = [
  'primary',
  'secondary',
  'accent',
  'neutral',
  'info',
  'success',
  'warning',
  'error',
];


/**
 * List of all semantic color variants
 */
export const semanticColorVariants: SemanticColorVariant[] = ['', '-content', '-focus'];

/**
 * Generate CSS variable name for a semantic color
 */
export const cssVarName = (colorName: string): string => {
  return `--${colorName}`;
};

/**
 * Generate CSS variable reference for a semantic color
 */
export const cssVarRef = (colorName: string): string => {
  return `var(${cssVarName(colorName)})`;
};

/**
 * generate a colorMap with semanticaColorNames
 */

const colorMap = semanticColorNames
  .flatMap(name => semanticColorVariants.map(variant => ({ [name + variant]: `var(--${name})` })))
  .reduce((a, o) => Object.assign(a, o), {})

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
  hex = hex.replace('#', '');
  
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
 * Check if a utility class exists in Tailwind's config
 */
export const utilityExists = (
  utilityName: string,
  theme: any,
  prefix: string = ''
): boolean => {
  // This is a simplified check - in a real implementation,
  // we would need to check against the actual Tailwind config
  const prefixedName = prefix ? `${prefix}-${utilityName}` : utilityName;
  
  // For now, we'll assume no conflicts with existing utilities
  return false;
};

/**
 * Generate utility classes for semantic colors
 */

export const generateColorUtilities = ( ) => {  
  const utilities = {}

  // Generate background color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.bg-${tokenName}`;
      
      utilities[className] = {
        'background-color': cssVarRefRgb(tokenName),
      };
    });
  });

  // Generate text color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.text-${tokenName}`;
      
      utilities[className] = {
        color: cssVarRefRgb(tokenName),
      };
    });
  });

  // Generate border color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.border-${tokenName}`;
      
      utilities[className] = {
        'border-color': cssVarRefRgb(tokenName),
      };
    });
  });
  
  // Generate ring color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.ring-${tokenName}`;
      
      utilities[className] = {
        '--tw-ring-color': cssVarRefRgb(tokenName),
      };
    });
  });
  
  // Generate divide color utilities
  semanticColorNames.forEach((colorName) => {
    semanticColorVariants.forEach((variant) => {
      const tokenName = `${colorName}${variant}`;
      const className = `.divide-${tokenName}`;
      
      utilities[className] = {
        '--tw-divide-color': cssVarRefRgb(tokenName),
      };
    });
  });
  return utilities;
};


