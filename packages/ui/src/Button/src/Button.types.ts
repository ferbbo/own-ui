// Button.types.ts
import {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
} from "react";

/**
 * Variantes permitidas para el botón (coinciden con las clases CSS definidas).
 */
export type ButtonVariant =
  | "outline"
  | "dash"
  | "soft";

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
export type ButtonSize =
  | "xs"
  | "sm"
  | "md"
  | "lg"
  | "xl";

/**
 * Props comunes a ambos elementos (<button> y <a>), excepto `children` y atributos nativos.
 */
interface ButtonBaseProps {
  variant?: ButtonVariant;
  theme?: ButtonTheme;
  size?: ButtonSize;
  className?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  startIcon?: boolean;
  endIcon?: boolean;
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
 * ButtonProps es unión discriminada:
 * - Si `as` es "a", usa ButtonAsAnchorProps.
 * - Si `as` no está o es "button", usa ButtonAsButtonProps.
 * En ambos casos, `children` proviene de la interfaz HTML respectiva.
 */
export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;



