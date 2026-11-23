/**
 * Contrato de clases del Input: prop de React -> clase CSS.
 *
 * Es la fuente de verdad entre `packages/ui/src/Input` y
 * `packages/tw-theme/src/css/input.css`: toda clave de aquí tiene que
 * resolver a un selector que exista de verdad en el CSS, y todo valor de las
 * uniones de `Input.types.ts` tiene que tener entrada aquí. Lo verifica
 * `pnpm check:contract`, no la buena voluntad.
 *
 * A diferencia del Button, el rol **no pinta el relleno**: colorea el borde y
 * el anillo de foco. Un campo de texto con fondo de rol es ilegible en cuanto
 * lleva contenido. Ver la anatomía al principio de `css/input.css`.
 */
export default {
  /** Rol semántico: fija --input-color / --input-focus-color. */
  theme: {
    primary: "input-primary",
    secondary: "input-secondary",
    accent: "input-accent",
    neutral: "input-neutral",
    info: "input-info",
    success: "input-success",
    warning: "input-warning",
    error: "input-error",
  },
  /** Tratamiento del marco: sólo remapea fuente -> finales (bg/border). */
  variant: {
    outline: "input-outline",
    ghost: "input-ghost",
    bordered: "input-bordered",
  },
  size: {
    xs: "input-xs",
    sm: "input-sm",
    md: "input-md",
    lg: "input-lg",
    xl: "input-xl",
  },
  /**
   * Estados que no derivan de un pseudo-selector.
   *
   * Existen como clase y no sólo como `:disabled` / `[readonly]` porque el
   * CSS también tiene que servir a HTML escrito a mano y a casos donde el
   * atributo nativo no está (un campo compuesto, un `contenteditable`).
   */
  state: {
    invalid: "input-invalid",
    readOnly: "input-readonly",
    disabled: "input-disabled",
  },
  /**
   * Partes del campo. No son variantes: son los nodos que monta el
   * componente, y están en el contrato para que `check:contract` verifique
   * que cada uno tiene selector.
   */
  part: {
    /** Contenedor en columna: label + caja + ayuda/error. */
    field: "input-field",
    /** `<label>` asociado al control. */
    label: "input-label",
    /** La caja: borde, relleno, altura y foco. */
    box: "input",
    /** El `<input>` nativo, transparente y sin borde propio. */
    control: "input-control",
    /** Adorno a izquierda o derecha, dentro de la caja. */
    icon: "input-icon",
    /** Texto de ayuda. */
    description: "input-description",
    /**
     * Mensaje de error. No es `input-error`: ese nombre ya es el rol
     * semántico `error` del mapa `theme`.
     */
    errorMessage: "input-error-message",
  },
};
