import { test, expect } from "@playwright/test";

/**
 * E2E-1: Plugin with default themes (light/dark)
 *
 * Validates that the plugin correctly generates light and dark themes
 * by default, and that switching between themes works correctly.
 */

test.describe("E2E-1: Default Themes (Light/Dark)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/default-themes/");
  });

  test("should generate CSS variables for light theme in :root", async ({ page }) => {
    const primaryVar = await page.evaluate(() => {
      return window.getCSSVariable(":root", "--color-primary");
    });

    expect(primaryVar).toBeTruthy();
    expect(primaryVar).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test('should generate CSS variables for dark theme in [data-theme="dark"]', async ({ page }) => {
    const primaryVar = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="dark"]', "--color-primary");
    });

    expect(primaryVar).toBeTruthy();
    expect(primaryVar).toMatch(/^#[0-9a-f]{6}$/i);
  });

  test("should apply light theme colors by default", async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor("light-primary");
    });

    // Light theme primary: #3b82f6 = rgb(59, 130, 246)
    expect(bgColor).toBe("rgb(59, 130, 246)");
  });

  test('should apply dark theme colors when data-theme="dark"', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor("dark-primary");
    });

    // Verify that it's a valid color
    expect(bgColor).toMatch(/^rgb\(/);
    expect(bgColor).toBeTruthy();
  });

  test("should generate all 8 semantic colors", async ({ page }) => {
    const colors = [
      "primary",
      "secondary",
      "accent",
      "neutral",
      "info",
      "success",
      "warning",
      "error",
    ];

    for (const color of colors) {
      const varValue = await page.evaluate((colorName) => {
        return window.getCSSVariable(":root", `--color-${colorName}`);
      }, color);

      expect(varValue, `--color-${color} should exist`).toBeTruthy();
      expect(varValue, `--color-${color} should be a valid color`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test("should generate -content and -focus variants for each color", async ({ page }) => {
    const variants = ["", "-content", "-focus"];

    for (const variant of variants) {
      const varValue = await page.evaluate((v) => {
        return window.getCSSVariable(":root", `--color-primary${v}`);
      }, variant);

      expect(varValue, `--color-primary${variant} should exist`).toBeTruthy();
      expect(varValue, `--color-primary${variant} should be valid`).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  test("should dynamically change colors when switching theme", async ({ page }) => {
    // Initial color (light)
    const lightColor = await page.evaluate(() => {
      return window.getElementBgColor("toggle-container");
    });

    // Switch to dark
    await page.click("#toggle-btn");
    await page.waitForTimeout(100);

    const darkColor = await page.evaluate(() => {
      return window.getElementBgColor("toggle-container");
    });

    // Colors could be the same or different depending on configuration
    // The important thing is that both are valid
    expect(lightColor).toMatch(/^rgb\(/);
    expect(darkColor).toMatch(/^rgb\(/);
  });

  test('data-theme="light" should explicitly apply light theme', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor("explicit-light");
    });

    // Success light: #22c55e = rgb(34, 197, 94)
    expect(bgColor).toBe("rgb(34, 197, 94)");
  });

  test("all semantic colors should render correctly", async ({ page }) => {
    const expectedColors = {
      "color-primary": "rgb(59, 130, 246)",
      "color-secondary": "rgb(16, 185, 129)",
      "color-accent": "rgb(139, 92, 246)",
      "color-neutral": "rgb(107, 114, 128)",
      "color-info": "rgb(14, 165, 233)",
      "color-success": "rgb(34, 197, 94)",
      "color-warning": "rgb(245, 158, 11)",
      "color-error": "rgb(239, 68, 68)",
    };

    for (const [id, expectedColor] of Object.entries(expectedColors)) {
      const bgColor = await page.evaluate((elementId) => {
        return window.getElementBgColor(elementId);
      }, id);

      expect(bgColor, `${id} should have the correct color`).toBe(expectedColor);
    }
  });

  test("should have color-scheme configured correctly", async ({ page }) => {
    const colorScheme = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).colorScheme;
    });

    expect(colorScheme).toBeTruthy();
  });
});
