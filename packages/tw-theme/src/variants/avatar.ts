/**
 * Contrato de clases del Avatar: prop de React -> clase CSS.
 *
 * Es la fuente de verdad entre `packages/ui/src/Avatar` y
 * `packages/tw-theme/src/css/avatar.css`: toda clave de aquí tiene que
 * resolver a un selector que exista de verdad en el CSS, y todo valor de las
 * uniones de `Avatar.types.ts` tiene que tener entrada aquí. Lo verifica
 * `pnpm check:contract`, no la buena voluntad.
 *
 * El rol no rellena a plena intensidad: las iniciales son texto sobre el
 * relleno y el token `-content` del rol no es legible ahí. Se usa el mismo
 * mecanismo que el Badge (relleno lavado + texto del rol mezclado hacia
 * `--color-base-content`). Ver la anatomía al principio de `css/avatar.css`.
 */
export default {
  /** Rol semántico: fija --avatar-color, de donde salen relleno y texto. */
  theme: {
    primary: "avatar-primary",
    secondary: "avatar-secondary",
    accent: "avatar-accent",
    neutral: "avatar-neutral",
    info: "avatar-info",
    success: "avatar-success",
    warning: "avatar-warning",
    error: "avatar-error",
  },
  /** Forma de la caja. `circle` es el valor por defecto. */
  shape: {
    circle: "avatar-circle",
    square: "avatar-square",
  },
  size: {
    xs: "avatar-xs",
    sm: "avatar-sm",
    md: "avatar-md",
    lg: "avatar-lg",
    xl: "avatar-xl",
  },
  /**
   * Partes del avatar. Los tres contenidos son excluyentes: imagen, iniciales
   * o icono de reserva.
   */
  part: {
    /** La caja cuadrada: tamaño, forma, recorte y relleno. */
    root: "avatar",
    /** `<img>` a sangre, recortada por el centro. */
    image: "avatar-img",
    /** Una o dos letras centradas. */
    initials: "avatar-initials",
    /** Icono genérico cuando no hay imagen ni nombre. */
    fallback: "avatar-fallback",
    /** Fila de avatares solapados. */
    group: "avatar-group",
  },
};
