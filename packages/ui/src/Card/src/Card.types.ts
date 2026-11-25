// Card.types.ts
import { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

/**
 * Roles semánticos del Card. Cada valor tiene entrada en `theme` de
 * `variants/card.ts` (lo verifica `pnpm check:contract`).
 *
 * El rol **no pinta el relleno**: colorea el borde, los separadores de las
 * partes y el anillo de foco. Ver la anatomía al principio de `css/card.css`.
 */
export type CardTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/**
 * Tratamiento del marco. Omitirlo es la superficie por defecto: borde
 * difuminado y sombra mínima.
 *
 * No hay `filled` a propósito: "relleno de rol" es justo lo que la anatomía
 * del componente descarta.
 */
export type CardVariant = "elevated" | "outlined" | "ghost";

/** Tamaños del Card: escalan el padding de las partes y la tipografía. */
export type CardSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Elementos de agrupación admitidos cuando el card **no** es accionable.
 *
 * Es una lista cerrada y no `ElementType` porque un card es una superficie de
 * contenido: `as="input"` o `as="table"` no significan nada aquí, y dejarlos
 * pasar obligaría al hook a razonar sobre atributos que nunca va a recibir.
 */
export type CardElement = "div" | "article" | "section" | "aside" | "li";

/** Props propias del Card (las que no son atributos del DOM). */
export interface CardBaseProps {
  /** Rol semántico del borde y del anillo de foco. */
  theme?: CardTheme;
  /** Tratamiento del marco. */
  variant?: CardVariant;
  /** Tamaño. */
  size?: CardSize;
  /** Clases CSS adicionales. */
  className?: string;
  /** Contenido: normalmente `Card.Header`, `Card.Body` y `Card.Footer`. */
  children?: ReactNode;
}

/** Card de agrupación: una superficie que no responde a pulsaciones. */
export interface CardAsElementProps
  extends CardBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, keyof CardBaseProps> {
  as?: CardElement;
  /** Prohibido: un card con `href` tiene que declarar `as="a"`. */
  href?: never;
}

/** Card accionable como enlace. Recibe el tratamiento de hover y foco. */
export interface CardAsAnchorProps
  extends CardBaseProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof CardBaseProps> {
  as: "a";
  /** Obligatorio: un `<a>` sin `href` no es enfocable ni anunciable. */
  href: string;
}

/** Card accionable como botón. Recibe el tratamiento de hover y foco. */
export interface CardAsButtonProps
  extends CardBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof CardBaseProps> {
  as: "button";
  /** Prohibido en un `<button>`. */
  href?: never;
}

/**
 * Props del Card. Unión discriminada sobre `as` (`AGENTS.md` §5.4), el mismo
 * patrón del Button: `href` es obligatorio en `as="a"` y está prohibido en el
 * resto, en vez de ser un `string | undefined` que el componente tenga que
 * validar en runtime.
 */
export type CardProps = CardAsElementProps | CardAsAnchorProps | CardAsButtonProps;

/** Forma por defecto (`as="div"`), útil para tipar wrappers. */
export type CardDefaultProps = CardAsElementProps;

/** Props de la cabecera. */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Props del cuerpo. */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/** Props del pie. */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * Props del título.
 *
 * `as` existe aquí y no en el resto de las partes porque el nivel de
 * encabezado depende del documento que rodea al card, no del componente: un
 * `<h3>` fijo rompe el esquema de encabezados de la página en cuanto el card
 * vive dentro de una sección con otro nivel.
 */
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";
  children?: ReactNode;
}
