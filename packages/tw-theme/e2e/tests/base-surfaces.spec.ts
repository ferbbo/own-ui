import { test, expect } from "@playwright/test";

/**
 * E2E-8: escala de superficies `base-100/200/300` (lote 4)
 *
 * Mide sobre CSS compilado en Chromium las tres consecuencias del lote:
 *
 *   1. Los cuatro tokens de superficie existen y **cambian con el tema**.
 *      Antes vivian en `:root` con valores fijos (`base-200: #000000`,
 *      `base-content: #ffffff`), asi que un `.btn` sin variante salia negro
 *      tambien en tema claro.
 *   2. `--color-base-100` y `--color-base-300` existen. `base-100` estaba
 *      referenciado 3 veces en `dropdown.css` sin estar definido en ningun
 *      sitio: un `var()` a token indefinido queda *guaranteed-invalid*, el
 *      fallback **no** se dispara, y `background-color` caia a `transparent`.
 *   3. Las 16 utilidades de superficie resuelven a su token.
 *
 * Todo se afirma contra `getComputedStyle`, no contra el texto del CSS.
 */

/** Tokens de `src/themes/light.ts`, en el formato que devuelve Chromium. */
const LIGHT = {
  base100: "rgb(255, 255, 255)", // #ffffff
  base200: "rgb(242, 242, 242)", // #f2f2f2
  base300: "rgb(229, 230, 230)", // #e5e6e6
  baseContent: "rgb(31, 41, 55)", // #1f2937
};

/** Tokens de `src/themes/dark.ts`. */
const DARK = {
  base100: "rgb(29, 35, 42)", // #1d232a
  base200: "rgb(25, 30, 36)", // #191e24
  base300: "rgb(21, 25, 30)", // #15191e
  baseContent: "rgb(229, 231, 235)", // #e5e7eb
};

const TRANSPARENT = ["rgba(0, 0, 0, 0)", "transparent"];

/** Umbral de texto normal de WCAG 2.1 AA. */
const AA_NORMAL_TEXT = 4.5;

