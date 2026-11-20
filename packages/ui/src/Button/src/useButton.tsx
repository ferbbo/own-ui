// useButton.tsx
import { ReactNode, useMemo } from "react";
import { useButton as useAriaButton } from "@react-aria/button";
import { mergeProps } from "@react-aria/utils";
import { useDOMRef } from "@ownui/dom-utils";
import { button } from "@ownui/tw-theme/variants";
import type { LoaderColor, LoaderSize } from "@ownui/loader";
import { ButtonProps, ButtonAsButtonProps, ButtonAsAnchorProps, ButtonSize } from "./Button.types";

export type ReactRef<T> = React.RefObject<T> | React.Ref<T>;

/**
 * Tamaño del spinner para cada tamaño de botón.
 *
 * El botón mide `--size-field * {6,8,10,12,14}` y el spinner tiene su propia
 * escala, así que el mapa es explícito: un `loader-md` (24px) dentro de un
 * `btn-xs` (24px de alto) no cabe.
 */
const LOADER_SIZE_BY_BUTTON_SIZE: Record<ButtonSize, LoaderSize> = {
  xs: "2xs",
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
};

/**
 * El spinner del botón nunca usa un rol semántico: hereda el `color` del
 * botón, que es `--btn-fg` (el token `-content` del rol). Con un rol fijo,
 * un spinner `primary` dentro de un `btn-primary` era azul sobre azul.
 */
const LOADER_COLOR: LoaderColor = "current";

export function useButton(
  props: ButtonProps,
  ref: ReactRef<HTMLButtonElement | HTMLAnchorElement | null>
): {
  classNames: string;
  buttonProps: any;
  Comp: string;
  domRef: React.RefObject<HTMLButtonElement | HTMLAnchorElement | null>;
  loaderProps: { size: LoaderSize; color: LoaderColor } | null;
  startIcon: ReactNode;
  endIcon: ReactNode;
  content: ReactNode;
} {
  // 1) Destructuring con defaults.
  //    TODA prop de configuración sale aquí: lo que quede en `restProps` va
  //    al DOM tal cual, así que dejar una dentro sería una fuga (React avisa
  //    con `Received \`true\` for a non-boolean attribute`).
  const {
    as: rawAs,
    theme = "primary",
    variant,
    size = "md",
    shape,
    width,
    active = false,
    className = "",
    disabled = false,
    loading = false,
    icon,
    startIcon,
    endIcon,
    onClick,
    children,
    ...restProps
  } = props as ButtonProps & {
    icon?: ReactNode;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
  };

  // Si rawAs es undefined, asumimos "button"
  const as = rawAs ?? "button";

  /** Un botón icon-only no lleva texto: `icon` es todo su contenido. */
  const isIconOnly = icon !== undefined && icon !== null;

  // 2) Generar (y memoizar) la cadena de clases.
  const classNames = useMemo(() => {
    const base = "btn";
    const themeCls = button.theme[theme] || "";
    // Se resuelve en el mapa de tratamientos. El bug original (AGENTS.md
    // §9.4) consultaba el mapa de roles con una clave de tratamiento, así que
    // `dash` y `soft` se perdían y `outline` sólo funcionaba por coincidencia
    // de nombre entre los dos mapas.
    const variantCls = variant ? button.variant[variant] || "" : "";
    const sizeCls = button.size[size] || "";
    // Un botón icon-only es cuadrado salvo que se pida otra forma.
    const shapeKey = shape ?? (isIconOnly ? "square" : undefined);
    const shapeCls = shapeKey ? button.shape[shapeKey] || "" : "";
    const widthCls = width ? button.width[width] || "" : "";
    const activeCls = active ? button.state.active : "";
    // `btn-disabled` en vez de utilidades de Tailwind (`opacity-50`): el CSS
    // del plugin ya define el estado y las utilidades sólo existirían si el
    // consumidor escaneara nuestro bundle, que no lo hace.
    const disabledCls = disabled ? button.state.disabled : "";

    return [
      base,
      themeCls,
      variantCls,
      sizeCls,
      shapeCls,
      widthCls,
      activeCls,
      disabledCls,
      className,
    ]
      .filter((part) => part && part.length > 0)
      .join(" ")
      .trim();
  }, [theme, variant, size, shape, width, active, disabled, className, isIconOnly]);

  // 3) Determinar `type` (para <button>) o `href` (para <a>)
  let typeAttr: "button" | "submit" | "reset" | undefined;
  let hrefAttr: string | undefined;

  if (as === "button") {
    // Si el usuario pasó `type` en restProps, lo usamos; si no, "button"
    typeAttr = "type" in restProps ? (restProps.type as any) : "button";
  } else {
    // as === "a", props tiene href definido
    hrefAttr = (props as ButtonAsAnchorProps).href;
  }

  // 4) Construir opciones para React Aria.
  //    `loading` bloquea la interacción igual que `disabled`: React Aria no
  //    engancha `onPress` cuando `isDisabled`, así que el click no dispara
  //    nada mientras carga.
  const ariaOptions: any = {
    onPress: onClick,
    isDisabled: disabled || loading,
    elementType: as,
    ...(as === "button" && { type: typeAttr }),
    ...(as === "a" && { href: hrefAttr }),
  };

  const innerRef = useDOMRef(ref);

  const { buttonProps: ariaButtonProps } = useAriaButton(ariaOptions, innerRef);

  // 5) Combinar props de react-aria con atributos nativos según `as`
  let buttonProps: any;
  if (as === "button") {
    // Extraemos `type` y `disabled` de restProps para no duplicar
    const { type: _type, disabled: _disabled, ...buttonRest } = restProps as ButtonAsButtonProps;
    buttonProps = mergeProps(ariaButtonProps, { type: typeAttr, disabled }, buttonRest);
  } else {
    // as === "a"
    const {
      href: _href,
      type: _type,
      ...anchorRest
    } = restProps as ButtonAsAnchorProps & { type?: string };
    buttonProps = mergeProps(ariaButtonProps, { href: hrefAttr }, anchorRest);
    // React Aria fuerza `role="button"` sobre cualquier elementType que no
    // sea <button>. En un ancla con href eso tapa el rol nativo `link` y el
    // lector de pantalla deja de anunciar que navega (gap G-02 del lote 2).
    // El resto de props de React Aria (teclado, foco) se conserva.
    if (hrefAttr && buttonProps.role === "button") {
      delete buttonProps.role;
    }
  }

  // `aria-busy` es lo que anuncia la carga; el `role="status"` del Loader da
  // el mensaje, pero sin `aria-busy` el control no se declara ocupado.
  if (loading) {
    buttonProps["aria-busy"] = true;
  }

  const loaderProps = loading
    ? { size: LOADER_SIZE_BY_BUTTON_SIZE[size], color: LOADER_COLOR }
    : null;

  // Component root
  const Comp = as || "button";
  // `innerRef` es el ref que debe llegar al DOM: `useDOMRef` refleja su nodo en el
  // ref externo con `useImperativeHandle`. Si el componente montara el ref externo
  // directamente, `innerRef` quedaria vacio y el handle lo sobrescribiria con null.
  return {
    Comp,
    classNames,
    buttonProps,
    domRef: innerRef,
    loaderProps,
    startIcon: isIconOnly ? undefined : startIcon,
    endIcon: isIconOnly ? undefined : endIcon,
    content: isIconOnly ? icon : children,
  };
}

export default useButton;
