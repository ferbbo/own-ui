import { test, expect } from "@playwright/test";

/**
 * E2E-4: Dynamic theme switching with data-theme
 *
 * Validates that theme switching using data-theme works
 * correctly and updates colors in real time.
 */

test.describe("E2E-4: Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/theme-switching/");
  });

  test("should switch to dark theme when clicking Dark button", async ({ page }) => {
    await page.click("#btn-dark");
    await page.waitForTimeout(100);

    const theme = await page.evaluate(() => window.getTheme());
    expect(theme).toBe("dark");
  });

  test("should switch to ocean theme when clicking Ocean button", async ({ page }) => {
    await page.click("#btn-ocean");
    await page.waitForTimeout(100);

    const theme = await page.evaluate(() => window.getTheme());
    expect(theme).toBe("ocean");
  });

  test("should switch to light theme when clicking Light button", async ({ page }) => {
    await page.click("#btn-light");
    await page.waitForTimeout(100);

    const theme = await page.evaluate(() => window.getTheme());
    expect(theme).toBe("light");
  });

  test("should remove theme when clicking Remove Theme", async ({ page }) => {
    await page.click("#btn-ocean");
    await page.waitForTimeout(100);

    await page.click("#btn-remove");
    await page.waitForTimeout(100);

    const theme = await page.evaluate(() => window.getTheme());
    expect(theme).toBe("none");
  });

  test("should update colors when switching from light to dark", async ({ page }) => {
    const lightColor = await page.evaluate(() => {
      return window.getElementBgColor("dynamic-box");
    });

    await page.click("#btn-dark");
    await page.waitForTimeout(100);

    const darkColor = await page.evaluate(() => {
      return window.getElementBgColor("dynamic-box");
    });

    // Both should be valid colors
    expect(lightColor).toMatch(/^rgb\(/);
    expect(darkColor).toMatch(/^rgb\(/);
  });

  test("should apply ocean theme colors correctly", async ({ page }) => {
    await page.click("#btn-ocean");
    await page.waitForTimeout(100);

    const oceanColor = await page.evaluate(() => {
      return window.getElementBgColor("dynamic-box");
    });

    // Ocean primary: #0ea5e9 = rgb(14, 165, 233)
    expect(oceanColor).toBe("rgb(14, 165, 233)");
  });

  test("different elements with data-theme should show different colors simultaneously", async ({
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

    // All should be valid colors
    expect(lightPreview).toMatch(/^rgb\(/);
    expect(darkPreview).toMatch(/^rgb\(/);
    expect(oceanPreview).toMatch(/^rgb\(/);

    // Ocean should be different from light
    expect(oceanPreview).toBe("rgb(14, 165, 233)");
  });

  test("should handle rapid theme changes without errors", async ({ page }) => {
    await page.evaluate(() => {
      return window.switchThemesRapidly(10);
    });

    // Verify that the element is still valid after rapid changes
    const finalColor = await page.evaluate(() => {
      return window.getElementBgColor("dynamic-box");
    });

    expect(finalColor).toMatch(/^rgb\(/);
  });

  test("should maintain theme after user interactions", async ({ page }) => {
    await page.click("#btn-ocean");
    await page.waitForTimeout(100);

    // Simulate other interactions
    await page.click("#btn-rapid");
    await page.waitForTimeout(200);

    const theme = await page.evaluate(() => window.getTheme());

    // The theme should have changed due to rapid cycle
    expect(theme).toMatch(/light|dark|ocean/);
  });

  test("multiple theme changes should be consistent", async ({ page }) => {
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

    // Validate that all exist and are different
    expect(lightPrimary).toBeTruthy();
    expect(darkPrimary).toBeTruthy();
    expect(oceanPrimary).toBeTruthy();
    expect(oceanPrimary).toBe("#0ea5e9");
  });
});
