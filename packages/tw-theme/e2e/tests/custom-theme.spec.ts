import { test, expect } from "@playwright/test";

/**
 * E2E-3: Plugin with custom theme using @plugin theme
 *
 * Validates that a completely custom theme can be created
 * using the individual @ownui/tw-theme/theme plugin.
 */

test.describe("E2E-3: Custom Theme Plugin", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/custom-theme/");
  });

  test("should apply custom theme to :root with --default flag", async ({ page }) => {
    const primaryVar = await page.evaluate(() => {
      return window.getCSSVariable(":root", "--color-primary");
    });

    // The defined custom color: #ff6b00
    expect(primaryVar).toBe("#ff6b00");
  });

  test("should apply all custom colors correctly", async ({ page }) => {
    const customColors = await page.evaluate(() => {
      return window.getAllThemeVars(":root");
    });

    expect(customColors).toEqual({
      primary: "#ff6b00",
      secondary: "#00d4ff",
      accent: "#ffed00",
      neutral: "#4a5568",
      info: "#0ea5e9",
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
    });
  });

  test("should render custom primary color", async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor("brand-primary");
    });

    // #ff6b00 = rgb(255, 107, 0)
    expect(bgColor).toBe("rgb(255, 107, 0)");
  });

  test("should render custom secondary color", async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor("brand-secondary");
    });

    // #00d4ff = rgb(0, 212, 255)
    expect(bgColor).toBe("rgb(0, 212, 255)");
  });

  test("should render custom accent color", async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor("brand-accent");
    });

    // #ffed00 = rgb(255, 237, 0)
    expect(bgColor).toBe("rgb(255, 237, 0)");
  });

  test('should be available with data-theme="brand"', async ({ page }) => {
    const primaryVar = await page.evaluate(() => {
      return window.getCSSVariable('[data-theme="brand"]', "--color-primary");
    });

    expect(primaryVar).toBe("#ff6b00");
  });

  test('should render correctly with data-theme="brand"', async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor("data-theme-brand");
    });

    expect(bgColor).toBe("rgb(255, 107, 0)");
  });

  test("should generate -content variants for each color", async ({ page }) => {
    const contentVars = await page.evaluate(() => {
      const root = document.querySelector(":root");
      if (!root) return null;

      const style = getComputedStyle(root);
      return {
        primaryContent: style.getPropertyValue("--color-primary-content").trim(),
        secondaryContent: style.getPropertyValue("--color-secondary-content").trim(),
        accentContent: style.getPropertyValue("--color-accent-content").trim(),
      };
    });

    expect(contentVars?.primaryContent).toBeTruthy();
    expect(contentVars?.secondaryContent).toBeTruthy();
    expect(contentVars?.accentContent).toBeTruthy();
  });

  test("should generate -focus variants for each color", async ({ page }) => {
    const focusVars = await page.evaluate(() => {
      const root = document.querySelector(":root");
      if (!root) return null;

      const style = getComputedStyle(root);
      return {
        primaryFocus: style.getPropertyValue("--color-primary-focus").trim(),
        secondaryFocus: style.getPropertyValue("--color-secondary-focus").trim(),
        accentFocus: style.getPropertyValue("--color-accent-focus").trim(),
      };
    });

    expect(focusVars?.primaryFocus).toBeTruthy();
    expect(focusVars?.secondaryFocus).toBeTruthy();
    expect(focusVars?.accentFocus).toBeTruthy();
  });

  test("all custom colors should render in the UI", async ({ page }) => {
    const expectedColors = {
      "custom-primary": "rgb(255, 107, 0)",
      "custom-secondary": "rgb(0, 212, 255)",
      "custom-accent": "rgb(255, 237, 0)",
      "custom-neutral": "rgb(74, 85, 104)",
      "custom-info": "rgb(14, 165, 233)",
      "custom-success": "rgb(16, 185, 129)",
      "custom-warning": "rgb(245, 158, 11)",
      "custom-error": "rgb(239, 68, 68)",
    };

    for (const [id, expectedColor] of Object.entries(expectedColors)) {
      const bgColor = await page.evaluate((elementId) => {
        return window.getElementBgColor(elementId);
      }, id);
      expect(bgColor, `${id} should have the correct color`).toBe(expectedColor);
    }
  });
});
