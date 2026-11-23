/**
 * Contrato de clases del Radio: prop de React -> clase CSS.
 *
 * Fuente de verdad entre `packages/ui/src/Radio` y
 * `packages/tw-theme/src/css/radio.css`. Lo verifica `pnpm check:contract`.
 *
 * No hay `indeterminate`: un radio o esta elegido o no, y la ausencia de
 * eleccion es un estado del **grupo**, no del control.
 */
export default {
  /** Rol semantico: fija --radio-color. */
  theme: {
    primary: "radio-primary",
    secondary: "radio-secondary",
    accent: "radio-accent",
    neutral: "radio-neutral",
    info: "radio-info",
    success: "radio-success",
    warning: "radio-warning",
    error: "radio-error",
  },
  size: {
    xs: "radio-xs",
    sm: "radio-sm",
    md: "radio-md",
    lg: "radio-lg",
    xl: "radio-xl",
  },
  state: {
    checked: "radio-checked",
    focused: "radio-focused",
    invalid: "radio-invalid",
    disabled: "radio-disabled",
  },
  part: {
    field: "radio-field",
    input: "radio-input",
    /** El circulo que se ve. */
    box: "radio",
    /** El punto interior. */
    mark: "radio-mark",
    label: "radio-label",
    group: "radio-group",
    groupItems: "radio-group-items",
    groupLabel: "radio-group-label",
    groupDescription: "radio-group-description",
    groupErrorMessage: "radio-group-error-message",
  },
};
