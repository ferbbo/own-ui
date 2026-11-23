import { test, expect } from "@playwright/test";

/**
 * E2E-10: CSS del Input (lote 10)
 *
 * Mide sobre CSS compilado en Chromium lo que un test de texto no puede: que
 * las reglas de `input.css` **pintan y dimensionan** de verdad.
 *
 * El fixture monta el HTML a mano, sin React: lo que se verifica es el
 * contrato de clases publicado en `@ownui/tw-theme/css`, no el componente.
 * Si el subpath export o la copia a `dist/css` se rompen, la compilacion del
 * fixture falla y este spec no llega a correr — que es justamente la senal.
 *
 * La decision que fija este spec es **D-01** de `specs/lote-10.md`: el rol
 * NO pinta el relleno del campo. Un input primary con fondo azul es ilegible
 * en cuanto lleva texto, asi que el rol colorea el borde y el anillo de foco
 * y el relleno se queda en la superficie del tema.
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

/** `themes/light.ts` */
const LIGHT = {
  base100: "#ffffff",
  base200: "#f2f2f2",
  baseContent: "#1f2937",
  primary: "#3b82f6",
  primaryFocus: "#2563eb",
  error: "#ef4444",
};

/** `--size-field` vale 0.25rem = 4px, y cada tamano son N de esos. */
const SIZE_FIELD_PX = 4;
const SIZES = [
  { key: "xs", fields: 6 },
  { key: "sm", fields: 8 },
  { key: "md", fields: 10 },
  { key: "lg", fields: 12 },
  { key: "xl", fields: 14 },
];

test.beforeEach(async ({ page }) => {
  await page.goto("/input/");
});

