import { test, expect } from "@playwright/test";

/**
 * E2E-12a: CSS del Card (lote 12)
 *
 * Mide sobre CSS compilado en Chromium lo que un test de RTL no puede: que
 * las reglas de `card.css` **pintan y dimensionan** de verdad.
 *
 * El fixture monta el HTML a mano, sin React: lo que se verifica es el
 * contrato de clases publicado en `@ownui/tw-theme/css`, no el componente. Si
 * el subpath export o la copia a `dist/css` se rompen, la compilacion del
 * fixture falla y este spec no llega a correr — que es justamente la senal.
 *
 * La decision que fija este spec es **D-02** de `specs/lote-12.md`: el rol NO
 * pinta el relleno del card. Un card con fondo de rol obliga a repintar todo
 * lo que lleve dentro, y su contenido es arbitrario.
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
  base300: "#e5e6e6",
  baseContent: "#1f2937",
  primary: "#3b82f6",
  error: "#ef4444",
};

/** `themes/dark.ts` */
const DARK = { base100: "#1d232a" };

/** `--size-field` vale 0.25rem = 4px, y el padding de cada tamano son N de esos. */
const SIZE_FIELD_PX = 4;
const SIZES = [
  { key: "xs", fields: 2 },
  { key: "sm", fields: 3 },
  { key: "md", fields: 4 },
  { key: "lg", fields: 5 },
  { key: "xl", fields: 6 },
];

test.beforeEach(async ({ page }) => {
  await page.goto("/card/");
});

