// useLoader.tsx
import { useMemo } from "react";
import { loader } from "@ownui/tw-theme/variants";
import { LoaderProps } from "./Loader.types";

export type ReactRef<T> = React.RefObject<T> | React.Ref<T>;

export function useLoader(
  props: LoaderProps,
): { classNames: string; loaderProps: any; Comp: string } {
  const { 
    as: rawAs, 
    color = "primary", 
    size = "md", 
    className = "", 
    "aria-label": ariaLabel = "Loading...",
    ...restProps 
  } = props;

  // Si rawAs es undefined, asumimos "div"
  const as = rawAs ?? "div";

  // Generar (y memoizar) cadena de clases CSS
  const classNames = useMemo(() => {
    const base = "loader";
    const colorCls = loader.color[color] || "";
    const sizeCls = loader.size[size] || "";
    
    return [base, colorCls, sizeCls, className]
      .filter(Boolean)
      .join(" ");
  }, [color, size, className]);

  // Props para el componente
  const loaderProps = {
    ...restProps,
    "aria-label": ariaLabel,
    role: "status",
    "aria-live": "polite"
  };

  return {
    classNames,
    loaderProps,
    Comp: as
  };
}

export default useLoader;
