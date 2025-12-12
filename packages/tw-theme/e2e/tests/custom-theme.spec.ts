import { test, expect } from '@playwright/test';

/**
 * E2E-3: Plugin con tema custom usando @plugin theme
 * 
 * Valida que se puede crear un tema completamente custom
 * usando el plugin individual @ownui/tw-theme/theme.
 */

test.describe('E2E-3: Custom Theme Plugin', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/custom-theme/');
  });

  test('debe aplicar el tema custom en :root con flag --default', async ({ page }) => {
    const primaryVar = await page.evaluate(() => {
      return window.getCSSVariable(':root', '--color-primary');
    });

    // El color custom definido: #ff6b00
    expect(primaryVar).toBe('#ff6b00');
  });

    test('debe aplicar todos los colores custom correctamente', async ({ page }) => {
    const customColors = await page.evaluate(() => {
      return window.getAllThemeVars(':root');
    });

    expect(customColors).toEqual({
      primary: '#ff6b00',
      secondary: '#00d4ff',
      accent: '#ffed00',
      neutral: '#4a5568',
      info: '#0ea5e9',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    });
  });

  test('debe renderizar el color primary custom', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor('brand-primary');
    });

    // #ff6b00 = rgb(255, 107, 0)
    expect(bgColor).toBe('rgb(255, 107, 0)');
  });

  test('debe renderizar el color secondary custom', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor('brand-secondary');
    });

    // #00d4ff = rgb(0, 212, 255)
    expect(bgColor).toBe('rgb(0, 212, 255)');
  });

  test('debe renderizar el color accent custom', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor('brand-accent');
    });

    // #ffed00 = rgb(255, 237, 0)
    expect(bgColor).toBe('rgb(255, 237, 0)');
  });

  test('debe estar disponible con data-theme="brand"', async ({ page }) => {
    const primaryVar = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="brand"]', '--color-primary');
    });

    expect(primaryVar).toBe('#ff6b00');
  });

  test('debe renderizar correctamente con data-theme="brand"', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor('data-theme-brand');
    });

    expect(bgColor).toBe('rgb(255, 107, 0)');
  });

  test('debe generar variantes -content para cada color', async ({ page }) => {
    const contentVars = await page.evaluate(() => {
      const root = document.querySelector(':root');
      if (!root) return null;
      
      const style = getComputedStyle(root);
      return {
        primaryContent: style.getPropertyValue('--color-primary-content').trim(),
        secondaryContent: style.getPropertyValue('--color-secondary-content').trim(),
        accentContent: style.getPropertyValue('--color-accent-content').trim(),
      };
    });

    expect(contentVars?.primaryContent).toBeTruthy();
    expect(contentVars?.secondaryContent).toBeTruthy();
    expect(contentVars?.accentContent).toBeTruthy();
  });

  test('debe generar variantes -focus para cada color', async ({ page }) => {
    const focusVars = await page.evaluate(() => {
      const root = document.querySelector(':root');
      if (!root) return null;
      
      const style = getComputedStyle(root);
      return {
        primaryFocus: style.getPropertyValue('--color-primary-focus').trim(),
        secondaryFocus: style.getPropertyValue('--color-secondary-focus').trim(),
        accentFocus: style.getPropertyValue('--color-accent-focus').trim(),
      };
    });

    expect(focusVars?.primaryFocus).toBeTruthy();
    expect(focusVars?.secondaryFocus).toBeTruthy();
    expect(focusVars?.accentFocus).toBeTruthy();
  });

  test('todos los colores custom deben renderizarse en la UI', async ({ page }) => {
    const expectedColors = {
      'custom-primary': 'rgb(255, 107, 0)',
      'custom-secondary': 'rgb(0, 212, 255)',
      'custom-accent': 'rgb(255, 237, 0)',
      'custom-neutral': 'rgb(74, 85, 104)',
      'custom-info': 'rgb(14, 165, 233)',
      'custom-success': 'rgb(16, 185, 129)',
      'custom-warning': 'rgb(245, 158, 11)',
      'custom-error': 'rgb(239, 68, 68)',
    };

    for (const [id, expectedColor] of Object.entries(expectedColors)) {
      const bgColor = await page.evaluate((elementId) => {
        return window.getElementBgColor(elementId);
      }, id);
      expect(bgColor, `${id} debe tener el color correcto`).toBe(expectedColor);
    }
  });
});
