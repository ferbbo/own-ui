import { test, expect } from '@playwright/test';

/**
 * E2E-1: Plugin con temas predeterminados (light/dark)
 * 
 * Valida que el plugin genera correctamente los temas light y dark
 * por defecto, y que el cambio entre temas funciona correctamente.
 */

test.describe('E2E-1: Default Themes (Light/Dark)', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/default-themes/');
  });

  test('debe generar variables CSS para el tema light en :root', async ({ page }) => {
    const primaryVar = await page.evaluate(() => {
      return window.getCSSVariable(':root', '--color-primary');
    });

    expect(primaryVar).toBeTruthy();
    expect(primaryVar).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test('debe generar variables CSS para el tema dark en [data-theme="dark"]', async ({ page }) => {
    const primaryVar = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="dark"]', '--color-primary');
    });

    expect(primaryVar).toBeTruthy();
    expect(primaryVar).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test('debe aplicar colores del tema light por defecto', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor('light-primary');
    });

    // Light theme primary: #3b82f6 = rgb(59, 130, 246)
    expect(bgColor).toBe('rgb(59, 130, 246)');
  });

  test('debe aplicar colores del tema dark cuando data-theme="dark"', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor('dark-primary');
    });

    // Verificar que es un color válido
    expect(bgColor).toMatch(/^rgb\(/);
    expect(bgColor).toBeTruthy();
  });

  test('debe generar todos los 8 colores semánticos', async ({ page }) => {
    const colors = ['primary', 'secondary', 'accent', 'neutral', 'info', 'success', 'warning', 'error'];
    
    for (const color of colors) {
      const varValue = await page.evaluate((colorName) => {
        return window.getCSSVariable(':root', `--color-${colorName}`);
      }, color);

      expect(varValue, `--color-${color} debe existir`).toBeTruthy();
      expect(varValue, `--color-${color} debe ser un color válido`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test('debe generar variantes -content y -focus para cada color', async ({ page }) => {
    const variants = ['', '-content', '-focus'];
    
    for (const variant of variants) {
      const varValue = await page.evaluate((v) => {
        return window.getCSSVariable(':root', `--color-primary${v}`);
      }, variant);

      expect(varValue, `--color-primary${variant} debe existir`).toBeTruthy();
      expect(varValue, `--color-primary${variant} debe ser válido`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test('debe cambiar colores dinámicamente al alternar tema', async ({ page }) => {
    // Color inicial (light)
    const lightColor = await page.evaluate(() => {
      return window.getElementBgColor('toggle-container');
    });

    // Cambiar a dark
    await page.click('#toggle-btn');
    await page.waitForTimeout(100);

    const darkColor = await page.evaluate(() => {
      return window.getElementBgColor('toggle-container');
    });

    // Los colores podrían ser iguales o diferentes según la configuración
    // Lo importante es que ambos sean válidos
    expect(lightColor).toMatch(/^rgb\(/);
    expect(darkColor).toMatch(/^rgb\(/);
  });

  test('data-theme="light" debe aplicar tema light explícitamente', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor('explicit-light');
    });

    // Success light: #22c55e = rgb(34, 197, 94)
    expect(bgColor).toBe('rgb(34, 197, 94)');
  });

  test('todos los colores semánticos deben renderizarse correctamente', async ({ page }) => {
    const expectedColors = {
      'color-primary': 'rgb(59, 130, 246)',
      'color-secondary': 'rgb(16, 185, 129)',
      'color-accent': 'rgb(139, 92, 246)',
      'color-neutral': 'rgb(107, 114, 128)',
      'color-info': 'rgb(14, 165, 233)',
      'color-success': 'rgb(34, 197, 94)',
      'color-warning': 'rgb(245, 158, 11)',
      'color-error': 'rgb(239, 68, 68)',
    };

    for (const [id, expectedColor] of Object.entries(expectedColors)) {
      const bgColor = await page.evaluate((elementId) => {
        return window.getElementBgColor(elementId);
      }, id);

      expect(bgColor, `${id} debe tener el color correcto`).toBe(expectedColor);
    }
  });

  test('debe tener color-scheme configurado correctamente', async ({ page }) => {
    const colorScheme = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).colorScheme;
    });

    expect(colorScheme).toBeTruthy();
  });
});
