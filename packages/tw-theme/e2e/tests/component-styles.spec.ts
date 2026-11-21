import { test, expect } from "@playwright/test";

/**
 * E2E-7: CSS de componentes publicado (`@ownui/tw-theme/css`)
 *
 * Es el test del bug raiz del repo (`AGENTS.md` §9.1): hasta el lote 1,
 * `src/css/*.css` no se importaba ni se empaquetaba, asi que los componentes
 * React emitian `class="btn btn-primary btn-md"` sin ninguna regla detras.
 *
 * El fixture consume **el export publico** (`@import "@ownui/tw-theme/css"`),
 * no una ruta relativa a `src/`: si el subpath export o la copia a `dist/css`
 * se rompen, la compilacion del fixture falla y este spec no llega a correr.
 * Lo que se mide aqui son estilos **computados en Chromium** sobre el CSS
 * realmente compilado, no la presencia de texto en un archivo.
 */

/** Tokens de `src/themes/light.ts` y `dark.ts`, en el formato que devuelve Chromium. */
const LIGHT_PRIMARY = "rgb(59, 130, 246)"; // #3b82f6
const DARK_PRIMARY = "rgb(96, 165, 250)"; // #60a5fa
const LIGHT_SUCCESS = "rgb(34, 197, 94)"; // #22c55e
const PRIMARY_CONTENT = "rgb(255, 255, 255)"; // #ffffff
const TRANSPARENT = ["rgba(0, 0, 0, 0)", "transparent"];

