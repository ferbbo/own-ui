// Avatar.types.ts
import { HTMLAttributes, ReactNode } from "react";

/**
 * Roles semánticos del Avatar. Cada valor tiene entrada en `theme` de
 * `variants/avatar.ts` (lo verifica `pnpm check:contract`).
 *
 * El rol no rellena a plena intensidad: las iniciales son texto sobre el
 * relleno, así que el CSS usa un relleno lavado y un texto del rol mezclado
 * hacia `--color-base-content`. Ver la anatomía de `css/avatar.css`.
 */
export type AvatarTheme =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/** Forma de la caja. */
export type AvatarShape = "circle" | "square";

/** Tamaños del Avatar. */
export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

/** Props propias del Avatar (las que no son atributos del DOM). */
export interface AvatarBaseProps {
  /**
   * Imagen. Si falla la carga, el avatar cae a las iniciales y, si no hay,
   * al icono de reserva: una imagen rota deja un hueco, no un avatar.
   */
  src?: string;
  /**
   * Texto alternativo de la imagen. Si no se da, se usa `name`; la imagen de
   * un avatar que ya tiene nombre no necesita describirse dos veces.
   */
  alt?: string;
  /**
   * Nombre de la persona. Hace dos cosas: da el nombre accesible del avatar y
   * es de donde salen las iniciales si no hay imagen.
   */
  name?: string;
  /**
   * Iniciales explícitas, para cuando la derivación del nombre no sirve
   * (nombres compuestos, alias, un contador `+3`).
   */
  initials?: string;
  /** Rol semántico del relleno y del texto. */
  theme?: AvatarTheme;
  /** Forma de la caja. Por defecto, círculo. */
  shape?: AvatarShape;
  /** Tamaño. Dentro de un `Avatar.Group` se hereda el del grupo. */
  size?: AvatarSize;
  /** Clases CSS adicionales. */
  className?: string;
  /**
   * Contenido propio (un icono, una insignia). Gana sobre las iniciales y
   * sobre el icono de reserva, pero no sobre la imagen.
   */
  children?: ReactNode;
}

/**
 * Props del Avatar.
 *
 * No es polimórfico: sale siempre como `<span>`. Un avatar pulsable es un
 * avatar **dentro** de un botón o un enlace, no un avatar que *es* un botón;
 * así el consumidor decide el control y no hereda uno a medias.
 */
export type AvatarProps = AvatarBaseProps &
  Omit<HTMLAttributes<HTMLSpanElement>, keyof AvatarBaseProps>;

/** Props del grupo de avatares. */
export interface AvatarGroupProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children" | "className"> {
  /** Avatares del grupo. */
  children?: ReactNode;
  /** Clases CSS adicionales. */
  className?: string;
  /**
   * Máximo de avatares visibles. Los que sobran se resumen en un contador
   * `+N`. Sin `max` se pintan todos.
   */
  max?: number;
  /**
   * Total real de personas, cuando la lista que llega está paginada y los
   * `children` no son todos (p. ej. 50 miembros, 4 avatares cargados).
   */
  total?: number;
  /** Tamaño que heredan los avatares del grupo y el contador. */
  size?: AvatarSize;
  /** Forma que heredan los avatares del grupo y el contador. */
  shape?: AvatarShape;
  /** Rol del contador `+N`. */
  theme?: AvatarTheme;
}

/** Configuración que el grupo comparte con sus avatares. */
export interface AvatarGroupContextValue {
  size?: AvatarSize;
  shape?: AvatarShape;
}
