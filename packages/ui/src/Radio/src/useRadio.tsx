// useRadio.tsx
import { useMemo } from "react";
import { radio } from "@ownui/tw-theme/variants";
import type { RadioSize, RadioTheme } from "./Radio.types";

/**
 * Clases del control, memoizadas.
 *
 * El tamano se aplica en el `<label>` **y** en el circulo: las clases de
 * tamano definen `--radio-fontsize`, y el texto es hermano del circulo, no
 * hijo, asi que no heredaria el token.
 */
export function useRadioClasses({
  theme = "primary",
  size = "md",
  checked = false,
  invalid = false,
  disabled = false,
  className = "",
  boxClassName = "",
}: {
  theme?: RadioTheme;
  size?: RadioSize;
  checked?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
  boxClassName?: string;
}): { fieldClassNames: string; boxClassNames: string } {
  const sizeCls = radio.size[size] || "";

  const fieldClassNames = useMemo(
    () =>
      [radio.part.field, sizeCls, className]
        .filter((part) => part && part.length > 0)
        .join(" ")
        .trim(),
    [sizeCls, className]
  );

  const boxClassNames = useMemo(
    () =>
      [
        radio.part.box,
        radio.theme[theme] || "",
        sizeCls,
        checked ? radio.state.checked : "",
        invalid ? radio.state.invalid : "",
        disabled ? radio.state.disabled : "",
        boxClassName,
      ]
        .filter((part) => part && part.length > 0)
        .join(" ")
        .trim(),
    [theme, sizeCls, checked, invalid, disabled, boxClassName]
  );

  return { fieldClassNames, boxClassNames };
}

export default useRadioClasses;
