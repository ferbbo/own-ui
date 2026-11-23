/**
 * Contrato de clases del Checkbox: prop de React -> clase CSS.
 *
 * Fuente de verdad entre `packages/ui/src/Checkbox` y
 * `packages/tw-theme/src/css/checkbox.css`. Lo verifica
 * `pnpm check:contract`.
 *
 * El `<input>` nativo se oculta visualmente y lo que se pinta es un `<span>`
 * hermano, asi que las partes no son decorativas: son los nodos que el
 * componente tiene que montar para que el control exista.
 */
export default {
  /** Rol semantico: fija --checkbox-color / --checkbox-fg. */
  theme: {
    primary: "checkbox-primary",
    secondary: "checkbox-secondary",
    accent: "checkbox-accent",
    neutral: "checkbox-neutral",
    info: "checkbox-info",
    success: "checkbox-success",
    warning: "checkbox-warning",
    error: "checkbox-error",
  },
  size: {
    xs: "checkbox-xs",
    sm: "checkbox-sm",
    md: "checkbox-md",
    lg: "checkbox-lg",
    xl: "checkbox-xl",
  },
  /**
   * Estados. Existen como clase y no solo como pseudo-selector porque el CSS
   * tambien sirve a HTML escrito a mano, y porque `indeterminate` **no es un
   * atributo**: solo existe como propiedad del elemento en el DOM, asi que
   * sin clase no hay forma de pintarlo desde el servidor.
   */
  /**
   * No hay `focused`: el anillo de foco lo resuelve el CSS con
   * `:has(:focus-visible)` sobre el input nativo, que es lo correcto
   * tanto con React como con HTML escrito a mano. Emitir una clase desde
   * JS seria una segunda fuente de verdad para el mismo estado.
   */
  state: {
    checked: "checkbox-checked",
    indeterminate: "checkbox-indeterminate",
    invalid: "checkbox-invalid",
    disabled: "checkbox-disabled",
  },
  /** Nodos que monta el componente. */
  part: {
    /** `<label>` que envuelve control y texto. */
    field: "checkbox-field",
    /** El `<input type="checkbox">`, oculto visualmente pero enfocable. */
    input: "checkbox-input",
    /** La caja que se ve. */
    box: "checkbox",
    /** El trazo: check o guion. */
    mark: "checkbox-mark",
    /** El texto de la opcion. */
    label: "checkbox-label",
    /** Contenedor del grupo. */
    group: "checkbox-group",
    /** Lista de opciones dentro del grupo. */
    groupItems: "checkbox-group-items",
    /** Etiqueta del grupo. */
    groupLabel: "checkbox-group-label",
    /** Texto de ayuda del grupo. */
    groupDescription: "checkbox-group-description",
    /** Mensaje de error del grupo. */
    groupErrorMessage: "checkbox-group-error-message",
  },
};
