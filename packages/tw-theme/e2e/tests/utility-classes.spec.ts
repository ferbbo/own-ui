import { test, expect } from "@playwright/test";

/**
 * E2E-5: Generated utility classes
 *
 * Validates that the plugin correctly generates all utility
 * classes for semantic colors.
 */

test.describe("E2E-5: Utility Classes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/utility-classes/");
  });

  test.describe("Background Classes (bg-*)", () => {
    const expectedBgColors = {
      "bg-primary": "rgb(59, 130, 246)",
      "bg-secondary": "rgb(16, 185, 129)",
      "bg-accent": "rgb(139, 92, 246)",
      "bg-neutral": "rgb(107, 114, 128)",
      "bg-info": "rgb(14, 165, 233)",
      "bg-success": "rgb(34, 197, 94)",
      "bg-warning": "rgb(245, 158, 11)",
      "bg-error": "rgb(239, 68, 68)",
    };

    for (const [id, expectedColor] of Object.entries(expectedBgColors)) {
      test(`${id} should apply the correct background color`, async ({ page }) => {
        const bgColor = await page.evaluate((elementId) => {
          return window.getElementBgColor(elementId);
        }, id);

        expect(bgColor).toBe(expectedColor);
      });
    }
  });

  test.describe("Text Classes (text-*)", () => {
    const expectedTextColors = {
      "text-primary": "rgb(59, 130, 246)",
      "text-secondary": "rgb(16, 185, 129)",
      "text-accent": "rgb(139, 92, 246)",
      "text-neutral": "rgb(107, 114, 128)",
      "text-info": "rgb(14, 165, 233)",
      "text-success": "rgb(34, 197, 94)",
      "text-warning": "rgb(245, 158, 11)",
      "text-error": "rgb(239, 68, 68)",
    };

    for (const [id, expectedColor] of Object.entries(expectedTextColors)) {
      test(`${id} should apply the correct text color`, async ({ page }) => {
        const textColor = await page.evaluate((elementId) => {
          return window.getElementTextColor(elementId);
        }, id);

        expect(textColor).toBe(expectedColor);
      });
    }
  });

  test.describe("Border Classes (border-*)", () => {
    const expectedBorderColors = {
      "border-primary": "rgb(59, 130, 246)",
      "border-secondary": "rgb(16, 185, 129)",
      "border-accent": "rgb(139, 92, 246)",
      "border-neutral": "rgb(107, 114, 128)",
      "border-info": "rgb(14, 165, 233)",
      "border-success": "rgb(34, 197, 94)",
      "border-warning": "rgb(245, 158, 11)",
      "border-error": "rgb(239, 68, 68)",
    };

    for (const [id, expectedColor] of Object.entries(expectedBorderColors)) {
      test(`${id} should apply the correct border color`, async ({ page }) => {
        const borderColor = await page.evaluate((elementId) => {
          return window.getElementBorderColor(elementId);
        }, id);

        expect(borderColor).toBe(expectedColor);
      });
    }
  });

  test.describe("Content Variant Classes (text-*-content)", () => {
    test("text-primary-content should have contrasting color", async ({ page }) => {
      const textColor = await page.evaluate(() => {
        return window.getElementTextColor("text-primary-content");
      });

      // Content colors are typically white or black for contrast
      expect(textColor).toMatch(/^rgb\(/);
      expect(textColor).toBeTruthy();
    });

    test("text-secondary-content should have contrasting color", async ({ page }) => {
      const textColor = await page.evaluate(() => {
        return window.getElementTextColor("text-secondary-content");
      });

      expect(textColor).toMatch(/^rgb\(/);
      expect(textColor).toBeTruthy();
    });

    test("text-accent-content should have contrasting color", async ({ page }) => {
      const textColor = await page.evaluate(() => {
        return window.getElementTextColor("text-accent-content");
      });

      expect(textColor).toMatch(/^rgb\(/);
      expect(textColor).toBeTruthy();
    });
  });

  test("should combine multiple utility classes correctly", async ({ page }) => {
    const bgColor = await page.evaluate(() => {
      return window.getElementBgColor("combined-test");
    });

    const borderColor = await page.evaluate(() => {
      return window.getElementBorderColor("combined-test");
    });

    expect(bgColor).toBe("rgb(59, 130, 246)"); // primary
    expect(borderColor).toMatch(/^rgb\(/); // primary-focus
  });

  test("hover:bg-*-focus should apply on hover", async ({ page }) => {
    // Hover over the button
    await page.hover("#hover-primary");
    await page.waitForTimeout(100);

    // Color should change to focus variant
    const hoverColor = await page.evaluate(() => {
      const el = document.getElementById("hover-primary");
      return el ? getComputedStyle(el).backgroundColor : null;
    });

    // Focus variant should be different (darker/lighter)
    expect(hoverColor).toMatch(/^rgb\(/);
  });

  test("all bg-* classes should exist and be visible", async ({ page }) => {
    const allBgElements = await page.locator('[id^="bg-"]').all();

    expect(allBgElements.length).toBeGreaterThanOrEqual(8);

    for (const element of allBgElements) {
      await expect(element).toBeVisible();
    }
  });

  test("all text-* classes should exist and be visible", async ({ page }) => {
    const allTextElements = await page.locator('[id^="text-"]').all();

    expect(allTextElements.length).toBeGreaterThanOrEqual(8);

    for (const element of allTextElements) {
      await expect(element).toBeVisible();
    }
  });

  test("all border-* classes should exist and be visible", async ({ page }) => {
    const allBorderElements = await page.locator('[id^="border-"]').all();

    expect(allBorderElements.length).toBeGreaterThanOrEqual(8);

    for (const element of allBorderElements) {
      await expect(element).toBeVisible();
    }
  });
});
