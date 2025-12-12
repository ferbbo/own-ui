import { test, expect } from '@playwright/test';

/**
 * E2E Tests: React Components con tw-theme Plugin
 * 
 * Valida que el plugin @ownui/tw-theme funciona correctamente
 * con componentes React reales (@ownui/button)
 */

test.describe('React Components - Button con tw-theme', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/react-components/');
    // Wait for React to mount
    await page.waitForSelector('#btn-primary');
  });

  test('debe aplicar tema light por defecto al Button', async ({ page }) => {
    // Click en tema light
    await page.click('#theme-light');
    await page.waitForTimeout(100);

    // Verificar que el botón primary tiene el color correcto del tema light
    const bgColor = await page.evaluate(() => {
      const btn = document.getElementById('btn-primary');
      return btn ? getComputedStyle(btn).backgroundColor : null;
    });

    expect(bgColor).toBeTruthy();
    expect(bgColor).toMatch(/^rgb\(/);
    // Light theme primary: #3b82f6 = rgb(59, 130, 246)
    expect(bgColor).toBe('rgb(59, 130, 246)');
  });

  test('debe cambiar colores al aplicar tema dark', async ({ page }) => {
    // Click en tema dark
    await page.click('#theme-dark');
    await page.waitForTimeout(100);

    // Verificar que el botón primary tiene el color del tema dark
    const bgColor = await page.evaluate(() => {
      const btn = document.getElementById('btn-primary');
      return btn ? getComputedStyle(btn).backgroundColor : null;
    });

    expect(bgColor).toBeTruthy();
    expect(bgColor).toMatch(/^rgb\(/);
    // Dark theme primary: #60a5fa = rgb(96, 165, 250)
    expect(bgColor).toBe('rgb(96, 165, 250)');
  });

  test('debe aplicar tema custom "brand" correctamente', async ({ page }) => {
    // Click en tema brand
    await page.click('#theme-brand');
    await page.waitForTimeout(100);

    // Verificar que el botón primary tiene el color del tema brand
    const bgColor = await page.evaluate(() => {
      const btn = document.getElementById('btn-primary');
      return btn ? getComputedStyle(btn).backgroundColor : null;
    });

    expect(bgColor).toBeTruthy();
    expect(bgColor).toMatch(/^rgb\(/);
    // Brand theme primary: #7c3aed = rgb(124, 58, 237)
    expect(bgColor).toBe('rgb(124, 58, 237)');
  });

  test('debe aplicar colores semánticos correctamente (success, info)', async ({ page }) => {
    // Verificar botón success
    const successColor = await page.evaluate(() => {
      const btn = document.getElementById('btn-success');
      return btn ? getComputedStyle(btn).backgroundColor : null;
    });

    expect(successColor).toBeTruthy();
    // Success color: #22c55e = rgb(34, 197, 94)
    expect(successColor).toBe('rgb(34, 197, 94)');

    // Verificar botón info
    const infoColor = await page.evaluate(() => {
      const btn = document.getElementById('btn-info');
      return btn ? getComputedStyle(btn).backgroundColor : null;
    });

    expect(infoColor).toBeTruthy();
    // Info color: #0ea5e9 = rgb(14, 165, 233)
    expect(infoColor).toBe('rgb(14, 165, 233)');
  });

  test('debe aplicar variantes -content correctamente', async ({ page }) => {
    // Verificar que text-primary-content se aplica
    const textColor = await page.evaluate(() => {
      const btn = document.getElementById('btn-primary');
      return btn ? getComputedStyle(btn).color : null;
    });

    expect(textColor).toBeTruthy();
    expect(textColor).toMatch(/^rgb\(/);
    // Primary content (white): rgb(255, 255, 255)
    expect(textColor).toBe('rgb(255, 255, 255)');
  });
});
