// useAvatar.tsx
import { ReactNode, useCallback, useMemo, useState } from "react";
import { avatar } from "@ownui/tw-theme/variants";
import { AvatarProps } from "./Avatar.types";
import { useAvatarGroupContext } from "./AvatarGroupContext";

/** Qué se pinta dentro de la caja. Los tres contenidos son excluyentes. */
export type AvatarContentKind = "image" | "children" | "initials" | "fallback";

export interface UseAvatarResult {
  classNames: string;
  avatarProps: Record<string, unknown>;
  /** Contenido resuelto tras aplicar la cascada imagen -> hijos -> iniciales -> reserva. */
  kind: AvatarContentKind;
  /** Props del `<img>`; `null` si no se pinta imagen. */
  imageProps: Record<string, unknown> | null;
  /** Iniciales ya derivadas; `""` si no se pintan. */
  initials: string;
  children: ReactNode;
}

/**
 * Deriva las iniciales de un nombre.
 *
 * Toma la primera letra de las dos primeras palabras. Con una sola palabra
 * devuelve **una** letra y no dos: "Ap" para "Apple" se lee como un nombre
 * cortado, mientras que "A" se lee como una inicial.
 */
export function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);

  return words
    .slice(0, 2)
    .map((word) => [...word][0] ?? "")
    .join("")
    .toUpperCase();
}

/**
 * Toda la lógica del Avatar: cascada de contenido, clases y accesibilidad.
 * Secuencia de `AGENTS.md` §5.2.
 *
 * **No pasa por `@react-aria/*` y es correcto**: el avatar no recibe foco ni
 * responde a teclado. Un avatar pulsable es un avatar *dentro* de un botón.
 * Lo que sí resuelve es su problema de accesibilidad real: una caja con una
 * imagen, unas letras o un icono que tiene que anunciarse como una cosa.
 */
export function useAvatar(props: AvatarProps): UseAvatarResult {
  // 1) Destructuring con defaults. Lo que quede en `restProps` va al DOM.
  const {
    src,
    alt,
    name,
    initials: explicitInitials,
    theme = "neutral",
    shape: shapeProp,
    size: sizeProp,
    className = "",
    children,
    ...restProps
  } = props;

  // El grupo aporta tamaño y forma; la prop del avatar siempre gana.
  const group = useAvatarGroupContext();
  const size = sizeProp ?? group?.size ?? "md";
  const shape = shapeProp ?? group?.shape ?? "circle";

  /**
   * 2) Imagen que ha fallado.
   *
   * Se guarda la **url** que falló, no un booleano: así cambiar `src` vuelve
   * a intentarlo sin necesidad de un `useEffect` que resetee el estado (y sin
   * el render intermedio con la imagen vieja que ese efecto provocaría).
   */
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const imageFailed = src !== undefined && failedSrc === src;

  const handleError = useCallback(() => {
    if (src !== undefined) setFailedSrc(src);
  }, [src]);

  // 3) Cascada de contenido.
  const initials = explicitInitials ?? (name ? initialsFromName(name) : "");

  let kind: AvatarContentKind;
  if (src !== undefined && !imageFailed) kind = "image";
  else if (children !== undefined && children !== null) kind = "children";
  else if (initials.length > 0) kind = "initials";
  else kind = "fallback";

  // 4) Clases memoizadas, leídas del contrato.
  const classNames = useMemo(() => {
    const themeCls = avatar.theme[theme] || "";
    const shapeCls = avatar.shape[shape] || "";
    const sizeCls = avatar.size[size] || "";

    return [avatar.part.root, themeCls, shapeCls, sizeCls, className]
      .filter((part) => part && part.length > 0)
      .join(" ")
      .trim();
  }, [theme, shape, size, className]);

  /**
   * 5) Accesibilidad.
   *
   * Con imagen, el nombre lo da el `alt` del `<img>` y la caja no debe añadir
   * otro: dos nombres anidados se anuncian dos veces. Sin imagen, la caja es
   * el único nodo con significado, así que necesita `role="img"` y nombre —y
   * si no hay nombre que dar (icono de reserva anónimo), se oculta en vez de
   * anunciar un nodo vacío. Mismo criterio que el punto del Badge.
   */
  const explicitLabel =
    (restProps["aria-label"] as string | undefined) ??
    (restProps["aria-labelledby"] as string | undefined);
  const accessibleName = (restProps["aria-label"] as string | undefined) ?? name;

  let a11yProps: Record<string, unknown>;
  if (kind === "image") {
    a11yProps = {};
  } else if (explicitLabel !== undefined || accessibleName !== undefined) {
    a11yProps = { role: "img", ...(accessibleName ? { "aria-label": accessibleName } : {}) };
  } else {
    a11yProps = { "aria-hidden": true };
  }

  const avatarProps: Record<string, unknown> = { ...a11yProps, ...restProps };

  const imageProps =
    kind === "image"
      ? {
          className: avatar.part.image,
          src,
          alt: alt ?? name ?? "",
          onError: handleError,
        }
      : null;

  return { classNames, avatarProps, kind, imageProps, initials, children };
}

export default useAvatar;
