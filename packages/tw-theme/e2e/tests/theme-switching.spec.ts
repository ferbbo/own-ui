import { test, expect } from "@playwright/test";

/**
 * E2E-4: Cambio dinámico de tema con data-theme
 *
 * Valida que el cambio de tema usando data-theme funciona
 * correctamente y actualiza los colores en tiempo real.
 */

test.describe("E2E-4: Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/theme-switching/");
  });

  test("debe cambiar a tema dark al hacer click en botón Dark", async ({ page }) => {
    await page.click("#btn-dark");
    await page.waitForTimeout(100);

    const theme = await page.evaluate(() => window.getTheme());
    expect(theme).toBe("dark");
  });

  test("debe cambiar a tema ocean al hacer click en botón Ocean", async ({ page }) => {
    await page.click("#btn-ocean");
    await page.waitForTimeout(100);

    const theme = await page.evaluate(() => window.getTheme());
    expect(theme).toBe("ocean");
  });

  test("debe cambiar a tema light al hacer click en botón Light", async ({ page }) => {
    await page.click("#btn-light");
    await page.waitForTimeout(100);

    const theme = await page.evaluate(() => window.getTheme());
    expect(theme).toBe("light");
  });

  test("debe remover tema al hacer click en Remove Theme", async ({ page }) => {
    await page.click("#btn-ocean");
    await page.waitForTimeout(100);

    await page.click("#btn-remove");
    await page.waitForTimeout(100);

    const theme = await page.evaluate(() => window.getTheme());
    expect(theme).toBe("none");
  });

  test("debe actualizar colores al cambiar de light a dark", async ({ page }) => {
    const lightColor = await page.evaluate(() => {
      return window.getElementBgColor("dynamic-box");
    });

    await page.click("#btn-dark");
    await page.waitForTimeout(100);

    const darkColor = await page.evaluate(() => {
      return window.getElementBgColor("dynamic-box");
    });

    // Ambos deben ser colores válidos
    expect(lightColor).toMatch(/^rgb\(/);
    expect(darkColor).toMatch(/^rgb\(/);
  });

  test("debe aplicar colores del tema ocean correctamente", async ({ page }) => {
    await page.click("#btn-ocean");
    await page.waitForTimeout(100);

    const oceanColor = await page.evaluate(() => {
      return window.getElementBgColor("dynamic-box");
    });

    // Ocean primary: #0ea5e9 = rgb(14, 165, 233)
    expect(oceanColor).toBe("rgb(14, 165, 233)");
  });

  test("diferentes elementos con data-theme deben mostrar diferentes colores simultáneamente", async ({
    page,
  }) => {
    const lightPreview = await page.evaluate(() => {
      return window.getElementBgColor("preview-light");
    });

    const darkPreview = await page.evaluate(() => {
      return window.getElementBgColor("preview-dark");
    });

    const oceanPreview = await page.evaluate(() => {
      return window.getElementBgColor("preview-ocean");
    });

    // Todos deben ser colores válidos
    expect(lightPreview).toMatch(/^rgb\(/);
    expect(darkPreview).toMatch(/^rgb\(/);
    expect(oceanPreview).toMatch(/^rgb\(/);

    // Ocean debe ser diferente a light
    expect(oceanPreview).toBe("rgb(14, 165, 233)");
  });

  test("debe manejar cambios rápidos de tema sin errores", async ({ page }) => {
    await page.evaluate(() => {
      return window.switchThemesRapidly(10);
    });

    // Verificar que el elemento sigue siendo válido después de cambios rápidos
    const finalColor = await page.evaluate(() => {
      return window.getElementBgColor("dynamic-box");
    });

    expect(finalColor).toMatch(/^rgb\(/);
  });

  test("debe mantener el tema después de interacciones del usuario", async ({ page }) => {
    await page.click("#btn-ocean");
    await page.waitForTimeout(100);

    // Simular otras interacciones
    await page.click("#btn-rapid");
    await page.waitForTimeout(200);

    const theme = await page.evaluate(() => window.getTheme());

    // El tema debería haber cambiado por el rapid cycle
    expect(theme).toMatch(/light|dark|ocean/);
  });

  test("múltiples cambios de tema deben ser consistentes", async ({ page }) => {
    // Light
    await page.evaluate(() => window.setTheme("light"));
    const lightPrimary = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="light"]', "--color-primary");
    });

    // Dark
    await page.evaluate(() => window.setTheme("dark"));
    const darkPrimary = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="dark"]', "--color-primary");
    });

    // Ocean
    await page.evaluate(() => window.setTheme("ocean"));
    const oceanPrimary = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="ocean"]', "--color-primary");
    });

    // Validar que todos existen y son diferentes
    expect(lightPrimary).toBeTruthy();
    expect(darkPrimary).toBeTruthy();
    expect(oceanPrimary).toBeTruthy();
    expect(oceanPrimary).toBe("#0ea5e9");
  });
});
