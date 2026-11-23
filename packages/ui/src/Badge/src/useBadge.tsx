// useBadge.tsx
import { ReactNode, useMemo } from "react";
import { badge } from "@ownui/tw-theme/variants";
import { BadgeProps } from "./Badge.types";

export interface UseBadgeResult {
  classNames: string;
  badgeProps: Record<string, unknown>;
  /** Contenido a pintar: `null` en un punto de estado. */
  content: ReactNode;
}

/**
 * Toda la lógica del Badge: clases y atributos. Secuencia de `AGENTS.md` §5.2.
 *
 * **No pasa por `@react-aria/*` y es correcto**: el badge no recibe foco, no
 * responde a teclado y no tiene estado. Lo que sí resuelve es su único
 * problema de accesibilidad real: un punto de estado sin texto.
 */
export function useBadge(props: BadgeProps): UseBadgeResult {
  // 1) Destructuring con defaults. Toda prop de configuración sale aquí: lo
  //    que quede en `restProps` va al DOM tal cual.
  const {
    theme = "neutral",
    variant,
    size = "md",
    dot = false,
    className = "",
    children,
    ...restProps
  } = props;

  // 2) Clases memoizadas, leídas del contrato y nunca escritas a mano.
  const classNames = useMemo(() => {
    const themeCls = badge.theme[theme] || "";
    const variantCls = variant ? badge.variant[variant] || "" : "";
    const sizeCls = badge.size[size] || "";
    const dotCls = dot ? badge.state.dot : "";

    return [badge.part.root, themeCls, variantCls, sizeCls, dotCls, className]
      .filter((part) => part && part.length > 0)
      .join(" ")
      .trim();
  }, [theme, variant, size, dot, className]);

  /**
   * 3) Accesibilidad del punto de estado.
   *
   * Un `<span>` vacío no tiene nombre accesible: sin esto, un punto de estado
   * es un nodo que el lector de pantalla anuncia como nada o se salta a
   * medias. Hay dos casos legítimos y se distinguen por si el consumidor da
   * nombre:
   *
   *   - con `aria-label` / `aria-labelledby` → el punto **es** la información
   *     ("en línea"), así que necesita un rol que lo haga anunciable.
   *   - sin nombre → el punto es decorativo y el significado está en el texto
   *     de al lado, así que se oculta en vez de ensuciar la lectura.
   */
  const hasAccessibleName =
    restProps["aria-label"] !== undefined || restProps["aria-labelledby"] !== undefined;

  const dotProps = dot ? (hasAccessibleName ? { role: "img" } : { "aria-hidden": true }) : {};

  const badgeProps: Record<string, unknown> = { ...dotProps, ...restProps };

  return { classNames, badgeProps, content: dot ? null : children };
}

export default useBadge;
