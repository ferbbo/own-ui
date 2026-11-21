// Button.types.ts
import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

/**
 * Tratamientos permitidos. Coinciden una a una con `variant` del contrato
 * (`@ownui/tw-theme/variants`) y con los selectores de `css/button.css`.
 *
 * No hay `solid`: el botón sólido es la **ausencia** de tratamiento (el
 * `.btn` base ya pinta `--btn-bg: var(--btn-color)`), y `.btn-solid` nunca
 * existió en el CSS. Tampoco hay `ghost`: es un rol (`theme="ghost"`), porque
 * fija el color de texto desde `--btn-color`.
 */
export type ButtonVariant = "outline" | "dash" | "soft";

export type ButtonTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "ghost"
  | "link";

/**
 * Tamaños permitidos para el botón (coinciden con las clases CSS definidas).
 */
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Forma: ancho igual a la altura (`--size`). Para botones icon-only. */
export type ButtonShape = "square" | "circle";

/** Ancho: fijo (16rem) o el del contenedor. */
export type ButtonWidth = "wide" | "block";

/**
 * Props comunes a ambos elementos (<button> y <a>), excepto `children` y
 * atributos nativos.
 */
interface ButtonBaseProps {
  /** Tratamiento: `outline`, `dash` o `soft`. Omitirlo = botón sólido. */
  variant?: ButtonVariant;
  /** Rol semántico: de qué familia de color tira el botón. */
  theme?: ButtonTheme;
  size?: ButtonSize;
  /** `square` o `circle`: ancho = altura. Implícito con `icon`. */
  shape?: ButtonShape;
  /** `wide` (16rem) o `block` (100%). */
  width?: ButtonWidth;
  /** Fuerza el aspecto de pulsado sin depender de `:active`. */
  active?: boolean;
  className?: string;
  disabled?: boolean;
  /**
   * Muestra un spinner **junto** al contenido y bloquea la interacción.
   * El spinner hereda el tamaño del botón y el color de contenido del tema.
   */
  loading?: boolean;
}

/** Botón con contenido: admite `children` y iconos a los lados. */
interface ButtonWithContentProps {
  /** Nodo antes del contenido. */
  startIcon?: ReactNode;
  /** Nodo después del contenido. */
  endIcon?: ReactNode;
  icon?: never;
}

/**
 * Botón icon-only: `icon` es el único contenido, así que **exige**
 * `aria-label` (sin texto visible no hay nombre accesible) y aplica
 * `.btn-square` salvo que se pida otra `shape`.
 */
interface ButtonIconOnlyProps {
  icon: ReactNode;
  "aria-label": string;
  children?: never;
  startIcon?: never;
  endIcon?: never;
}

/**
 * Props cuando `as` es "button" (o se omite).
 * - Hereda todos los atributos nativos de <button>, incluido `children`.
 */
export interface ButtonAsButtonProps
  extends ButtonBaseProps,
    ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button";
}

/**
 * Props cuando `as` es "a".
 * - Hereda atributos nativos de <a>, incluido `children`.
 * - Requiere `href`.
 * - `disabled` no aplica en <a>, así que lo prohibimos.
 */
export interface ButtonAsAnchorProps
  extends ButtonBaseProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "disabled"> {
  as: "a";
  href: string;
  disabled?: never;
}

/**
 * ButtonProps cruza dos uniones discriminadas:
 * - el elemento (`as: "button" | "a"`), que decide `type` vs `href`;
 * - el contenido (`children` + iconos laterales, o `icon` + `aria-label`).
 *
 * El cruce es explícito —y no `ButtonElementProps & ButtonContentProps`—
 * porque TypeScript solo estrecha correctamente las props prohibidas
 * (`never`) cuando cada combinación es un miembro de la unión.
 */
export type ButtonProps =
  | (ButtonAsButtonProps & ButtonWithContentProps)
  | (ButtonAsButtonProps & ButtonIconOnlyProps)
  | (ButtonAsAnchorProps & ButtonWithContentProps)
  | (ButtonAsAnchorProps & ButtonIconOnlyProps);
