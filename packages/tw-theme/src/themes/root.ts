import { ThemeColors } from "../types.ts";

/**
 * Defines the root theme variables used across all themes.
 *
 * These variables include base sizes, spacing, borders, and other foundational styles.
 */

const root: ThemeColors = {
  // Base sizes and spacing
  "--paragraph": "1rem",
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

  // Profundidades de interaccion de estado, consumidas por el CSS de componente
  // para derivar hover/active/disabled con color-mix sobre el color del rol.
  "--hover-depth": "7%",
  "--active-depth": "5%",
  "--disabled-bg-opacity": "60%",
  "--disabled-fg-opacity": "35%",

  // Transiciones
  "--transition-duration": "0.2s",

  // Controles marcables (checkbox, radio, switch). Son globales y no de cada
  // componente porque los tres tienen que alinearse entre si cuando conviven
  // en un formulario: misma altura de caja, mismo grosor de marco y misma
  // separacion respecto a su etiqueta. Cada componente los redefine por
  // tamano, pero la relacion entre los tres la fija esta capa.
  "--control-size": "calc(var(--size-field) * 5)",
  "--control-radius": "var(--radius-field)",
  "--control-border-width": "var(--border)",
  "--control-gap": "0.5rem",
  "--control-mark-width": "2px",

  // Noise and effects
  "--noise": "0",
  "--fx-noise": "none",
  "--btn-noise": "var(--fx-noise)",
};

export default root;
