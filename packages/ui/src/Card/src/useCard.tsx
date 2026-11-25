// useCard.tsx
import { ElementType, useMemo } from "react";
import { card } from "@ownui/tw-theme/variants";
import { CardAsElementProps, CardProps } from "./Card.types";

/**
 * Elementos nativamente accionables. Son los únicos que reciben
 * `.card-clickable`: ver el comentario de `clickable` más abajo.
 */
const INTERACTIVE_ELEMENTS = ["a", "button"];

export interface UseCardResult {
  classNames: string;
  cardProps: Record<string, unknown>;
  Comp: ElementType;
  /** `true` si el card se pinta como accionable (hover, elevación, puntero). */
  clickable: boolean;
}

/**
 * Toda la lógica del Card: clases, elemento y atributos. El componente queda
 * como cáscara de render (`AGENTS.md` §5.2).
 *
 * Las clases se leen del contrato (`@ownui/tw-theme/variants`) y nunca se
 * escriben a mano, para que `pnpm check:contract` pueda cruzarlas con el CSS.
 *
 * **No pasa por `@react-aria/*` y es correcto**: un card es una superficie de
 * agrupación, no un control. Lo que sí hace es no permitir que *parezca* un
 * control sin serlo — ver `clickable`.
 */
export function useCard(props: CardProps): UseCardResult {
  // 1) Destructuring con defaults. Toda prop de configuración sale aquí: lo
  //    que quede en `restProps` va al DOM tal cual.
  const {
    as: rawAs,
    theme = "neutral",
    variant,
    size = "md",
    className = "",
    children: _children,
    ...restProps
  } = props as CardAsElementProps & { as?: string };

  const as = (rawAs ?? "div") as ElementType;

  /**
   * El tratamiento de accionable **se deriva del elemento, no se pide por
   * prop**. `AGENTS.md` §8.5 prohíbe fabricar interacción sobre un `<div>`:
   * un card con `cursor: pointer` y hover que no es enfocable ni responde a
   * `Enter` es exactamente ese antipatrón. Quien quiera un card pulsable usa
   * `as="button"` (o `as="a"` con `href`), y entonces el teclado, el foco y
   * el rol los da el elemento nativo, gratis y bien.
   */
  const clickable = typeof as === "string" && INTERACTIVE_ELEMENTS.includes(as);

  // 2) Clases memoizadas.
  const classNames = useMemo(() => {
    const themeCls = card.theme[theme] || "";
    const variantCls = variant ? card.variant[variant] || "" : "";
    const sizeCls = card.size[size] || "";
    const clickableCls = clickable ? card.state.clickable : "";

    return [card.part.root, themeCls, variantCls, sizeCls, clickableCls, className]
      .filter((part) => part && part.length > 0)
      .join(" ")
      .trim();
  }, [theme, variant, size, clickable, className]);

  // 3) Atributos según el elemento. Un `<button>` sin `type` envía el
  //    formulario que lo contiene, que no es lo que un card accionable hace.
  const cardProps: Record<string, unknown> = {
    ...(as === "button" ? { type: "button" } : {}),
    ...restProps,
  };

  return { classNames, cardProps, Comp: as, clickable };
}

export default useCard;