test.describe("E2E-10: Input", () => {
  test.describe("la caja base existe y se pinta", () => {
    test(".input tiene relleno, borde y radio propios", async ({ page }) => {
      const box = page.locator("#box-base");

      await expect(box).toHaveCSS("background-color", hexToRgb(LIGHT.base100));
      await expect(box).toHaveCSS("border-radius", "6px");
      await expect(box).toHaveCSS("color", hexToRgb(LIGHT.baseContent));

      const borderWidth = await box.evaluate((el) => getComputedStyle(el).borderTopWidth);
      expect(parseFloat(borderWidth)).toBeCloseTo(1, 1);
    });

    test("el borde en reposo no es ni transparente ni el color crudo del rol", async ({ page }) => {
      // Se mezcla hacia la superficie: visible, pero sin gritar.
      const borderColor = await page
        .locator("#box-primary")
        .evaluate((el) => getComputedStyle(el).borderTopColor);

      expect(TRANSPARENT).not.toContain(borderColor);
      expect(borderColor).not.toBe(hexToRgb(LIGHT.primary));
    });

    test("el <input> nativo no pinta marco propio: lo pinta la caja", async ({ page }) => {
      const control = page.locator("#base");

      await expect(control).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      const borderWidth = await control.evaluate((el) => getComputedStyle(el).borderTopWidth);
      expect(parseFloat(borderWidth)).toBe(0);
    });
  });

  test.describe("D-01: el rol colorea el borde, no el relleno", () => {
    for (const role of ["primary", "success", "error"]) {
      test(`.input-${role} deja el relleno en la superficie del tema`, async ({ page }) => {
        await expect(page.locator(`#box-${role}`)).toHaveCSS(
          "background-color",
          hexToRgb(LIGHT.base100)
        );
      });
    }

    test("roles distintos dan bordes distintos", async ({ page }) => {
      const read = (id: string) =>
        page.locator(id).evaluate((el) => getComputedStyle(el).borderTopColor);

      const [primary, success, error] = await Promise.all([
        read("#box-primary"),
        read("#box-success"),
        read("#box-error"),
      ]);

      expect(new Set([primary, success, error]).size).toBe(3);
    });
  });

  test.describe("tratamientos del marco", () => {
    test("outline deja la caja sin relleno y el borde a plena intensidad", async ({ page }) => {
      const box = page.locator("#box-outline");

      await expect(box).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(box).toHaveCSS("border-top-color", hexToRgb(LIGHT.primary));
    });

    test("ghost no pinta ni relleno ni borde en reposo", async ({ page }) => {
      const box = page.locator("#box-ghost");

      await expect(box).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(box).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
    });

    test("bordered dobla el grosor del marco", async ({ page }) => {
      const read = (id: string) =>
        page.locator(id).evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));

      const [base, bordered] = await Promise.all([read("#box-base"), read("#box-bordered")]);

      expect(bordered).toBeCloseTo(base * 2, 1);
    });
  });

  test.describe("tamanos derivados de --size-field", () => {
    for (const { key, fields } of SIZES) {
      test(`.input-${key} mide ${fields} x --size-field de alto`, async ({ page }) => {
        const height = await page
          .locator(`#box-${key}`)
          .evaluate((el) => el.getBoundingClientRect().height);

        expect(Math.abs(height - fields * SIZE_FIELD_PX)).toBeLessThanOrEqual(EPSILON);
      });
    }

    test("la escala es monotona creciente", async ({ page }) => {
      const heights = [];
      for (const { key } of SIZES) {
        heights.push(
          await page.locator(`#box-${key}`).evaluate((el) => el.getBoundingClientRect().height)
        );
      }

      for (let i = 1; i < heights.length; i += 1) {
        expect(heights[i]).toBeGreaterThan(heights[i - 1]);
      }
    });
  });

  test.describe("estados", () => {
    test("invalid tiene el borde con el rol error", async ({ page }) => {
      await expect(page.locator("#box-invalid")).toHaveCSS(
        "border-top-color",
        hexToRgb(LIGHT.error)
      );
    });

    test("readonly cambia la superficie y el cursor", async ({ page }) => {
      const box = page.locator("#box-readonly");

      await expect(box).toHaveCSS("background-color", hexToRgb(LIGHT.base200));
      await expect(box).toHaveCSS("cursor", "default");
    });

    test("disabled apaga el relleno y marca el cursor", async ({ page }) => {
      const box = page.locator("#box-disabled");

      await expect(box).toHaveCSS("cursor", "not-allowed");

      // El relleno se mezcla contra #0000, asi que deja de ser opaco. Chromium
      // serializa un `color-mix(in oklab, ...)` como `oklab(... / alpha)`, no
      // como `rgba()`: lo que se comprueba es el canal alfa, no el formato.
      const bg = await box.evaluate((el) => getComputedStyle(el).backgroundColor);
      const enabled = await page
        .locator("#box-base")
        .evaluate((el) => getComputedStyle(el).backgroundColor);

      expect(bg).not.toBe(enabled);
      expect(bg).toContain("/ 0.6");
    });
  });

  test.describe("el anillo de foco vive en la caja", () => {
    test("al enfocar el control, la caja dibuja el outline", async ({ page }) => {
      const box = page.locator("#box-primary");

      const before = await box.evaluate((el) => getComputedStyle(el).outlineStyle);
      expect(before).toBe("none");

      await page.locator("#primary").focus();

      await expect(box).toHaveCSS("outline-style", "solid");
      // El anillo usa --input-focus-color (el token `-focus` del rol), que es
      // el color curado del tema para interaccion, no el color de reposo.
      await expect(box).toHaveCSS("outline-color", hexToRgb(LIGHT.primaryFocus));
      const width = await box.evaluate((el) => parseFloat(getComputedStyle(el).outlineWidth));
      expect(width).toBeCloseTo(2, 1);
    });

    test("el <input> no dibuja su propio outline al enfocarse", async ({ page }) => {
      await page.locator("#primary").focus();

      await expect(page.locator("#primary")).toHaveCSS("outline-style", "none");
    });
  });

  test.describe("partes del campo", () => {
    test("el contenedor apila label, caja y ayuda en columna", async ({ page }) => {
      const field = page.locator("#field-base");

      await expect(field).toHaveCSS("display", "flex");
      await expect(field).toHaveCSS("flex-direction", "column");
    });

    test("la ayuda se ve atenuada respecto al texto del campo", async ({ page }) => {
      const color = await page
        .locator("#description-base")
        .evaluate((el) => getComputedStyle(el).color);

      expect(color).not.toBe(hexToRgb(LIGHT.baseContent));
      expect(TRANSPARENT).not.toContain(color);
    });

    test("el mensaje de error usa el rol error", async ({ page }) => {
      await expect(page.locator("#error-message")).toHaveCSS("color", hexToRgb(LIGHT.error));
    });

    test("los iconos no capturan el puntero", async ({ page }) => {
      await expect(page.locator("#icon-start")).toHaveCSS("pointer-events", "none");
      await expect(page.locator("#icon-end")).toHaveCSS("pointer-events", "none");
    });
  });

  test.describe("tema oscuro", () => {
    test("la caja repinta al cambiar data-theme sin recompilar", async ({ page }) => {
      const box = page.locator("#box-base");
      const light = await box.evaluate((el) => getComputedStyle(el).backgroundColor);

      await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

      // `toHaveCSS` reintenta, y hacen falta las dos razones por las que una
      // lectura inmediata falla: Chromium no recalcula la propiedad que
      // consume `--input-bg` hasta el siguiente ciclo de estilo, y encima
      // `.input` transiciona `background-color` durante
      // --transition-duration, asi que a mitad de camino devuelve un color
      // interpolado que no es ni el claro ni el oscuro.
      expect(light).toBe("rgb(255, 255, 255)");
      await expect(box).toHaveCSS("background-color", "rgb(29, 35, 42)");
    });
  });
});
