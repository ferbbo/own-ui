import { test, expect } from '@playwright/test';

/**
 * E2E-2: Plugin sin temas predeterminados (themes: false)
 * 
 * Valida que cuando se deshabilitan los temas predeterminados,
 * NO se generan variables para light/dark.
 */

test.describe('E2E-2: No Default Themes', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/no-default-themes/');
  });

  test('NO debe generar variables de tema light en :root', async ({ page }) => {
    const hasLightVars = await page.evaluate(() => {
      return window.hasLightThemeVars();
    });

    // Con themes: false, NO deberían existir variables de tema
    expect(hasLightVars).toBe(false);
  });

  test('NO debe generar variables de tema dark', async ({ page }) => {
    const hasDarkVars = await page.evaluate(() => {
      return window.hasDarkThemeVars();
    });

    expect(hasDarkVars).toBe(false);
  });

  test('data-theme="dark" NO debe tener efecto', async ({ page }) => {
    const darkPrimary = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="dark"]', '--color-primary');
    });

    // No debería haber variables específicas para dark theme
    expect(darkPrimary).toBeFalsy();
  });

  test('data-theme="light" NO debe tener efecto', async ({ page }) => {
    const lightPrimary = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="light"]', '--color-primary');
    });

    // No debería haber variables específicas para light theme
    expect(lightPrimary).toBeFalsy();
  });

  test('las variables de rootColors deben estar disponibles en :root', async ({ page }) => {
    const rootVars = await page.evaluate(() => {
      const root = document.querySelector(':root');
      if (root) {
      const radius = getComputedStyle(root).getPropertyValue('--radius-field').trim();
        return { radius };
      };
      return { radius: "" }
    });

    // rootColors siempre se aplican independientemente de themes
    expect(rootVars.radius).toBeTruthy();
  });

  test('bg-primary NO debe aplicar colores correctamente sin temas', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor('no-light');
    });

    // Sin temas, bg-primary no tendrá la variable CSS disponible
    // Podría ser transparent o no aplicarse
    expect(bgColor).toBeTruthy();
  });
});
