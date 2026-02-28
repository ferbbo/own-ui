import { ThemeColors } from "../types.ts";

/**
 * Default dark theme colors
 */
export const darkTheme: ThemeColors = {
  // Primary color and variants
  "--color-primary": "#4E46B4", // Piccolo
  "--color-primary-content": "#ffffff",
  // "--color-primary-focus": "trans",

  // Secondary color and variants // jiren
  "--color-secondary": "#211F43", // Lighter green for dark mode
  "--color-secondary-content": "#ffffff",

  // Accent color and variants // Hit
  "--color-accent": "#40A69F", // Lighter purple for dark mode
  "--color-accent-content": "#ffffff",

  // Neutral color and variants // Beerus
  "--color-neutral": "#444444", // Lighter gray for dark mode
  "--color-neutral-content": "#ffffff",

  // Info color and variants
  "--color-info": "#38bdf8", // Lighter sky blue for dark mode
  "--color-info-content": "#1e293b",

  // Success color and variants
  "--color-success": "#4ade80", // Lighter green for dark mode
  "--color-success-content": "#1e293b",

  // Warning color and variants
  "--color-warning": "#fbbf24", // Lighter amber for dark mode
  "--color-warning-content": "#1e293b",

  // Error color and variants
  "--color-error": "#f87171", // Lighter red for dark mode
  "--color-error-content": "#1e293b",
};

export default darkTheme;
