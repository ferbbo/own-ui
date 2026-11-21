// Loader.types.ts
import { ElementType } from "react";

// Tamaños disponibles basados en el diseño de Figma
export type LoaderSize = "2xs" | "xs" | "sm" | "md" | "lg";

// Colores disponibles basados en el sistema de colores semánticos.
// `current` no es un rol: hereda el `color` del contexto (`currentColor`), que
// es lo que necesita un spinner dentro de un botón para contrastar con su
// relleno sin duplicar el mapa rol -> color.
export type LoaderColor =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error"
  | "current";

// Props base del Loader
export interface LoaderBaseProps {
  /** Tamaño del loader */
  size?: LoaderSize;
  /** Color del loader */
  color?: LoaderColor;
  /** Clases CSS adicionales */
  className?: string;
  /** Texto para accesibilidad */
  "aria-label"?: string;
  /** ID del elemento */
  id?: string;
}

// Props polimórficas para diferentes elementos
export interface LoaderPolymorphicProps<T extends ElementType = "div"> {
  /** Elemento a renderizar */
  as?: T;
}

// Props combinadas con atributos HTML
export type LoaderProps<T extends ElementType = "div"> = LoaderBaseProps &
  LoaderPolymorphicProps<T> &
  Omit<React.ComponentPropsWithoutRef<T>, keyof LoaderBaseProps>;

// Export por defecto con elemento div
export type LoaderDefaultProps = LoaderProps<"div">;
