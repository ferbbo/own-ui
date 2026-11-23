import { test, expect } from "@playwright/test";
import { AA_THRESHOLD, elementContrast } from "./support/contrast";

/**
 * E2E-12c: CSS del Avatar (lote 12)
 *
 * Mide sobre CSS compilado en Chromium la geometria del avatar (caja
 * cuadrada, forma, recorte, solapamiento del grupo) y el contraste de las
 * iniciales, que el CSS calcula con `color-mix` y por tanto no se puede
 * verificar leyendo el archivo. Ver la nota de `support/contrast.ts`.
 */

const EPSILON = 1;

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

const LIGHT = { base100: "#ffffff" };
const DARK = { base100: "#1d232a" };

/** `--size-field` = 0.25rem = 4px. */
const SIZE_FIELD_PX = 4;
const SIZES = [
  { key: "xs", fields: 6 },
  { key: "sm", fields: 8 },
  { key: "md", fields: 10 },
  { key: "lg", fields: 12 },
  { key: "xl", fields: 16 },
];

/** Factor de solapamiento del grupo (`--avatar-group-overlap`). */
const OVERLAP = 0.3;

test.beforeEach(async ({ page }) => {
  await page.goto("/avatar/");
});

test.describe("E2E-12c: Avatar", () => {
  test.describe("caja", () => {
    test("es cuadrada y recorta su contenido", async ({ page }) => {
      const avatar = page.locator("#avatar-primary");

      const { width, height, overflow } = await avatar.evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
          width: parseFloat(computed.width),
          height: parseFloat(computed.height),
          overflow: computed.overflow,
        };
      });

      expect(Math.abs(width - height)).toBeLessThanOrEqual(EPSILON);
      expect(overflow).toBe("hidden");
    });

    test("no se encoge dentro de un contenedor flex", async ({ page }) => {
      // `flex: 0 0 auto`: en una fila de miembros, un avatar aplastado es un
      // ovalo. El grupo es justo ese caso.
      await expect(page.locator("#group-1")).toHaveCSS("flex-shrink", "0");
    });

    for (const { key, fields } of SIZES) {
      test(`${key} mide ${fields} unidades de --size-field`, async ({ page }) => {
        const width = await page
          .locator(`#avatar-${key}`)
          .evaluate((el) => parseFloat(getComputedStyle(el).width));

        expect(Math.abs(width - fields * SIZE_FIELD_PX)).toBeLessThanOrEqual(EPSILON);
      });
    }

    test("la tipografia de las iniciales es una fraccion del lado", async ({ page }) => {
      const [xs, xl] = await Promise.all(
        ["avatar-xs", "avatar-xl"].map((id) =>
          page.locator(`#${id}`).evaluate((el) => {
            const computed = getComputedStyle(el);
            return {
              size: parseFloat(computed.width),
              font: parseFloat(computed.fontSize),
            };
          })
        )
      );

      // Misma proporcion en los dos extremos de la escala: es lo que compra
      // calcular la tipografia en vez de tener cinco valores sueltos.
      expect(Math.abs(xs.font / xs.size - xl.font / xl.size)).toBeLessThan(0.01);
    });
  });

  test.describe("formas", () => {
    test("el circulo redondea mas que la mitad del lado", async ({ page }) => {
      const { radius, width } = await page.locator("#avatar-circle").evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
          radius: parseFloat(computed.borderTopLeftRadius),
          width: parseFloat(computed.width),
        };
      });

      expect(radius).toBeGreaterThanOrEqual(width / 2);
    });

    test("el cuadrado tiene radio propio y escala con el lado", async ({ page }) => {
      const [md, xl] = await Promise.all(
        ["avatar-square", "avatar-square-xl"].map((id) =>
          page.locator(`#${id}`).evaluate((el) => {
            const computed = getComputedStyle(el);
            return {
              radius: parseFloat(computed.borderTopLeftRadius),
              width: parseFloat(computed.width),
            };
          })
        )
      );

      expect(md.radius).toBeGreaterThan(0);
      expect(md.radius).toBeLessThan(md.width / 2);
      expect(xl.radius).toBeGreaterThan(md.radius);
    });
  });

  test.describe("contenidos", () => {
    test("la imagen llena la caja y se recorta por el centro", async ({ page }) => {
      const image = page.locator("#image");

      await expect(image).toHaveCSS("object-fit", "cover");

      const [box, img] = await Promise.all([
        page.locator("#avatar-image").evaluate((el) => el.getBoundingClientRect().width),
        image.evaluate((el) => el.getBoundingClientRect().width),
      ]);

      expect(Math.abs(box - img)).toBeLessThanOrEqual(EPSILON);
    });

    test("el icono de reserva deja aire alrededor", async ({ page }) => {
      const [box, icon] = await Promise.all([
        page.locator("#avatar-fallback").evaluate((el) => el.getBoundingClientRect().width),
        page.locator("#fallback").evaluate((el) => el.getBoundingClientRect().width),
      ]);

      expect(icon).toBeLessThan(box);
      expect(icon).toBeGreaterThan(box * 0.4);
    });

    test("las iniciales van en mayusculas aunque lleguen en minusculas", async ({ page }) => {
      await expect(page.locator("#initials-primary")).toHaveCSS("text-transform", "uppercase");
    });
  });

  test.describe("grupo", () => {
    test("los avatares se solapan a partir del segundo", async ({ page }) => {
      const [first, second] = await Promise.all(
        ["group-1", "group-2"].map((id) =>
          page
            .locator(`#${id}`)
            .evaluate((el) => parseFloat(getComputedStyle(el).marginInlineStart))
        )
      );

      expect(first).toBe(0);

      const size = await page
        .locator("#group-1")
        .evaluate((el) => parseFloat(getComputedStyle(el).width));

      expect(second).toBeLessThan(0);
      expect(Math.abs(second + size * OVERLAP)).toBeLessThanOrEqual(EPSILON);
    });

    test("cada avatar del grupo lleva anillo de la superficie y fuera no", async ({ page }) => {
      const inGroup = await page
        .locator("#group-2")
        .evaluate((el) => getComputedStyle(el).boxShadow);
      const outside = await page
        .locator("#avatar-primary")
        .evaluate((el) => getComputedStyle(el).boxShadow);

      expect(inGroup).not.toBe("none");
      expect(inGroup).toContain("0px 0px 0px 2px");
      // Fuera del grupo el anillo mide 0: la regla existe pero no se ve.
      expect(outside === "none" || outside.includes("0px 0px 0px 0px")).toBe(true);
    });

    test("el solapamiento deja el conjunto mas estrecho que la suma de los lados", async ({
      page,
    }) => {
      const [groupWidth, itemWidth] = await Promise.all([
        page.locator("#group").evaluate((el) => el.getBoundingClientRect().width),
        page.locator("#group-1").evaluate((el) => el.getBoundingClientRect().width),
      ]);

      expect(groupWidth).toBeLessThan(itemWidth * 3);
    });
  });

  test.describe("contraste AA de las iniciales", () => {
    for (const role of ROLES) {
      test(`${role} pasa AA en tema claro`, async ({ page }) => {
        const ratio = await elementContrast(page, `#avatar-${role}`, LIGHT.base100);
        expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
      });
    }

    test("y siguen pasando AA en tema oscuro", async ({ page }) => {
      await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

      for (const role of ROLES) {
        const ratio = await elementContrast(page, `#avatar-${role}`, DARK.base100);
        expect(ratio).toBeGreaterThanOrEqual(AA_THRESHOLD);
      }
    });
  });

  test("al cambiar de tema el relleno repinta sin recompilar", async ({ page }) => {
    const avatar = page.locator("#avatar-primary");

    const light = await avatar.evaluate((el) => getComputedStyle(el).backgroundColor);

    await page.evaluate(() => document.documentElement.setAttribute("data-theme", "dark"));

    const dark = await avatar.evaluate((el) => getComputedStyle(el).backgroundColor);

    expect(dark).not.toBe(light);
  });
});
