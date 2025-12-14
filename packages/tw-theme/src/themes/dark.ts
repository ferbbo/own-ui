import { ThemeColors } from "../types.ts";

/**
 * Default dark theme colors
 */
export const darkTheme: ThemeColors = {
  // Primary color and variants
  "--color-primary": "#60a5fa", // Lighter blue for dark mode
  "--color-primary-content": "#1e293b", // Dark text on light background
  "--color-primary-focus": "#3b82f6",

  // Secondary color and variants
  "--color-secondary": "#34d399", // Lighter green for dark mode
  "--color-secondary-content": "#1e293b",
  "--color-secondary-focus": "#10b981",

  // Accent color and variants
  "--color-accent": "#a78bfa", // Lighter purple for dark mode
  "--color-accent-content": "#1e293b",
  "--color-accent-focus": "#8b5cf6",

  // Neutral color and variants
  "--color-neutral": "#9ca3af", // Lighter gray for dark mode
  "--color-neutral-content": "#1e293b",
  "--color-neutral-focus": "#6b7280",

  // Info color and variants
  "--color-info": "#38bdf8", // Lighter sky blue for dark mode
  "--color-info-content": "#1e293b",
  "--color-info-focus": "#0ea5e9",

  // Success color and variants
  "--color-success": "#4ade80", // Lighter green for dark mode
  "--color-success-content": "#1e293b",
  "--color-success-focus": "#22c55e",

  // Warning color and variants
  "--color-warning": "#fbbf24", // Lighter amber for dark mode
  "--color-warning-content": "#1e293b",
  "--color-warning-focus": "#f59e0b",

  // Error color and variants
  "--color-error": "#f87171", // Lighter red for dark mode
  "--color-error-content": "#1e293b",
  "--color-error-focus": "#ef4444",
};

export default darkTheme;