test.describe("E2E-8: Base surfaces scale", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/base-surfaces/");
  });

  test.describe("AC-1: los cuatro tokens existen en los dos temas", () => {
    test("el tema por defecto define la escala completa en :root", async ({ page }) => {
      const tokens = await page.evaluate(() => ({
        base100: window.getCSSVariable(":root", "--color-base-100"),
        base200: window.getCSSVariable(":root", "--color-base-200"),
        base300: window.getCSSVariable(":root", "--color-base-300"),
        baseContent: window.getCSSVariable(":root", "--color-base-content"),
      }));

      // Lo esencial: ninguno vacio. Un token indefinido devuelve "" aqui, y es
      // exactamente el estado que rompia el dropdown.
      expect(tokens.base100).toBeTruthy();
      expect(tokens.base200).toBeTruthy();
      expect(tokens.base300).toBeTruthy();
      expect(tokens.baseContent).toBeTruthy();

      expect(tokens.base100).toBe("#ffffff");
      expect(tokens.base200).toBe("#f2f2f2");
      expect(tokens.base300).toBe("#e5e6e6");
      expect(tokens.baseContent).toBe("#1f2937");
    });

    test('un ambito data-theme="dark" redefine la escala', async ({ page }) => {
      const tokens = await page.evaluate(() => ({
        base100: window.getCSSVariable("#dark-scope", "--color-base-100"),
        base200: window.getCSSVariable("#dark-scope", "--color-base-200"),
        base300: window.getCSSVariable("#dark-scope", "--color-base-300"),
        baseContent: window.getCSSVariable("#dark-scope", "--color-base-content"),
      }));

      expect(tokens.base100).toBe("#1d232a");
      expect(tokens.base200).toBe("#191e24");
      expect(tokens.base300).toBe("#15191e");
      expect(tokens.baseContent).toBe("#e5e7eb");
    });

    test("la escala ya NO es global: light y dark dan valores distintos", async ({ page }) => {
      const [light, dark] = await page.evaluate(() => [
        window.getCSSVariable(":root", "--color-base-200"),
        window.getCSSVariable("#dark-scope", "--color-base-200"),
      ]);

      expect(light).not.toBe(dark);
    });
  });

  test.describe("AC-2: .bg-base-100 resuelve a blanco en light y a oscuro en dark", () => {
    test("bg-base-100 es blanco en tema claro", async ({ page }) => {
      const bg = await page.evaluate(() => window.getElementBgColor("surface-100"));

      expect(TRANSPARENT).not.toContain(bg);
      expect(bg).toBe(LIGHT.base100);
    });

    test("bg-base-100 es oscuro con data-theme=dark", async ({ page }) => {
      const bg = await page.evaluate(() => window.getElementBgColor("surface-100-dark"));

      expect(bg).toBe(DARK.base100);
    });

    test("la superficie oscura es de verdad mas oscura que la clara", async ({ page }) => {
      // Cruza la asercion de color con una medida independiente del hex, para
      // que el test siga siendo valido si la escala se reajusta (P-02).
      const { lightLum, darkLum } = await page.evaluate(() => ({
        lightLum: window.relativeLuminance(window.getElementBgColor("surface-100") ?? ""),
        darkLum: window.relativeLuminance(window.getElementBgColor("surface-100-dark") ?? ""),
      }));

      expect(lightLum).not.toBeNull();
      expect(darkLum).not.toBeNull();
      expect(darkLum as number).toBeLessThan(lightLum as number);
    });

    test("bg-base-200 y bg-base-300 tambien resuelven en los dos temas", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        light200: window.getElementBgColor("surface-200"),
        light300: window.getElementBgColor("surface-300"),
        dark200: window.getElementBgColor("surface-200-dark"),
        dark300: window.getElementBgColor("surface-300-dark"),
      }));

      expect(computed.light200).toBe(LIGHT.base200);
      expect(computed.light300).toBe(LIGHT.base300);
      expect(computed.dark200).toBe(DARK.base200);
      expect(computed.dark300).toBe(DARK.base300);
    });

    test("text-base-content y border-base-300 resuelven", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        lightText: window.getElementTextColor("surface-content"),
        darkText: window.getElementTextColor("surface-content-dark"),
        border: window.getElementBorderColor("surface-border"),
      }));

      expect(computed.lightText).toBe(LIGHT.baseContent);
      expect(computed.darkText).toBe(DARK.baseContent);
      expect(computed.border).toBe(LIGHT.base300);
    });

    test("divide-base-300 define la custom property de Tailwind", async ({ page }) => {
      // `--tw-divide-color` no esta registrada con @property, asi que el valor
      // computado es el token ya sustituido (el hex de --color-base-300), no el
      // texto `var(...)`. Se compara contra el token para no fijar el hex aqui.
      const { divideColor, token } = await page.evaluate(() => ({
        divideColor: window.getComputedProp("surface-divide", "--tw-divide-color"),
        token: window.getCSSVariable(":root", "--color-base-300"),
      }));

      expect(divideColor).toBeTruthy();
      expect(divideColor).toBe(token);
    });

    test("la escala va de mas clara a mas oscura en los dos temas", async ({ page }) => {
      const lum = await page.evaluate(() => {
        const of = (id: string) =>
          window.relativeLuminance(window.getElementBgColor(id) ?? "") as number;
        return {
          light: [of("surface-100"), of("surface-200"), of("surface-300")],
          dark: [of("surface-100-dark"), of("surface-200-dark"), of("surface-300-dark")],
        };
      });

      expect(lum.light[0]).toBeGreaterThan(lum.light[1]);
      expect(lum.light[1]).toBeGreaterThan(lum.light[2]);
      expect(lum.dark[0]).toBeGreaterThan(lum.dark[1]);
      expect(lum.dark[1]).toBeGreaterThan(lum.dark[2]);
    });
  });

  test.describe("AC-3: el .dropdown tiene fondo", () => {
    test("background-color no es transparent (era el bug de --color-base-100)", async ({
      page,
    }) => {
      const bg = await page.evaluate(() => window.getElementBgColor("dropdown"));

      expect(TRANSPARENT).not.toContain(bg);
      expect(bg).toBe(LIGHT.base100);
    });

    test("el fondo del dropdown sigue al tema", async ({ page }) => {
      const bg = await page.evaluate(() => window.getElementBgColor("dropdown-dark"));

      expect(TRANSPARENT).not.toContain(bg);
      expect(bg).toBe(DARK.base100);
    });

    test("el .dropdown-item tambien resuelve fondo y texto", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        bg: window.getElementBgColor("dropdown-item"),
        fg: window.getElementTextColor("dropdown-item"),
      }));

      expect(TRANSPARENT).not.toContain(computed.bg);
      expect(computed.bg).toBe(LIGHT.base100);
      expect(computed.fg).toBe(LIGHT.baseContent);
    });

    test("el item del dropdown es legible (WCAG AA) en los dos temas", async ({ page }) => {
      const ratios = await page.evaluate(() => ({
        light: window.contrastRatio(
          window.getElementTextColor("dropdown-item") ?? "",
          window.getElementBgColor("dropdown-item") ?? ""
        ),
        dark: window.contrastRatio(
          window.getElementTextColor("dropdown-item-dark") ?? "",
          window.getElementBgColor("dropdown-item-dark") ?? ""
        ),
      }));

      expect(ratios.light as number).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      expect(ratios.dark as number).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });
  });

  test.describe("AC-4: un .btn sin variante es legible en ambos temas", () => {
    test("en light: fondo claro y texto oscuro", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        bg: window.getElementBgColor("btn-default"),
        fg: window.getElementTextColor("btn-default"),
        bgLum: window.relativeLuminance(window.getElementBgColor("btn-default") ?? ""),
        fgLum: window.relativeLuminance(window.getElementTextColor("btn-default") ?? ""),
      }));

      expect(computed.bg).toBe(LIGHT.base200);
      expect(computed.fg).toBe(LIGHT.baseContent);
      // El criterio literal del backlog: fondo claro + texto oscuro.
      expect(computed.bgLum as number).toBeGreaterThan(computed.fgLum as number);
    });

    test("en dark: fondo oscuro y texto claro", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        bg: window.getElementBgColor("btn-default-dark"),
        fg: window.getElementTextColor("btn-default-dark"),
        bgLum: window.relativeLuminance(window.getElementBgColor("btn-default-dark") ?? ""),
        fgLum: window.relativeLuminance(window.getElementTextColor("btn-default-dark") ?? ""),
      }));

      expect(computed.bg).toBe(DARK.base200);
      expect(computed.fg).toBe(DARK.baseContent);
      expect(computed.bgLum as number).toBeLessThan(computed.fgLum as number);
    });

    test("el contraste pasa WCAG AA en los dos temas", async ({ page }) => {
      const ratios = await page.evaluate(() => ({
        light: window.contrastRatio(
          window.getElementTextColor("btn-default") ?? "",
          window.getElementBgColor("btn-default") ?? ""
        ),
        dark: window.contrastRatio(
          window.getElementTextColor("btn-default-dark") ?? "",
          window.getElementBgColor("btn-default-dark") ?? ""
        ),
      }));

      expect(ratios.light as number).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
      expect(ratios.dark as number).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });

    test("el .btn sin variante ya NO es negro en tema claro (la regresion original)", async ({
      page,
    }) => {
      const bg = await page.evaluate(() => window.getElementBgColor("btn-default"));

      expect(bg).not.toBe("rgb(0, 0, 0)");
    });
  });
});
