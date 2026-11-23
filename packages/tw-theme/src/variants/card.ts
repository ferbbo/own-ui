/**
 * Contrato de clases del Card: prop de React -> clase CSS.
 *
 * Es la fuente de verdad entre `packages/ui/src/Card` y
 * `packages/tw-theme/src/css/card.css`: toda clave de aquí tiene que resolver
 * a un selector que exista de verdad en el CSS, y todo valor de las uniones de
 * `Card.types.ts` tiene que tener entrada aquí. Lo verifica
 * `pnpm check:contract`, no la buena voluntad.
 *
 * Igual que en el Input, el rol **no pinta el relleno**: colorea el borde, los
 * separadores de las partes y el anillo de foco. Ver la anatomía al principio
 * de `css/card.css`.
 */
export default {
  /** Rol semántico: fija --card-color / --card-focus-color. */
  theme: {
    primary: "card-primary",
    secondary: "card-secondary",
    accent: "card-accent",
    neutral: "card-neutral",
    info: "card-info",
    success: "card-success",
    warning: "card-warning",
    error: "card-error",
  },
  /** Tratamiento del marco: sólo remapea sombra y borde. */
  variant: {
    elevated: "card-elevated",
    outlined: "card-outlined",
    ghost: "card-ghost",
  },
  size: {
    xs: "card-xs",
    sm: "card-sm",
    md: "card-md",
    lg: "card-lg",
    xl: "card-xl",
  },
  /**
   * Estados que no derivan de un pseudo-selector.
   *
   * `clickable` es el único: existe como clase porque el hover y el `active`
   * de un card accionable no se pueden derivar del elemento (`as="a"` y
   * `as="div"` con `onClick` son el mismo nodo para el CSS).
   */
  state: {
    clickable: "card-clickable",
  },
  /**
   * Partes del card. No son variantes: son los nodos que monta el componente
   * compuesto, y están en el contrato para que `check:contract` verifique que
   * cada uno tiene selector.
   */
  part: {
    /** La superficie: fondo, borde, radio y sombra. */
    root: "card",
    /** Cabecera con separador inferior. */
    header: "card-header",
    /** Título de la cabecera (`<h3>` por defecto). */
    title: "card-title",
    /** Cuerpo: es quien lleva el padding del contenido y quien crece. */
    body: "card-body",
    /** Pie con separador superior y contenido alineado al final. */
    footer: "card-footer",
  },
};
