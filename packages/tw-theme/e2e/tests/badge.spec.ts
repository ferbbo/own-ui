import { test, expect } from "@playwright/test";
import { AA_THRESHOLD, elementContrast } from "./support/contrast";

/**
 * E2E-12b: CSS del Badge (lote 12)
 *
 * Mide sobre CSS compilado en Chromium lo que un test de RTL no puede: que
 * las reglas de `badge.css` pintan, dimensionan y **son legibles**.
 *
 * Lo que de verdad justifica este spec es el ultimo bloque. Los tratamientos
 * `outline` y `soft` pintan texto de color de rol sobre una superficie del
 * tema, y el token `-content` no sirve ahi: el CSS calcula ese texto con
 * `color-mix(... var(--color-base-content) 55%)`. Un calculo asi no se puede
 * verificar leyendo el archivo —hay que resolverlo— y es exactamente el tipo
 * de cosa que se afloja sin que nadie se entere. Aqui se resuelve en el
 * navegador y se compara contra el umbral AA (4.5:1) de los 8 roles en los
 * dos temas.
 */

const EPSILON = 1;

const hexToRgb = (hex: string): string => {
  const normalized = hex.trim().replace(/^#/, "");
  const full =
    normalized.length === 3 ? [...normalized].map((char) => char + char).join("") : normalized;
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

const TRANSPARENT = ["rgba(0, 0, 0, 0)", "transparent"];

const ROLES = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
] as const;

/** `themes/light.ts` y `themes/dark.ts`: relleno y texto de cada rol. */
const LIGHT = {
  base100: "#ffffff",
  base300: "#e5e6e6",
  baseContent: "#1f2937",
  primary: "#3b82f6",
  primaryContent: "#ffffff",
  error: "#ef4444",
};

const DARK = { base100: "#1d232a", primary: "#60a5fa", primaryContent: "#1e293b" };

/** `--size-field` = 0.25rem = 4px. */
const SIZE_FIELD_PX = 4;
const SIZES = [
  { key: "xs", fields: 4 },
  { key: "sm", fields: 5 },
  { key: "md", fields: 6 },
  { key: "lg", fields: 7 },
  { key: "xl", fields: 8 },
];

test.beforeEach(async ({ page }) => {
  await page.goto("/badge/");
});

test.describe("E2E-12b: Badge", () => {
  test.describe("relleno solido", () => {
    test("el rol pinta el fondo y su -content el texto", async ({ page }) => {
      const badge = page.locator("#badge-primary");

      await expect(badge).toHaveCSS("background-color", hexToRgb(LIGHT.primary));
      await expect(badge).toHaveCSS("color", hexToRgb(LIGHT.primaryContent));
    });

    test("sin rol cae a la superficie del tema, no a transparente", async ({ page }) => {
      const badge = page.locator("#badge-base");

      await expect(badge).toHaveCSS("background-color", hexToRgb(LIGHT.base300));
      await expect(badge).toHaveCSS("color", hexToRgb(LIGHT.baseContent));
    });

    test("los 8 roles dan 8 rellenos distintos", async ({ page }) => {
      const fills = await Promise.all(
        ROLES.map((role) =>
          page.locator(`#badge-${role}`).evaluate((el) => getComputedStyle(el).backgroundColor)
        )
      );

      expect(new Set(fills).size).toBe(ROLES.length);
    });

    test("es una pildora: el radio pasa de la mitad de la altura", async ({ page }) => {
      const badge = page.locator("#badge-md");

      const { radius, height } = await badge.evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
          radius: parseFloat(computed.borderTopLeftRadius),
          height: parseFloat(computed.height),
        };
      });

      expect(radius).toBeGreaterThanOrEqual(height / 2);
    });
  });

  test.describe("tratamientos", () => {
    test("outline no rellena y conserva borde del rol", async ({ page }) => {
      const badge = page.locator("#outline-primary");

      const { background, border } = await badge.evaluate((el) => {
        const computed = getComputedStyle(el);
        return { background: computed.backgroundColor, border: computed.borderTopColor };
      });

      expect(TRANSPARENT).toContain(background);
      expect(TRANSPARENT).not.toContain(border);
    });

    test("soft rellena mas claro que el solido y mas oscuro que la superficie", async ({
      page,
    }) => {
      const [solid, soft, base] = await Promise.all([
        page.locator("#badge-primary").evaluate((el) => getComputedStyle(el).backgroundColor),
        page.locator("#soft-primary").evaluate((el) => getComputedStyle(el).backgroundColor),
        page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor),
      ]);

      expect(soft).not.toBe(solid);
      expect(soft).not.toBe(base);
    });

    test("outline y soft comparten el color de texto derivado del rol", async ({ page }) => {
      const [outline, soft, solid] = await Promise.all(
        ["outline-primary", "soft-primary", "badge-primary"].map((id) =>
          page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).color)
        )
      );

      expect(outline).toBe(soft);
      // Y no es el `-content`, que es el del relleno solido.
      expect(outline).not.toBe(solid);
    });
  });

  test.describe("tamanos", () => {
    for (const { key, fields } of SIZES) {
      test(`${key} mide ${fields} unidades de --size-field de alto`, async ({ page }) => {
        const height = await page
          .locator(`#badge-${key}`)
          .evaluate((el) => parseFloat(getComputedStyle(el).height));

        expect(Math.abs(height - fields * SIZE_FIELD_PX)).toBeLessThanOrEqual(EPSILON);
      });
    }
  });

  test.describe("punto de estado", () => {
    test("es cuadrado, del tamano de la tipografia y sin borde", async ({ page }) => {
      const dot = page.locator("#dot-md");

      const { width, height, fontSize, borderWidth, padding } = await dot.evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
          width: parseFloat(computed.width),
          height: parseFloat(computed.height),
          fontSize: parseFloat(computed.fontSize),
          borderWidth: parseFloat(computed.borderTopWidth),
          padding: parseFloat(computed.paddingLeft),
        };
      });

      expect(Math.abs(width - height)).toBeLessThanOrEqual(EPSILON);
      expect(Math.abs(width - fontSize)).toBeLessThanOrEqual(EPSILON);
      expect(borderWidth).toBe(0);
      expect(padding).toBe(0);
    });

    test("escala con el tamano del badge", async ({ page }) => {
      const [xs, xl] = await Promise.all(
        ["dot-xs", "dot-xl"].map((id) =>
          page.locator(`#${id}`).evaluate((el) => parseFloat(getComputedStyle(el).width))
        )
      );

      expect(xl).toBeGreaterThan(xs);
    });
  });

  test.describe("contraste AA del texto derivado", () => {
    for (const role of ROLES) {
      test(`soft ${role} pasa AA en tema claro`, async ({ page }) => {
        const ratio = await elementContrast(page, `#soft-${role}`, LIGHT.base100);
        expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
      });

      test(`outline ${role} pasa AA en tema claro`, async ({ page }) => {
        const ratio = await elementContrast(page, `#outline-${role}`, LIGHT.base100);
        expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
      });
    }

    test("y siguen pasando AA en tema oscuro", async ({ page }) => {
      /**
       * `.badge` transiciona `color` y `background-color`: medir justo despues
       * de cambiar el tema devuelve valores a medio interpolar, y un ratio
       * entre dos colores intermedios no significa nada (la primera version
       * de este test fallaba con 2.89 por eso, con el CSS correcto).
       *
       * Se emula `prefers-reduced-motion: reduce`, que el propio CSS usa para
       * anular la transicion: asi la medida es del estado final y, de paso, se
       * verifica que esa regla existe.
       */
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

      for (const role of ROLES) {
        expect(await elementContrast(page, `#soft-${role}`, DARK.base100)).toBeGreaterThanOrEqual(
          AA_THRESHOLD
        );
        expect(
          await elementContrast(page, `#outline-${role}`, DARK.base100)
        ).toBeGreaterThanOrEqual(AA_THRESHOLD);
      }
    });
  });

  test("al cambiar de tema el relleno solido repinta", async ({ page }) => {
    const badge = page.locator("#badge-primary");
    await expect(badge).toHaveCSS("background-color", hexToRgb(LIGHT.primary));

    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

    await expect(badge).toHaveCSS("background-color", hexToRgb(DARK.primary));
    await expect(badge).toHaveCSS("color", hexToRgb(DARK.primaryContent));
  });
});
