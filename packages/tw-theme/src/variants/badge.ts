/**
 * Contrato de clases del Badge: prop de React -> clase CSS.
 *
 * Es la fuente de verdad entre `packages/ui/src/Badge` y
 * `packages/tw-theme/src/css/badge.css`: toda clave de aquí tiene que
 * resolver a un selector que exista de verdad en el CSS, y todo valor de las
 * uniones de `Badge.types.ts` tiene que tener entrada aquí. Lo verifica
 * `pnpm check:contract`, no la buena voluntad.
 *
 * A diferencia del Card y del Input, el Badge **sí rellena con el rol**: su
 * contenido es sólo texto corto, así que el par rol / `-content` del tema es
 * exactamente lo que necesita. Mismo criterio que el Button.
 */
export default {
  /** Rol semántico: fija --badge-color / --badge-fg. */
  theme: {
    primary: "badge-primary",
    secondary: "badge-secondary",
    accent: "badge-accent",
    neutral: "badge-neutral",
    info: "badge-info",
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
  },
  /**
   * Tratamiento del relleno. Los dos pintan texto de color de rol sobre una
   * superficie del tema, así que usan `--badge-role-fg` (el rol mezclado
   * hacia `--color-base-content`) y no el token `-content`, que sólo es
   * legible encima del relleno del rol.
   */
  variant: {
    outline: "badge-outline",
    soft: "badge-soft",
  },
  size: {
    xs: "badge-xs",
    sm: "badge-sm",
    md: "badge-md",
    lg: "badge-lg",
    xl: "badge-xl",
  },
  /** Modificadores que no derivan de un pseudo-selector. */
  state: {
    /** Punto de estado: badge cuadrado y sin contenido. */
    dot: "badge-dot",
  },
  /** La clase base. Está en el contrato para que `check:contract` la cruce. */
  part: {
    root: "badge",
  },
};
