import generateThemeProperties from "../generateThemeProperties.js";
import { cssVarName } from "../../utilities/index.js";
import { ThemeColors } from "../../types.js";

describe("generateThemeProperties integration tests", () => {
  describe("Integration with cssVarName utility", () => {
    it("should use cssVarName utility consistently", () => {
      const theme: ThemeColors = {
        primary: "#3b82f6",
        "primary-content": "#ffffff",
      };

      const result = generateThemeProperties(theme);

      // Verify that the function uses cssVarName utility correctly
      expect(result[cssVarName("primary")]).toBe("#3b82f6");
      expect(result[cssVarName("primary-content")]).toBe("#ffffff");
    });

    it("should generate properties that match manual cssVarName calls", () => {
      const colorName = "primary";
      const colorValue = "#3b82f6";
      const theme: ThemeColors = { [colorName]: colorValue };

      const result = generateThemeProperties(theme);
      const expectedKey = cssVarName(colorName);

      expect(result).toHaveProperty(expectedKey);
      expect(result[expectedKey]).toBe(colorValue);
    });
  });

  describe("Real-world theme scenarios", () => {
    it("should handle a complete light theme", () => {
      const lightTheme: ThemeColors = {
        primary: "#3b82f6",
        "primary-content": "#ffffff",
        "primary-focus": "#2563eb",
        secondary: "#f59e0b",
        "secondary-content": "#000000",
        "secondary-focus": "#d97706",
        accent: "#10b981",
        "accent-content": "#000000",
        "accent-focus": "#059669",
        neutral: "#64748b",
        "neutral-content": "#000000",
        "neutral-focus": "#475569",
        "base-100": "#ffffff",
        "base-200": "#f1f5f9",
        "base-300": "#e2e8f0",
        "base-content": "#1e293b",
        info: "#0ea5e9",
        "info-content": "#000000",
        success: "#22c55e",
        "success-content": "#000000",
        warning: "#f59e0b",
        "warning-content": "#000000",
        error: "#ef4444",
        "error-content": "#ffffff",
      };

      const result = generateThemeProperties(lightTheme);

      expect(Object.keys(result)).toHaveLength(Object.keys(lightTheme).length);
      expect(result).toMatchObject({
        "--primary": "#3b82f6",
        "--primary-content": "#ffffff",
        "--primary-focus": "#2563eb",
        "--secondary": "#f59e0b",
        "--base-100": "#ffffff",
        "--base-content": "#1e293b",
        "--error": "#ef4444",
        "--error-content": "#ffffff",
      });
    });

    it("should handle a complete dark theme", () => {
      const darkTheme: ThemeColors = {
        primary: "#60a5fa",
        "primary-content": "#000000",
        "primary-focus": "#3b82f6",
        secondary: "#fbbf24",
        "secondary-content": "#000000",
        "secondary-focus": "#f59e0b",
        accent: "#34d399",
        "accent-content": "#000000",
        "accent-focus": "#10b981",
        neutral: "#94a3b8",
        "neutral-content": "#000000",
        "neutral-focus": "#64748b",
        "base-100": "#1e293b",
        "base-200": "#334155",
        "base-300": "#475569",
        "base-content": "#f1f5f9",
        info: "#38bdf8",
        "info-content": "#000000",
        success: "#4ade80",
        "success-content": "#000000",
        warning: "#fbbf24",
        "warning-content": "#000000",
        error: "#f87171",
        "error-content": "#000000",
      };

      const result = generateThemeProperties(darkTheme);

      expect(Object.keys(result)).toHaveLength(Object.keys(darkTheme).length);
      expect(result).toMatchObject({
        "--primary": "#60a5fa",
        "--primary-content": "#000000",
        "--base-100": "#1e293b",
        "--base-content": "#f1f5f9",
        "--error": "#f87171",
        "--error-content": "#000000",
      });
    });
  });

  describe("Output validation", () => {
    it("should generate valid CSS custom property names", () => {
      const theme: ThemeColors = {
        primary: "#3b82f6",
        "primary-content": "#ffffff",
        "base-100": "#ffffff",
      };

      const result = generateThemeProperties(theme);

      // All keys should start with --
      Object.keys(result).forEach((key) => {
        expect(key).toMatch(/^--[a-zA-Z0-9-]+$/);
      });
    });

    it("should preserve color values without modification", () => {
      const theme: ThemeColors = {
        primary: "#3B82F6",
        secondary: "rgb(245, 158, 11)",
        accent: "hsl(160, 84%, 39%)",
        background: "transparent",
      };

      const result = generateThemeProperties(theme);

      expect(result["--primary"]).toBe("#3B82F6");
      expect(result["--secondary"]).toBe("rgb(245, 158, 11)");
      expect(result["--accent"]).toBe("hsl(160, 84%, 39%)");
      expect(result["--background"]).toBe("transparent");
    });
  });
});
