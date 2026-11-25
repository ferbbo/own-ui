import { test, expect } from "@playwright/test";

/**
 * E2E-11: CSS de checkbox, radio y switch (lote 11)
 *
 * La tesis que fija este spec es la de la ficha L11: los tres controles
 * **comparten los tokens `--control-*`** pero no la geometria. Un test de
 * texto puede comprobar que las clases existen; solo el navegador puede
 * comprobar que una casilla, un radio y un switch del mismo tamano se
 * alinean de verdad cuando conviven en un formulario, que es la unica razon
 * por la que esos tokens son globales y no de cada componente.
 *
 * El fixture monta HTML a mano, sin React, e importa `@ownui/tw-theme/css`:
 * si el subpath export o la copia a `dist/css` se rompen, la compilacion
 * falla y el spec no llega a correr.
 */

const EPSILON = 1;

const hexToRgb = (hex: string): string => {
  const normalized = hex.trim().replace(/^#/, "");
  const full =
    normalized.length === 3 ? [...normalized].map((char) => char + char).join("") : normalized;
  const [r, g, b] = [0, 2, 4].map((offset) => parseInt(full.slice(offset, offset + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

/** `themes/light.ts` */
const LIGHT = {
  primary: "#3b82f6",
  success: "#22c55e",
  error: "#ef4444",
  base100: "#ffffff",
};

const SIZE_FIELD_PX = 4;

const box = (page: import("@playwright/test").Page, id: string) => page.locator(`#${id}`);

const rect = (page: import("@playwright/test").Page, id: string) =>
  box(page, id).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });

test.beforeEach(async ({ page }) => {
  await page.goto("/controls/");
});

test.describe("E2E-11: controles marcables", () => {
  test.describe("la capa --control-* alinea a los tres", () => {
    test("a tamano md los tres miden lo mismo de alto", async ({ page }) => {
      const [checkbox, radio, sw] = await Promise.all([
        rect(page, "box-cb-md"),
        rect(page, "box-rd-md"),
        rect(page, "box-sw-md"),
      ]);

      expect(Math.abs(checkbox.height - radio.height)).toBeLessThanOrEqual(EPSILON);
      expect(Math.abs(checkbox.height - sw.height)).toBeLessThanOrEqual(EPSILON);
      // Y esa altura es la que dice --control-size: 5 x --size-field.
      expect(Math.abs(checkbox.height - 5 * SIZE_FIELD_PX)).toBeLessThanOrEqual(EPSILON);
    });

    test("la geometria si es distinta: la casilla es cuadrada, el radio redondo y el switch alargado", async ({
      page,
    }) => {
      const [checkbox, radio, sw] = await Promise.all([
        rect(page, "box-cb-md"),
        rect(page, "box-rd-md"),
        rect(page, "box-sw-md"),
      ]);

      expect(Math.abs(checkbox.width - checkbox.height)).toBeLessThanOrEqual(EPSILON);
      expect(Math.abs(radio.width - radio.height)).toBeLessThanOrEqual(EPSILON);
      expect(sw.width).toBeGreaterThan(sw.height * 1.5);

      // El radio es un circulo completo; la casilla, un cuadrado redondeado.
      await expect(box(page, "box-rd-md")).toHaveCSS("border-radius", "50%");
      await expect(box(page, "box-cb-md")).toHaveCSS("border-radius", "6px");
    });

    test("los tres separan el control de su texto con el mismo hueco", async ({ page }) => {
      const gaps = await page.evaluate(() =>
        ["checkbox-field", "radio-field", "switch-field"].map(
          (cls) => getComputedStyle(document.querySelector(`.${cls}`) as Element).gap
        )
      );

      expect(new Set(gaps).size).toBe(1);
      expect(gaps[0]).toBe("8px");
    });
  });

  test.describe("marcado", () => {
    test("la casilla marcada se rellena con el rol", async ({ page }) => {
      await expect(box(page, "box-cb-on")).toHaveCSS("background-color", hexToRgb(LIGHT.primary));
      await expect(box(page, "box-cb-on")).toHaveCSS("border-top-color", hexToRgb(LIGHT.primary));
    });

    test("el radio marcado NO se rellena: solo tine el marco y el punto", async ({ page }) => {
      // Es la diferencia deliberada con la casilla: un circulo relleno con un
      // punto del mismo color no se leeria.
      await expect(box(page, "box-rd-on")).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(box(page, "box-rd-on")).toHaveCSS("border-top-color", hexToRgb(LIGHT.primary));
      await expect(box(page, "mark-rd-on")).toHaveCSS("background-color", hexToRgb(LIGHT.primary));
    });

    test("la pista del switch toma el rol y el pulgar se desplaza", async ({ page }) => {
      await expect(box(page, "box-sw-on")).toHaveCSS("background-color", hexToRgb(LIGHT.primary));

      const [off, on] = await Promise.all([
        box(page, "thumb-md").evaluate((el) => el.getBoundingClientRect().left),
        box(page, "thumb-on").evaluate((el) => el.getBoundingClientRect().left),
      ]);
      const [offTrack, onTrack] = await Promise.all([
        box(page, "box-sw-md").evaluate((el) => el.getBoundingClientRect().left),
        box(page, "box-sw-on").evaluate((el) => el.getBoundingClientRect().left),
      ]);

      // El pulgar encendido esta mas a la derecha dentro de su pista.
      expect(on - onTrack).toBeGreaterThan(off - offTrack + 2);
    });

    test("el trazo solo se ve cuando la casilla participa", async ({ page }) => {
      const marcada = await box(page, "box-cb-on")
        .locator(".checkbox-mark")
        .evaluate((el) => getComputedStyle(el).opacity);
      const vacia = await box(page, "box-cb-md")
        .locator(".checkbox-mark")
        .evaluate((el) => getComputedStyle(el).opacity);

      expect(Number(marcada)).toBe(1);
      expect(Number(vacia)).toBe(0);
    });

    test("el indeterminado pinta igual que el marcado y ensena su propio trazo", async ({
      page,
    }) => {
      await expect(box(page, "box-cb-mixed")).toHaveCSS(
        "background-color",
        hexToRgb(LIGHT.primary)
      );
      await expect(box(page, "mark-cb-mixed")).toHaveCSS("opacity", "1");
    });
  });

  test.describe("roles", () => {
    test("cada rol pinta su color en los tres controles", async ({ page }) => {
      await expect(box(page, "box-cb-success")).toHaveCSS(
        "background-color",
        hexToRgb(LIGHT.success)
      );
      await expect(box(page, "box-cb-error")).toHaveCSS("background-color", hexToRgb(LIGHT.error));
      await expect(box(page, "mark-rd-success")).toHaveCSS(
        "background-color",
        hexToRgb(LIGHT.success)
      );
      await expect(box(page, "box-sw-success")).toHaveCSS(
        "background-color",
        hexToRgb(LIGHT.success)
      );
    });
  });

  test.describe("tamanos", () => {
    test("la casilla escala de forma monotona", async ({ page }) => {
      const sizes = [];
      for (const id of ["box-cb-xs", "box-cb-sm", "box-cb-md", "box-cb-lg", "box-cb-xl"]) {
        sizes.push((await rect(page, id)).height);
      }

      for (let i = 1; i < sizes.length; i += 1) {
        expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
      }
    });

    test("los tres siguen alineados en los extremos de la escala", async ({ page }) => {
      for (const size of ["xs", "xl"]) {
        const [checkbox, radio, sw] = await Promise.all([
          rect(page, `box-cb-${size}`),
          rect(page, `box-rd-${size}`),
          rect(page, `box-sw-${size}`),
        ]);

        expect(Math.abs(checkbox.height - radio.height)).toBeLessThanOrEqual(EPSILON);
        expect(Math.abs(checkbox.height - sw.height)).toBeLessThanOrEqual(EPSILON);
      }
    });

    test("el switch mantiene la proporcion al cambiar de tamano", async ({ page }) => {
      const [xs, xl] = await Promise.all([rect(page, "box-sw-xs"), rect(page, "box-sw-xl")]);

      expect(xs.width / xs.height).toBeCloseTo(xl.width / xl.height, 1);
    });
  });

  test.describe("estados", () => {
    test("invalid tine el marco con el rol error", async ({ page }) => {
      await expect(box(page, "box-cb-invalid")).toHaveCSS(
        "border-top-color",
        hexToRgb(LIGHT.error)
      );
      await expect(box(page, "box-rd-invalid")).toHaveCSS(
        "border-top-color",
        hexToRgb(LIGHT.error)
      );
    });

    test("disabled atenua los tres sin ocultarlos", async ({ page }) => {
      for (const id of ["box-cb-disabled", "box-sw-disabled"]) {
        const opacity = Number(await box(page, id).evaluate((el) => getComputedStyle(el).opacity));
        expect(opacity).toBeGreaterThan(0);
        expect(opacity).toBeLessThan(1);
      }
    });
  });

  test.describe("el grupo", () => {
    test("apila etiqueta, opciones y ayuda en columna", async ({ page }) => {
      await expect(box(page, "cb-group")).toHaveCSS("display", "flex");
      await expect(box(page, "cb-group")).toHaveCSS("flex-direction", "column");
      await expect(box(page, "cb-group-items")).toHaveCSS("flex-direction", "column");
    });

    test("el mensaje de error usa el rol error y la ayuda va atenuada", async ({ page }) => {
      await expect(box(page, "cb-group-error")).toHaveCSS("color", hexToRgb(LIGHT.error));

      const ayuda = await box(page, "cb-group-description").evaluate(
        (el) => getComputedStyle(el).color
      );
      const etiqueta = await box(page, "cb-group-label").evaluate(
        (el) => getComputedStyle(el).color
      );
      expect(ayuda).not.toBe(etiqueta);
    });
  });

  test.describe("tema oscuro", () => {
    test("los tres repintan al cambiar data-theme", async ({ page }) => {
      const before = await box(page, "box-sw-md").evaluate(
        (el) => getComputedStyle(el).backgroundColor
      );

      await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

      // `toHaveCSS` reintenta: el control transiciona el color de fondo, asi
      // que una lectura inmediata devuelve un valor interpolado.
      await expect
        .poll(async () =>
          box(page, "box-sw-md").evaluate((el) => getComputedStyle(el).backgroundColor)
        )
        .not.toBe(before);
    });
  });
});
