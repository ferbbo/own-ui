import { ThemeColors } from "../types.js";

/**
 * Test utilities and fixtures for tw-theme testing
 */

export const mockThemes = {
  light: {
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
  } as ThemeColors,

  dark: {
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
  } as ThemeColors,

  minimal: {
    primary: "#3b82f6",
    secondary: "#f59e0b",
    accent: "#10b981",
  } as ThemeColors,

  empty: {} as ThemeColors,
};

export const mockColorFormats = {
  hex: "#3b82f6",
  hexUppercase: "#3B82F6",
  hexShort: "#36f",
  rgb: "rgb(59, 130, 246)",
  rgba: "rgba(59, 130, 246, 0.8)",
  hsl: "hsl(217, 91%, 60%)",
  hsla: "hsla(217, 91%, 60%, 0.9)",
  named: "blue",
  currentColor: "currentColor",
  inherit: "inherit",
  transparent: "transparent",
  customProperty: "var(--custom-color)",
};

export const generateLargeTheme = (size: number): ThemeColors => {
  const theme: ThemeColors = {};
  for (let i = 0; i < size; i++) {
    theme[`color-${i}`] = `#${i.toString(16).padStart(6, "0")}`;
  }
  return theme;
};

export const validateCSSCustomProperties = (properties: Record<string, string>): boolean => {
  return Object.keys(properties).every((key) => /^--[a-zA-Z0-9-]+$/.test(key));
};

export const createThemeWithVariants = (baseName: string, baseColor: string): ThemeColors => {
  return {
    [baseName]: baseColor,
    [`${baseName}-content`]: "#ffffff",
    [`${baseName}-focus`]: "#000000",
    [`${baseName}-100`]: "#f0f0f0",
    [`${baseName}-200`]: "#e0e0e0",
    [`${baseName}-300`]: "#d0d0d0",
  };
};
