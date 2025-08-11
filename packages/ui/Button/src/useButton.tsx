// useButton.ts
import { useMemo } from "react";
import { useButton as useAriaButton } from "@react-aria/button";
import { mergeProps } from "@react-aria/utils";
import { useDOMRef } from "@ownui/dom-utils";
import { button } from "@ownui/tw-theme/variants"
import {
  ButtonProps,
  ButtonAsButtonProps,
  ButtonAsAnchorProps,
} from "./Button.types";

export type ReactRef<T> = React.RefObject<T> | React.Ref<T>;

export function useButton(
  props: ButtonProps,
  ref: ReactRef<HTMLButtonElement | HTMLAnchorElement | null>
): { classNames: string; buttonProps: any, Comp: string } {
  // Extraemos sin default 'as'
  const { as: rawAs, theme= "primary", variant = "", size = "md", className = "", disabled = false, onClick, children, ...restProps } =
    props;
  // Si rawAs es undefined, asumimos "button"
  const as = rawAs ?? "button";

  // 1) Generar (y memoizar) cadena de clases CSS
  const classNames = useMemo(() => {
    // Construir la cadena de clases  
    const base = "btn";
    const themeCls = button[theme] || "";
    const variantCls = button[variant] || "";
    const sizeCls = button[size] || "";
    const disabledCls = disabled ? "opacity-50 cursor-not-allowed" : "";
    return [base, themeCls, variantCls, sizeCls, disabledCls, className]
      .filter((part) => part && part.length > 0)
      .join(" ")
      .trim();
  }, [theme, variant, size, disabled, className]);

  // 2) Determinar `type` (para <button>) o `href` (para <a>)
  let typeAttr: "button" | "submit" | "reset" | undefined;
  let hrefAttr: string | undefined;

  if (as === "button") {
    // Si el usuario pasó `type` en restProps, lo usamos; si no, "button"
    typeAttr = "type" in restProps ? (restProps.type as any) : "button";
  } else {
    // as === "a", props tiene href definido
    hrefAttr = (props as ButtonAsAnchorProps).href;
  }

  // 3) Construir opciones para React Aria
  const ariaOptions: any = {
    onPress: onClick,
    isDisabled: disabled,
    elementType: as,
    ...(as === "button" && { type: typeAttr }),
    ...(as === "a" && { href: hrefAttr }),
  };

const innerRef = useDOMRef(ref);


  // 4) Obtener props accesibles de react-aria
  const { buttonProps: ariaButtonProps } = useAriaButton(ariaOptions, innerRef);

  // 5) Combinar props de react-aria con atributos nativos según `as`
  let buttonProps: any;
  if (as === "button") {
    // Extraemos `type` y `disabled` de restProps para no duplicar
    const {
      type,
      disabled,
      ...buttonRest
    } = restProps as ButtonAsButtonProps;
    buttonProps = mergeProps(
      ariaButtonProps,
      { type: typeAttr, disabled },
      buttonRest
    );
  } else {
    // as === "a"
    const { href, type, ...anchorRest } =
      restProps as ButtonAsAnchorProps;
    buttonProps = mergeProps(
      ariaButtonProps,
      { href: hrefAttr },
      anchorRest
    );
  }
  // Component root
  const Comp = as || "button";
  return { Comp, classNames, buttonProps };
}

export default useButton;
