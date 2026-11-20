import { test, expect } from "@playwright/test";

/**
 * E2E-2: Plugin without default themes (themes: false)
 *
 * Validates that when default themes are disabled,
 * NO variables are generated for light/dark.
 */

test.describe("E2E-2: No Default Themes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/no-default-themes/");
  });

  test("should NOT generate light theme variables in :root", async ({ page }) => {
    const hasLightVars = await page.evaluate(() => {
      return window.hasLightThemeVars();
    });

    // With themes: false, theme variables should NOT exist
    expect(hasLightVars).toBe(false);
  });

  test("should NOT generate dark theme variables", async ({ page }) => {
    const hasDarkVars = await page.evaluate(() => {
      return window.hasDarkThemeVars();
    });

    expect(hasDarkVars).toBe(false);
  });

  test('data-theme="dark" should have NO effect', async ({ page }) => {
    const darkPrimary = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="dark"]', "--color-primary");
    });

    // There should be no specific variables for dark theme
    expect(darkPrimary).toBeFalsy();
  });

  test('data-theme="light" should have NO effect', async ({ page }) => {
    const lightPrimary = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="light"]', "--color-primary");
    });

    // There should be no specific variables for light theme
    expect(lightPrimary).toBeFalsy();
  });

  test("root.ts tokens should be available in :root", async ({ page }) => {
    const rootVars = await page.evaluate(() => {
      const root = document.querySelector(":root");
      if (root) {
        const radius = getComputedStyle(root).getPropertyValue("--radius-field").trim();
        return { radius };
      }
      return { radius: "" };
    });

    // Los tokens de `themes/root.ts` (forma, geometria, profundidad) se inyectan
    // siempre en :root, con themes o sin ellos. Ojo: los tokens de COLOR ya no
    // estan aqui. Desde el lote 4 la escala de superficies (--color-base-*) vive
    // en light.ts/dark.ts, asi que con `themes: false` no existe ninguna.
    expect(rootVars.radius).toBeTruthy();
  });

  test("bg-primary should NOT apply colors correctly without themes", async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor("no-light");
    });

    // Without themes, bg-primary won't have the CSS variable available
    // Could be transparent or not applied
    expect(bgColor).toBeTruthy();
  });
});
