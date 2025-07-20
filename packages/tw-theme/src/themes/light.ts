import { ThemeColors } from '../types.ts';

/**
 * Default light theme colors
 */
export const lightTheme: ThemeColors = {
  // Primary color and variants
  '--color-primary': '#3b82f6', // Blue
  '--color-primary-content': '#ffffff',
  '--color-primary-focus': '#2563eb',

  // Secondary color and variants
  '--color-secondary': '#10b981', // Green
  '--color-secondary-content': '#ffffff',
  '--color-secondary-focus': '#059669',

  // Accent color and variants
  '--color-accent': '#8b5cf6', // Purple
  '--color-accent-content': '#ffffff',
  '--color-accent-focus': '#7c3aed',

  // Neutral color and variants
  '--color-neutral': '#6b7280', // Gray
  '--color-neutral-content': '#ffffff',
  '--color-neutral-focus': '#4b5563',

  // Info color and variants
  '--color-info': '#0ea5e9', // Sky blue
  '--color-info-content': '#ffffff',
  '--color-info-focus': '#0284c7',

  // Success color and variants
  '--color-success': '#22c55e', // Green
  '--color-success-content': '#ffffff',
  '--color-success-focus': '#16a34a',

  // Warning color and variants
  '--color-warning': '#f59e0b', // Amber
  '--color-warning-content': '#ffffff',
  '--color-warning-focus': '#d97706',

  // Error color and variants
  '--color-error': '#ef4444', // Red
  '--color-error-content': '#ffffff',
  '--color-error-focus': '#dc2626',
};

export default lightTheme;
