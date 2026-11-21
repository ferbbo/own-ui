import { test, expect } from "@playwright/test";

/**
 * E2E-9: CSS de trigger y menu del Dropdown (lote 6)
 *
 * Mide sobre CSS compilado en Chromium lo que `AGENTS.md` §9.7 daba por roto:
 * los hooks de `useDropdown.tsx` emitian `dropdown-trigger`, `dropdown-menu`,
 * `dropdown-open` y las ocho variantes semanticas, y en `dropdown.css` **no
 * existia ni un selector** para ninguna de ellas. El menu salia en el flujo
 * del documento, sin posicionamiento, elevacion ni transicion.
 *
 * El test de contrato (`src/__tests__/dropdown-contract.test.ts`) ya
 * garantiza que cada clase emitida tiene selector. Lo que se comprueba aqui es
 * lo que un test de texto no puede: que esas reglas **pintan y posicionan** de
 * verdad en un navegador.
 */

/** Umbral de tolerancia en px para comparar geometria. */
const EPSILON = 1;

/** Hex de `themes/*.ts` → el formato que devuelve `getComputedStyle`. */
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

/** Escala de altura del trigger: la misma que `.btn` (n × --size-field). */
const TRIGGER_HEIGHTS = {
  xs: 24,
  sm: 32,
  lg: 48,
  xl: 56,
} as const;

