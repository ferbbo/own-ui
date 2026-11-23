/**
 * Contrato de clases del Switch: prop de React -> clase CSS.
 *
 * Fuente de verdad entre `packages/ui/src/Switch` y
 * `packages/tw-theme/src/css/switch.css`. Lo verifica `pnpm check:contract`.
 *
 * Comparte con el Checkbox la fuente de color y los tokens `--control-*`,
 * pero no la geometria ni los estados: un switch no tiene indeterminado,
 * porque "encendido a medias" no significa nada.
 *
 * Tampoco tiene grupo. Un grupo de switches no es un control compuesto: son
 * N ajustes independientes, cada uno con efecto inmediato. Si lo que hace
 * falta es elegir entre opciones, eso es un Checkbox group o un Radio group.
 */
export default {
  /** Rol semantico: fija --switch-color / --switch-fg. */
  theme: {
    primary: "switch-primary",
    secondary: "switch-secondary",
    accent: "switch-accent",
    neutral: "switch-neutral",
    info: "switch-info",
    success: "switch-success",
    warning: "switch-warning",
    error: "switch-error",
  },
  size: {
    xs: "switch-xs",
    sm: "switch-sm",
    md: "switch-md",
    lg: "switch-lg",
    xl: "switch-xl",
  },
  state: {
    checked: "switch-checked",
    focused: "switch-focused",
    invalid: "switch-invalid",
    disabled: "switch-disabled",
  },
  part: {
    field: "switch-field",
    input: "switch-input",
    /** La pista. */
    box: "switch",
    /** El pulgar que se desplaza. */
    thumb: "switch-thumb",
    label: "switch-label",
  },
};