test.describe("E2E-12a: Card", () => {
  test.describe("superficie base", () => {
    test("el relleno es la superficie del tema, no un color de rol", async ({ page }) => {
      const card = page.locator("#card-base");

      await expect(card).toHaveCSS("background-color", hexToRgb(LIGHT.base100));
      await expect(card).toHaveCSS("color", hexToRgb(LIGHT.baseContent));
    });

    test("tiene borde visible, radio y recorte", async ({ page }) => {
      const card = page.locator("#card-base");

      await expect(card).toHaveCSS("border-top-width", "1px");
      await expect(card).toHaveCSS("overflow", "hidden");

      const radius = await card.evaluate((el) =>
        parseFloat(getComputedStyle(el).borderTopLeftRadius)
      );
      expect(radius).toBeGreaterThan(0);

      const borderColor = await card.evaluate((el) => getComputedStyle(el).borderTopColor);
      expect(TRANSPARENT).not.toContain(borderColor);
    });

    test("el cuerpo crece y es quien lleva el padding", async ({ page }) => {
      const body = page.locator("#body-base");

      await expect(body).toHaveCSS("flex-grow", "1");
      const padding = await body.evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
      expect(padding).toBeGreaterThan(0);

      // El contenedor no lleva padding: una imagen a sangre no debe flotar.
      const cardPadding = await page
        .locator("#card-base")
        .evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));
      expect(cardPadding).toBe(0);
    });

    test("la cabecera y el pie tienen separador, y en lados opuestos", async ({ page }) => {
      await expect(page.locator("#header-base")).toHaveCSS("border-bottom-width", "1px");
      await expect(page.locator("#header-base")).toHaveCSS("border-top-width", "0px");
      await expect(page.locator("#footer-base")).toHaveCSS("border-top-width", "1px");
      await expect(page.locator("#footer-base")).toHaveCSS("border-bottom-width", "0px");
    });

    test("el titulo pesa mas que el cuerpo y no arrastra el margen del <h3>", async ({ page }) => {
      const title = page.locator("#title-base");

      await expect(title).toHaveCSS("font-weight", "600");
      await expect(title).toHaveCSS("margin-top", "0px");

      const [titleSize, bodySize] = await Promise.all([
        title.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
        page.locator("#body-base").evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ]);
      expect(titleSize).toBeGreaterThan(bodySize);
    });
  });

  test.describe("roles semanticos", () => {
    test("el rol colorea el borde y deja el relleno en la superficie", async ({ page }) => {
      for (const id of ["card-primary", "card-error", "card-success"]) {
        await expect(page.locator(`#${id}`)).toHaveCSS("background-color", hexToRgb(LIGHT.base100));
      }

      const borders = await Promise.all(
        ["card-base", "card-primary", "card-error"].map((id) =>
          page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).borderTopColor)
        )
      );

      // Tres bordes distintos: el del tema, el de primary y el de error.
      expect(new Set(borders).size).toBe(3);
    });

    test("el separador de la cabecera tambien sigue al rol", async ({ page }) => {
      const base = await page
        .locator("#header-base")
        .evaluate((el) => getComputedStyle(el).borderBottomColor);

      await page.locator("#card-primary").evaluate((el) => {
        const header = document.createElement("div");
        header.className = "card-header";
        header.id = "header-primary";
        el.prepend(header);
      });

      const primary = await page
        .locator("#header-primary")
        .evaluate((el) => getComputedStyle(el).borderBottomColor);

      expect(primary).not.toBe(base);
    });
  });

  test.describe("tratamientos del marco", () => {
    test("outlined usa el rol a plena intensidad y no tiene sombra", async ({ page }) => {
      const card = page.locator("#card-outlined");

      await expect(card).toHaveCSS("border-top-color", hexToRgb(LIGHT.primary));
      await expect(card).toHaveCSS("box-shadow", "none");
    });

    test("elevated tiene sombra y un borde mas difuminado que outlined", async ({ page }) => {
      const shadow = await page
        .locator("#card-elevated")
        .evaluate((el) => getComputedStyle(el).boxShadow);
      expect(shadow).not.toBe("none");

      const [elevated, outlined] = await Promise.all(
        ["card-elevated", "card-outlined"].map((id) =>
          page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).borderTopColor)
        )
      );
      expect(elevated).not.toBe(outlined);
    });

    test("ghost no pinta superficie ni borde ni sombra", async ({ page }) => {
      const card = page.locator("#card-ghost");

      const [bg, border, shadow] = await card.evaluate((el) => {
        const style = getComputedStyle(el);
        return [style.backgroundColor, style.borderTopColor, style.boxShadow];
      });

      expect(TRANSPARENT).toContain(bg);
      expect(TRANSPARENT).toContain(border);
      expect(shadow).toBe("none");
    });
  });

  test.describe("tamanos", () => {
    for (const { key, fields } of SIZES) {
      test(`${key} da ${fields} unidades de --size-field de padding en el cuerpo`, async ({
        page,
      }) => {
        const padding = await page
          .locator(`#body-${key}`)
          .evaluate((el) => parseFloat(getComputedStyle(el).paddingTop));

        expect(Math.abs(padding - fields * SIZE_FIELD_PX)).toBeLessThanOrEqual(EPSILON);
      });
    }

    test("la escala es monotona", async ({ page }) => {
      const paddings = await Promise.all(
        SIZES.map(({ key }) =>
          page.locator(`#body-${key}`).evaluate((el) => parseFloat(getComputedStyle(el).paddingTop))
        )
      );

      for (let index = 1; index < paddings.length; index += 1) {
        expect(paddings[index]).toBeGreaterThan(paddings[index - 1]);
      }
    });
  });

  test.describe("card accionable", () => {
    test("el enlace es puntero y el boton no arrastra el estilo del agente", async ({ page }) => {
      await expect(page.locator("#card-link")).toHaveCSS("cursor", "pointer");

      const button = page.locator("#card-button");
      await expect(button).toHaveCSS("cursor", "pointer");
      // `appearance: none` + `font: inherit`: un <button> nativo trae fuente
      // propia y el card tiene que verse igual que su hermano <a>.
      await expect(button).toHaveCSS("appearance", "none");

      const [linkFont, buttonFont] = await Promise.all([
        page.locator("#card-link").evaluate((el) => getComputedStyle(el).fontFamily),
        button.evaluate((el) => getComputedStyle(el).fontFamily),
      ]);
      expect(buttonFont).toBe(linkFont);
    });

    test("el hover eleva y marca el borde", async ({ page }) => {
      const card = page.locator("#card-link");

      const before = await card.evaluate((el) => getComputedStyle(el).boxShadow);
      await card.hover();

      // `.card` transiciona `box-shadow` 0.2s: leer justo despues del hover
      // devuelve el valor interpolado, que todavia es el de reposo. Se espera
      // al final de la transicion en vez de dormir un numero fijo.
      await expect
        .poll(() => card.evaluate((el) => getComputedStyle(el).boxShadow), { timeout: 2000 })
        .not.toBe(before);
      await expect(card).toHaveCSS("border-top-color", hexToRgb(LIGHT.primary));
    });

    test("el foco visible dibuja anillo fuera del borde", async ({ page }) => {
      const card = page.locator("#card-link");
      await card.focus();

      const [width, offset, style] = await card.evaluate((el) => {
        const computed = getComputedStyle(el);
        return [computed.outlineWidth, computed.outlineOffset, computed.outlineStyle];
      });

      expect(parseFloat(width)).toBeGreaterThanOrEqual(2);
      expect(parseFloat(offset)).toBeGreaterThan(0);
      expect(style).toBe("solid");
    });
  });

  test("al cambiar de tema el card repinta sin recompilar", async ({ page }) => {
    const card = page.locator("#card-base");
    await expect(card).toHaveCSS("background-color", hexToRgb(LIGHT.base100));

    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

    await expect(card).toHaveCSS("background-color", hexToRgb(DARK.base100));
  });
});
