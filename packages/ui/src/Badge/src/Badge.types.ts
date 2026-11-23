// Badge.types.ts
import { HTMLAttributes, ReactNode } from "react";

/**
 * Roles semánticos del Badge. Cada valor tiene entrada en `theme` de
 * `variants/badge.ts` (lo verifica `pnpm check:contract`).
 *
 * Al contrario que el Card y el Input, el Badge **sí rellena con el rol**: su
 * contenido es sólo texto corto, así que el par rol / `-content` del tema es
 * exactamente lo que necesita.
 */
export type BadgeTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/**
 * Tratamiento del relleno. Omitirlo es el relleno sólido del rol.
 *
 * Los dos tratamientos pintan texto de color de rol sobre una superficie del
 * tema, así que el CSS usa `--badge-role-fg` (el rol mezclado hacia
 * `--color-base-content`) y no el token `-content`.
 */
export type BadgeVariant = "outline" | "soft";

/** Tamaños del Badge. */
export type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Props propias del Badge (las que no son atributos del DOM). */
export interface BadgeBaseProps {
  /** Rol semántico. */
  theme?: BadgeTheme;
  /** Tratamiento del relleno. */
  variant?: BadgeVariant;
  /** Tamaño. */
  size?: BadgeSize;
  /**
   * Punto de estado: badge cuadrado y sin contenido, para poner al lado de un
   * texto. Un punto sin `aria-label` es decorativo y se oculta al lector de
   * pantalla: el significado lo lleva el texto que acompaña.
   */
  dot?: boolean;
  /** Clases CSS adicionales. */
  className?: string;
  /** Contenido: texto corto. Se ignora con `dot`. */
  children?: ReactNode;
}

/**
 * Props del Badge.
 *
 * **No es polimórfico a propósito.** Un badge es una etiqueta de texto y
 * siempre sale como `<span>`: `as="a"` o `as="button"` serían un *chip*
 * accionable, que es otro componente (otro CSS, otro foco, otro teclado) y no
 * un badge con otra etiqueta. Mezclarlos aquí daría el mismo problema que el
 * `clickable` del Card resuelve en el lado contrario.
 */
export type BadgeProps = BadgeBaseProps &
  Omit<HTMLAttributes<HTMLSpanElement>, keyof BadgeBaseProps>;