test.describe("E2E-9: Dropdown menu and trigger", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dropdown/");
  });

  test.describe("AC-1: el panel abierto se posiciona y se eleva", () => {
    test("position computado es absolute", async ({ page }) => {
      const position = await page.evaluate(() =>
        window.getComputedProp("dd-open-menu", "position")
      );

      expect(position).toBe("absolute");
    });

    test("box-shadow no es none", async ({ page }) => {
      const shadow = await page.evaluate(() =>
        window.getComputedProp("dd-open-menu", "box-shadow")
      );

      expect(shadow).not.toBe("none");
      expect(shadow).toBeTruthy();
    });

    test("tiene contexto de apilamiento propio (z-index resuelto)", async ({ page }) => {
      const zIndex = await page.evaluate(() => window.getComputedProp("dd-open-menu", "z-index"));

      expect(zIndex).not.toBe("auto");
      expect(Number(zIndex)).toBeGreaterThan(0);
    });

    test("flota bajo el trigger en vez de empujar el contenido", async ({ page }) => {
      const rects = await page.evaluate(() => ({
        trigger: window.getRect("dd-open-trigger"),
        menu: window.getRect("dd-open-menu"),
        wrapper: window.getRect("dd-open"),
      }));

      expect(rects.menu).not.toBeNull();
      expect(rects.trigger).not.toBeNull();

      // El panel empieza por debajo del trigger...
      expect(rects.menu!.top).toBeGreaterThanOrEqual(
        rects.trigger!.top + rects.trigger!.height - EPSILON
      );
      // ...alineado a su borde de inicio...
      expect(Math.abs(rects.menu!.left - rects.trigger!.left)).toBeLessThanOrEqual(EPSILON);
      // ...y fuera del flujo: el wrapper mide solo lo que mide el trigger.
      expect(Math.abs(rects.wrapper!.height - rects.trigger!.height)).toBeLessThanOrEqual(EPSILON);
    });

    test("el panel tiene superficie, radio y min-width del ancho del trigger", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        bg: window.getElementBgColor("dd-open-menu"),
        radius: window.getComputedProp("dd-open-menu", "border-radius"),
        token: window.getCSSVariable(":root", "--color-base-100"),
        menu: window.getRect("dd-open-menu"),
        trigger: window.getRect("dd-open-trigger"),
      }));

      expect(TRANSPARENT).not.toContain(computed.bg);
      expect(computed.bg).toBe(hexToRgb(computed.token!));
      expect(computed.radius).not.toBe("0px");
      expect(computed.menu!.width).toBeGreaterThanOrEqual(computed.trigger!.width - EPSILON);
    });

    test("el wrapper .dropdown no pinta: solo posiciona", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        position: window.getComputedProp("dd-wrapper-only", "position"),
        bg: window.getElementBgColor("dd-wrapper-only"),
        shadow: window.getComputedProp("dd-wrapper-only", "box-shadow"),
      }));

      // Es el cambio de semantica del lote 6 (D-02): la superficie se movio al
      // panel, porque el wrapper envuelve tambien al trigger.
      expect(computed.position).toBe("relative");
      expect(TRANSPARENT).toContain(computed.bg);
      expect(computed.shadow).toBe("none");
    });
  });

  test.describe("Estados de apertura", () => {
    test("el menu abierto es visible y opaco", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        visibility: window.getComputedProp("dd-open-menu", "visibility"),
        opacity: window.getComputedProp("dd-open-menu", "opacity"),
      }));

      expect(computed.visibility).toBe("visible");
      expect(computed.opacity).toBe("1");
    });

    test("el menu cerrado queda oculto y sin eventos", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        visibility: window.getComputedProp("dd-closed-menu", "visibility"),
        opacity: window.getComputedProp("dd-closed-menu", "opacity"),
        pointerEvents: window.getComputedProp("dd-closed-menu", "pointer-events"),
      }));

      expect(computed.visibility).toBe("hidden");
      expect(computed.opacity).toBe("0");
      expect(computed.pointerEvents).toBe("none");
    });

    test("el trigger abierto se pinta distinto del cerrado", async ({ page }) => {
      const colors = await page.evaluate(() => ({
        active: window.getElementBgColor("dd-open-trigger"),
        idle: window.getElementBgColor("dd-closed-trigger"),
      }));

      // .dropdown-trigger-active hunde el fondo por --active-depth.
      expect(colors.active).not.toBe(colors.idle);
    });
  });

  test.describe("AC-3: las 8 variantes semanticas aplican color distinto", () => {
    test("cada panel toma el token de su rol", async ({ page }) => {
      const measured = await page.evaluate((roles) => {
        return roles.map((role) => ({
          role,
          bg: window.getElementBgColor(`menu-${role}`),
          token: window.getCSSVariable(":root", `--color-${role}`),
        }));
      }, ROLES);

      for (const { role, bg, token } of measured) {
        expect(token, `--color-${role} debe existir`).toBeTruthy();
        expect(bg, `el panel ${role} debe pintar su token`).toBe(hexToRgb(token!));
      }
    });

    test("los 8 fondos son distintos entre si", async ({ page }) => {
      const backgrounds = await page.evaluate(
        (roles) => roles.map((role) => window.getElementBgColor(`menu-${role}`)),
        ROLES
      );

      expect(new Set(backgrounds).size).toBe(ROLES.length);
    });

    test("el texto del item usa el -content de su rol", async ({ page }) => {
      const measured = await page.evaluate(
        (roles) =>
          roles.map((role) => ({
            role,
            fg: window.getElementTextColor(`item-${role}`),
            token: window.getCSSVariable(":root", `--color-${role}-content`),
          })),
        ROLES
      );

      for (const { role, fg, token } of measured) {
        expect(fg, `el item ${role} debe usar --color-${role}-content`).toBe(hexToRgb(token!));
      }
    });

    test("el trigger hereda el rol del wrapper", async ({ page }) => {
      const measured = await page.evaluate(
        (roles) =>
          roles.map((role) => ({
            role,
            bg: window.getElementBgColor(`trigger-${role}`),
            token: window.getCSSVariable(":root", `--color-${role}`),
          })),
        ROLES
      );

      // Antes del lote 6 el trigger no heredaba ningun estilo semantico
      // (hallazgo registrado en specs/lote-2.md, G-01).
      for (const { role, bg, token } of measured) {
        expect(bg, `el trigger ${role} debe pintar su token`).toBe(hexToRgb(token!));
      }
    });
  });

  test.describe("Tamanos", () => {
    test("la altura del trigger sigue la escala de .btn", async ({ page }) => {
      const heights = await page.evaluate(() => ({
        xs: window.getComputedProp("trigger-xs", "height"),
        sm: window.getComputedProp("trigger-sm", "height"),
        md: window.getComputedProp("dd-open-trigger", "height"),
        lg: window.getComputedProp("trigger-lg", "height"),
        xl: window.getComputedProp("trigger-xl", "height"),
      }));

      expect(heights.xs).toBe(`${TRIGGER_HEIGHTS.xs}px`);
      expect(heights.sm).toBe(`${TRIGGER_HEIGHTS.sm}px`);
      expect(heights.md).toBe("40px");
      expect(heights.lg).toBe(`${TRIGGER_HEIGHTS.lg}px`);
      expect(heights.xl).toBe(`${TRIGGER_HEIGHTS.xl}px`);
    });

    test("el padding del item crece con el tamano", async ({ page }) => {
      const paddings = await page.evaluate(() => ({
        xs: window.getComputedProp("item-xs", "padding-left"),
        md: window.getComputedProp("dd-open-item", "padding-left"),
        xl: window.getComputedProp("item-xl", "padding-left"),
      }));

      expect(parseFloat(paddings.xs!)).toBeLessThan(parseFloat(paddings.md!));
      expect(parseFloat(paddings.md!)).toBeLessThan(parseFloat(paddings.xl!));
    });
  });

  test.describe("Variantes de estilo", () => {
    test("ghost deja el panel sin superficie ni elevacion", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        bg: window.getElementBgColor("menu-ghost"),
        shadow: window.getComputedProp("menu-ghost", "box-shadow"),
        itemBg: window.getElementBgColor("item-ghost"),
      }));

      expect(TRANSPARENT).toContain(computed.bg);
      expect(computed.shadow).toBe("none");
      expect(TRANSPARENT).toContain(computed.itemBg);
    });

    test("bordered dibuja el borde en el panel, no en el wrapper", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        menu: window.getComputedProp("menu-bordered", "border-top-width"),
        plain: window.getComputedProp("dd-open-menu", "border-top-width"),
      }));

      expect(computed.menu).toBe("1px");
      expect(computed.plain).toBe("0px");
    });

    test("compact reduce el padding del panel", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        compact: window.getComputedProp("menu-compact", "padding-top"),
        plain: window.getComputedProp("dd-open-menu", "padding-top"),
      }));

      expect(parseFloat(computed.compact!)).toBeLessThan(parseFloat(computed.plain!));
    });
  });

  test.describe('data-theme="dark" cambia el panel', () => {
    test("el panel sin variante toma la superficie oscura", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        dark: window.getElementBgColor("dd-dark-menu"),
        light: window.getElementBgColor("dd-open-menu"),
        token: window.getCSSVariable('[data-theme="dark"]', "--color-base-100"),
      }));

      expect(computed.dark).not.toBe(computed.light);
      expect(computed.dark).toBe(hexToRgb(computed.token!));
    });

    test("la variante primary tambien cambia de tono", async ({ page }) => {
      const computed = await page.evaluate(() => ({
        dark: window.getElementBgColor("dd-dark-menu-primary"),
        light: window.getElementBgColor("menu-primary"),
      }));

      expect(computed.dark).not.toBe(computed.light);
    });
  });

  test.describe("AC-4: prefers-reduced-motion anula la transicion", () => {
    test("con movimiento normal el panel tiene transicion", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });

      const duration = await page.evaluate(() =>
        window.getComputedProp("dd-open-menu", "transition-duration")
      );

      expect(duration).not.toBe("0s");
      expect(parseFloat(duration!)).toBeGreaterThan(0);
    });

    test("con reduce la transicion queda en 0s en panel, trigger e item", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });

      const durations = await page.evaluate(() => ({
        menu: window.getComputedProp("dd-open-menu", "transition-duration"),
        trigger: window.getComputedProp("dd-open-trigger", "transition-duration"),
        item: window.getComputedProp("dd-open-item", "transition-duration"),
      }));

      expect(durations.menu).toBe("0s");
      expect(durations.trigger).toBe("0s");
      expect(durations.item).toBe("0s");
    });

    test("con reduce el panel sigue siendo visible (no se oculta)", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });

      const computed = await page.evaluate(() => ({
        visibility: window.getComputedProp("dd-open-menu", "visibility"),
        opacity: window.getComputedProp("dd-open-menu", "opacity"),
      }));

      expect(computed.visibility).toBe("visible");
      expect(computed.opacity).toBe("1");
    });
  });
});
