// useSwitch.tsx
import { useMemo } from "react";
import { switch as switchVariants } from "@ownui/tw-theme/variants";
import type { SwitchSize, SwitchTheme } from "./Switch.types";

/**
 * Clases del control, memoizadas.
 *
 * El contrato se importa con alias porque `switch` es palabra reservada: se
 * puede exportar con ese nombre, pero no se puede usar como binding en un
 * `import`. (El generador aprendio a hacerlo en este mismo lote.)
 *
 * El tamano se aplica en el `<label>` **y** en la pista: las clases de tamano
 * definen `--switch-fontsize`, y el texto es hermano de la pista, no hijo.
 */
export function useSwitchClasses({
  theme = "primary",
  size = "md",
  checked = false,
  invalid = false,
  disabled = false,
  className = "",
  boxClassName = "",
}: {
  theme?: SwitchTheme;
  size?: SwitchSize;
  checked?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  boxClassName?: string;
}): { fieldClassNames: string; boxClassNames: string } {
  const sizeCls = switchVariants.size[size] || "";

  const fieldClassNames = useMemo(
    () =>
      [switchVariants.part.field, sizeCls, className]
        .filter((part) => part && part.length > 0)
        .join(" ")
        .trim(),
    [sizeCls, className]
  );

  const boxClassNames = useMemo(
    () =>
      [
        switchVariants.part.box,
        switchVariants.theme[theme] || "",
        sizeCls,
        checked ? switchVariants.state.checked : "",
        invalid ? switchVariants.state.invalid : "",
        disabled ? switchVariants.state.disabled : "",
        boxClassName,
      ]
        .filter((part) => part && part.length > 0)
        .join(" ")
        .trim(),
    [theme, sizeCls, checked, invalid, disabled, boxClassName]
  );

  return { fieldClassNames, boxClassNames };
}

export default useSwitchClasses;
