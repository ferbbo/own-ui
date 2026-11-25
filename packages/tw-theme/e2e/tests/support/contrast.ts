import type { Page } from "@playwright/test";

/**
 * Utilidades de contraste para los specs del lote 12.
 *
 * Viven aqui y no dentro de un spec porque las usan dos (`badge` y `avatar`),
 * y los dos miden lo mismo: que el texto que el CSS **calcula** con
 * `color-mix` es legible de verdad sobre el relleno que tambien calcula.
 *
 * El motivo de que haga falta un canvas: Chromium serializa el resultado de
 * `color-mix(in oklab, ...)` como `oklab(L a b)`, no como `rgb()`. Leer esa
 * cadena y tratar sus numeros como componentes sRGB da ratios inventados. Con
 * `ctx.fillStyle = <lo que sea>` + `getImageData`, el propio navegador hace la
 * conversion al espacio de pantalla, que es el que ve la persona.
 *
 * El umbral es el de WCAG 2.1 AA para texto normal: 4.5:1.
 */

export const AA_THRESHOLD = 4.5;

export type Rgb = [number, number, number];

/** Convierte cualquier color CSS que el navegador entienda a sRGB. */
export function toRgb(page: Page, color: string): Promise<Rgb> {
  return page.evaluate((value) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b] as [number, number, number];
  }, color);
}

/** Luminancia relativa de WCAG 2.1. */
function luminance([r, g, b]: Rgb): number {
  const [red, green, blue] = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** Ratio de contraste WCAG entre dos colores sRGB. */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Ratio entre el `color` y el `background-color` **computados** de un
 * elemento. Si el fondo del elemento es transparente se usa el que se pase
 * como respaldo, porque un ratio contra `rgba(0,0,0,0)` no significa nada.
 */
export async function elementContrast(
  page: Page,
  selector: string,
  fallbackBackground: string
): Promise<number> {
  const { color, background } = await page.locator(selector).evaluate((el) => {
    const computed = getComputedStyle(el);
    return { color: computed.color, background: computed.backgroundColor };
  });

  const transparent = background === "rgba(0, 0, 0, 0)" || background === "transparent";

  const [foreground, backdrop] = await Promise.all([
    toRgb(page, color),
    toRgb(page, transparent ? fallbackBackground : background),
  ]);

  return contrastRatio(foreground, backdrop);
}
