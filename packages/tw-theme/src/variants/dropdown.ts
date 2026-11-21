/**
 * Contrato de clases del Dropdown: prop de React → clase CSS.
 *
 * Es la fuente de verdad entre `packages/ui/src/Dropdown` y
 * `src/css/dropdown.css` (AGENTS.md §4.7). Reescrito en el lote 6: la version
 * anterior era una copia del contrato de `button` y declaraba
 * `dropdown-outline`, `dropdown-solid` y `dropdown-link`, tres clases que no
 * existen en el CSS ni las emite ningun hook, mientras que las que si se
 * emiten (`dropdown-trigger`, `dropdown-menu`, `dropdown-open`, los estados
 * del item y las variantes de estilo) no estaban declaradas en ninguna parte.
 *
 * La estructura refleja los cuatro elementos del compound, porque los hooks de
 * `useDropdown.tsx` emiten la variante y el tamano en DOS niveles: en el
 * wrapper (`dropdown-primary`) y en el panel (`dropdown-menu-primary`).
 *
 * `src/__tests__/dropdown-contract.test.ts` cruza este archivo contra el
 * CSS y contra los literales del hook: si los tres dejan de decir lo mismo,
 * falla la suite.
 */
const dropdown = {
  /** Wrapper de posicionamiento (`DropdownRoot`). */
  base: "dropdown",

  /** Variante semantica — `DropdownVariant`. */
  theme: {
    primary: "dropdown-primary",
    secondary: "dropdown-secondary",
    accent: "dropdown-accent",
    neutral: "dropdown-neutral",
    info: "dropdown-info",
    success: "dropdown-success",
    warning: "dropdown-warning",
    error: "dropdown-error",
  },

  /** Tamano — `DropdownSize`. */
  size: {
    xs: "dropdown-xs",
    sm: "dropdown-sm",
    md: "dropdown-md",
    lg: "dropdown-lg",
    xl: "dropdown-xl",
  },

  /** Variante de estilo — `DropdownStyleVariant`. */
  styleVariant: {
    ghost: "dropdown-ghost",
    bordered: "dropdown-bordered",
    compact: "dropdown-compact",
  },

  /** Estado del wrapper. */
  state: {
    open: "dropdown-open",
  },

  /** `Dropdown.Trigger`. */
  trigger: {
    base: "dropdown-trigger",
    active: "dropdown-trigger-active",
  },

  /** `Dropdown.Menu` — el panel. Repite variante/tamano/estilo por nivel. */
  menu: {
    base: "dropdown-menu",
    theme: {
      primary: "dropdown-menu-primary",
      secondary: "dropdown-menu-secondary",
      accent: "dropdown-menu-accent",
      neutral: "dropdown-menu-neutral",
      info: "dropdown-menu-info",
      success: "dropdown-menu-success",
      warning: "dropdown-menu-warning",
      error: "dropdown-menu-error",
    },
    size: {
      xs: "dropdown-menu-xs",
      sm: "dropdown-menu-sm",
      md: "dropdown-menu-md",
      lg: "dropdown-menu-lg",
      xl: "dropdown-menu-xl",
    },
    styleVariant: {
      ghost: "dropdown-menu-ghost",
      bordered: "dropdown-menu-bordered",
      compact: "dropdown-menu-compact",
    },
    state: {
      open: "dropdown-menu-open",
      closed: "dropdown-menu-closed",
    },
  },

  /** `Dropdown.Item`. */
  item: {
    base: "dropdown-item",
    selected: "dropdown-item-selected",
    disabled: "dropdown-item-disabled",
    text: "dropdown-item-text",
  },
};

export default dropdown;
