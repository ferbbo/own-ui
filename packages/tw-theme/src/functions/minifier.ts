// src/services/minifier.ts
import postcss from 'postcss';
import cssnano from 'cssnano';

/**
 * Takes a CSS object, serializes it, minifies it and returns
 * the resulting CSS as a string.
 */
export const minifyCssObject = async (cssObject: Record<string, any>): Promise<string> => {
  // Simple serialization
  const rawCss = Object.entries(cssObject)
    .map(([selector, rules]) => {
      const ruleBody = Object.entries(rules)
        .map(([property, value]) => `${property}: ${value};`)
        .join(' ');
      return `${selector} { ${ruleBody} }`;
    })
    .join('\n');

  const result = await postcss([cssnano]).process(rawCss, { from: undefined });
  return result.css;
};
