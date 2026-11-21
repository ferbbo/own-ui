/**
 * Contrato de clases del Button: prop de React -> clase CSS.
 *
 * Es la fuente de verdad entre `packages/ui/src/Button` y
 * `packages/tw-theme/src/css/button.css`. Toda clave que aparezca aqui tiene
 * que resolver a un selector que exista de verdad en el CSS; eso lo verifica
 * `src/variants/__tests__/contract.test.ts`, no la buena voluntad.
 *
 * Lote 5: se retiro `variant.solid` (no existe `.btn-solid`: "solid" es la
 * ausencia de tratamiento) y el `ghost` que estaba duplicado en `theme` y en
 * `variant` — `ghost` es un rol, no un tratamiento, porque fija el color de
 * texto desde `--btn-color`. Y se exponen los modificadores de layout que el
 * CSS ya tenia y React ignoraba.
 */
export default {
  /** Rol semantico: fija --btn-color / --btn-fg / --btn-focus-color. */
  theme: {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    neutral: "btn-neutral",
    info: "btn-info",
    success: "btn-success",
    warning: "btn-warning",
    error: "btn-error",
    ghost: "btn-ghost",
    link: "btn-link",
  },
  /** Tratamiento: solo remapea fuente -> finales (bg/fg/border). */
  variant: {
    outline: "btn-outline",
    dash: "btn-dash",
    soft: "btn-soft",
  },
  size: {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
    xl: "btn-xl",
  },
  /** Forma: ancho igual a la altura (--size), para botones icon-only. */
  shape: {
    square: "btn-square",
    circle: "btn-circle",
  },
  /** Ancho: fijo (16rem) o del contenedor. */
  width: {
    wide: "btn-wide",
    block: "btn-block",
  },
  /**
   * Estados que no derivan de un pseudo-selector.
   * `disabled` existe para los elementos que no aceptan el atributo nativo
   * (`<a>`): `.btn:where(:disabled, [disabled], .btn-disabled)` cubre los tres.
   */
  state: {
    active: "btn-active",
    disabled: "btn-disabled",
  },
};
