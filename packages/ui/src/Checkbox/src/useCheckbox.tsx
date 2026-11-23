// useCheckbox.tsx
import { useMemo } from "react";
import { checkbox } from "@ownui/tw-theme/variants";
import type { CheckboxSize, CheckboxTheme } from "./Checkbox.types";

/**
 * Clases del control, memoizadas.
 *
 * Se separa del cableado de React Aria a proposito: la casilla suelta y la
 * del grupo usan hooks distintos (`useCheckbox` vs `useCheckboxGroupItem`),
 * pero pintan exactamente igual, asi que el calculo de clases es lo unico
 * que comparten de verdad.
 *
 * El tamano se aplica en el `<label>` **y** en la caja, igual que en el
 * Input: las clases de tamano definen `--checkbox-fontsize`, y el texto es
 * hermano de la caja, no hijo, asi que no heredaria el token.
 */
export function useCheckboxClasses({
  theme = "primary",
  size = "md",
  checked = false,
  indeterminate = false,
  invalid = false,
  disabled = false,
  className = "",
  boxClassName = "",
}: {
  theme?: CheckboxTheme;
  size?: CheckboxSize;
  checked?: boolean;
  indeterminate?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  boxClassName?: string;
}): { fieldClassNames: string; boxClassNames: string } {
  const sizeCls = checkbox.size[size] || "";

  const fieldClassNames = useMemo(
    () =>
      [checkbox.part.field, sizeCls, className]
        .filter((part) => part && part.length > 0)
        .join(" ")
        .trim(),
    [sizeCls, className]
  );

  const boxClassNames = useMemo(() => {
    // `indeterminate` gana a `checked`: son excluyentes en pantalla y React
    // Aria deja los dos a true mientras el tercer estado esta activo.
    const stateCls = indeterminate
      ? checkbox.state.indeterminate
      : checked
        ? checkbox.state.checked
        : "";

    return [
      checkbox.part.box,
      checkbox.theme[theme] || "",
      sizeCls,
      stateCls,
      invalid ? checkbox.state.invalid : "",
      disabled ? checkbox.state.disabled : "",
      boxClassName,
    ]
      .filter((part) => part && part.length > 0)
      .join(" ")
      .trim();
  }, [theme, sizeCls, checked, indeterminate, invalid, disabled, boxClassName]);

  return { fieldClassNames, boxClassNames };
}

export default useCheckboxClasses;
