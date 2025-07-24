import { ThemeColors } from "../types.ts";

/**
 * Defines the root theme variables used across all themes.
 *
 * These variables include base sizes, spacing, borders, and other foundational styles.
 */

const root: ThemeColors = {
    // Base sizes and spacing
    "--btn-p": "1rem",
    "--fontsize": "0.875rem",
    "--size-field": "0.25rem",
    "--size": "calc(var(--size-field) * 10)",
    "--radius-field": "0.375rem",

    // Border and radius
    "--border": "1px",
    "--depth": "1",
    "--join-ss": "var(--radius-field)",
    "--join-se": "var(--radius-field)",
    "--join-es": "var(--radius-field)",
    "--join-ee": "var(--radius-field)",

    // Noise and effects
    "--noise": "0",
    "--fx-noise": "none",
    "--btn-noise": "var(--fx-noise)",
};

export default root;