test.describe("E2E-7: Component styles from the published CSS", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/component-styles/");
  });

  test.describe("AC-2: .btn .btn-primary .btn-md resuelve en tema claro", () => {
    test("el background-color es el valor de --color-primary, no transparent", async ({ page }) => {
      const bgColor = await page.evaluate(() => window.getElementBgColor("btn-primary"));

      expect(TRANSPARENT).not.toContain(bgColor);
      expect(bgColor).toBe(LIGHT_PRIMARY);
    });

    test("el background-color coincide con el token --color-primary del tema", async ({ page }) => {
      // Cruza el estilo computado contra el token inyectado por el plugin:
      // asi el test sigue siendo valido si la paleta cambia (lote 0, P-02).
      const token = await page.evaluate(() => window.getCSSVariable(":root", "--color-primary"));
      const bgColor = await page.evaluate(() => window.getElementBgColor("btn-primary"));

      expect(token).toBe("#3b82f6");
      expect(bgColor).toBe(LIGHT_PRIMARY);
    });

    test("el color de texto es --color-primary-content", async ({ page }) => {
      const color = await page.evaluate(() => window.getElementTextColor("btn-primary"));

      expect(color).toBe(PRIMARY_CONTENT);
    });

    test("la altura es 2.5rem (40px) via --size = --size-field * 10", async ({ page }) => {
      const height = await page.evaluate(() => window.getComputedProp("btn-primary", "height"));

      expect(height).toBe("40px");
    });

    test("el border-radius no es 0px", async ({ page }) => {
      const radius = await page.evaluate(() =>
        window.getComputedProp("btn-primary", "border-radius")
      );

      expect(radius).not.toBe("0px");
      expect(radius).toBe("6px"); // --radius-field: 0.375rem
    });

    test("la estructura del blueprint .btn llega al elemento", async ({ page }) => {
      const display = await page.evaluate(() => window.getComputedProp("btn-primary", "display"));
      const cursor = await page.evaluate(() => window.getComputedProp("btn-primary", "cursor"));
      const paddingInline = await page.evaluate(() =>
        window.getComputedProp("btn-primary", "padding-left")
      );

      expect(display).toBe("inline-flex");
      expect(cursor).toBe("pointer");
      expect(paddingInline).toBe("16px"); // --btn-p: 1rem en btn-md
    });
  });

  test.describe('AC-3: data-theme="dark" cambia el color computado', () => {
    test("el mismo .btn-primary pinta distinto dentro de un ambito dark", async ({ page }) => {
      const light = await page.evaluate(() => window.getElementBgColor("btn-primary"));
      const dark = await page.evaluate(() => window.getElementBgColor("btn-primary-dark"));

      expect(dark).not.toBe(light);
      expect(dark).toBe(DARK_PRIMARY);
    });

    test("el cambio sobrevive a mover data-theme a la raiz en runtime", async ({ page }) => {
      const before = await page.evaluate(() => window.getElementBgColor("btn-primary"));
      expect(before).toBe(LIGHT_PRIMARY);

      // El token cambia de forma sincrona...
      const token = await page.evaluate(() => {
        window.setTheme("dark");
        return window.getCSSVariable("#btn-primary", "--btn-color");
      });
      expect(token).toBe("#60a5fa");

      // ...pero `.btn` declara `transition-property: background-color` con
      // `--btn-transition-duration: 0.2s`, asi que el valor computado en t=0
      // sigue siendo el viejo. Se espera a que la transicion termine en vez de
      // dormir un tiempo fijo.
      await expect
        .poll(() => page.evaluate(() => window.getElementBgColor("btn-primary")), {
          timeout: 2000,
        })
        .toBe(DARK_PRIMARY);
    });
  });

  test.describe("La escala de tamanos recalcula --size", () => {
    const sizes: Array<[string, string]> = [
      ["btn-xs", "24px"], // --size-field * 6
      ["btn-sm", "32px"], // * 8
      ["btn-primary", "40px"], // * 10 (btn-md)
      ["btn-lg", "48px"], // * 12
      ["btn-xl", "56px"], // * 14
    ];

    for (const [id, expected] of sizes) {
      test(`${id} mide ${expected} de alto`, async ({ page }) => {
        const height = await page.evaluate((elId) => window.getComputedProp(elId, "height"), id);

        expect(height).toBe(expected);
      });
    }
  });

  test.describe("Los roles semanticos usan su propio token", () => {
    test(".btn-success pinta con --color-success, no con primary", async ({ page }) => {
      const bgColor = await page.evaluate(() => window.getElementBgColor("btn-success"));

      expect(bgColor).toBe(LIGHT_SUCCESS);
      expect(bgColor).not.toBe(LIGHT_PRIMARY);
    });
  });

  test.describe("Control negativo", () => {
    test("una clase inexistente no recibe estilos (el test puede fallar)", async ({ page }) => {
      // Sin este caso, los asserts de arriba no distinguirian "el CSS llego"
      // de "el navegador pinta botones asi por defecto".
      const bgColor = await page.evaluate(() => window.getElementBgColor("btn-unstyled"));
      const height = await page.evaluate(() => window.getComputedProp("btn-unstyled", "height"));

      expect(bgColor).not.toBe(LIGHT_PRIMARY);
      expect(height).not.toBe("40px");
    });
  });

  test.describe("S-09: el pipeline de @apply funciona sobre el CSS publicado", () => {
    test(".loader aplica las utilidades de su @apply", async ({ page }) => {
      // loader.css hace `@apply inline-flex items-center justify-center relative`.
      // Que esto resuelva prueba que el archivo publicado pasa por el build de
      // Tailwind del consumidor, no solo que se copio al paquete.
      const display = await page.evaluate(() => window.getComputedProp("loader", "display"));
      const alignItems = await page.evaluate(() => window.getComputedProp("loader", "align-items"));
      const position = await page.evaluate(() => window.getComputedProp("loader", "position"));

      expect(display).toBe("inline-flex");
      expect(alignItems).toBe("center");
      expect(position).toBe("relative");
    });

    test(".loader-primary y .loader-md resuelven sus custom properties", async ({ page }) => {
      const color = await page.evaluate(() => window.getCSSVariable("#loader", "--loader-color"));
      const size = await page.evaluate(() => window.getCSSVariable("#loader", "--loader-size"));
      const spinnerWidth = await page.evaluate(() =>
        window.getComputedProp("loader-spinner", "width")
      );

      expect(color).toBe("#3b82f6");
      expect(size).toBe("1.5rem");
      expect(spinnerWidth).toBe("24px");
    });
  });

  test.describe("S-09b: .loader-current hereda el color del contexto (lote 5)", () => {
    const INHERITED = "rgb(12, 34, 56)";
    const LIGHT_ERROR = "rgb(239, 68, 68)"; // #ef4444

    test("el spinner toma el color del contenedor, no un token semantico", async ({ page }) => {
      const borderTop = await page.evaluate(() =>
        window.getComputedProp("loader-current-spinner", "border-top-color")
      );

      expect(borderTop).toBe(INHERITED);
    });

    test("dentro de un .btn-primary el spinner pinta con --btn-fg", async ({ page }) => {
      // Es el caso que motiva la clase: antes el spinner del Button era
      // siempre `loader-primary`, o sea azul sobre azul en un btn-primary.
      const spinner = await page.evaluate(() =>
        window.getComputedProp("btn-loader-spinner", "border-top-color")
      );
      const buttonFg = await page.evaluate(() => window.getElementTextColor("btn-with-loader"));

      expect(spinner).toBe(buttonFg);
      expect(spinner).toBe(PRIMARY_CONTENT);
      expect(spinner).not.toBe(LIGHT_PRIMARY);
    });

    test("control: un rol semantico ignora el color heredado", async ({ page }) => {
      // Sin este caso el test anterior no distinguiria "hereda" de
      // "el navegador pinta asi los bordes por defecto".
      const borderTop = await page.evaluate(() =>
        window.getComputedProp("loader-semantic-spinner", "border-top-color")
      );

      expect(borderTop).toBe(LIGHT_ERROR);
      expect(borderTop).not.toBe(INHERITED);
    });
  });

  test.describe("El agregador publica los tres componentes", () => {
    test(".dropdown recibe las reglas de dropdown.css", async ({ page }) => {
      const position = await page.evaluate(() => window.getComputedProp("dropdown", "position"));
      const itemCursor = await page.evaluate(() =>
        window.getComputedProp("dropdown-item", "cursor")
      );

      expect(position).toBe("relative");
      expect(itemCursor).toBe("pointer");
    });
  });
});
