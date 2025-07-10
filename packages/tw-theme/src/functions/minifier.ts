// src/services/minifier.ts
import postcss from 'postcss';
import cssnano from 'cssnano';

/**
 * Toma un objeto JS de CSS, lo serializa, minifica y devuelve
 * el CSS resultante (string). Si quieres un objeto JS de vuelta,
 * habría que parsearlo otra vez.
 */
export const minifyCssObj = async (cssObj: Record<string, any>): Promise<string> => {
  // Serializamos de forma sencilla
  const rawCss = Object.entries(cssObj)
    .map(([sel, rules]) => {
      const body = Object.entries(rules)
        .map(([prop, val]) => `${prop}: ${val};`)
        .join(' ');
      return `${sel} { ${body} }`;
    })
    .join('\n');

  const result = await postcss([cssnano]).process(rawCss, { from: undefined });
  return result.css;
};
