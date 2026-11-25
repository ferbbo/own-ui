// Radio.tsx
import React, { forwardRef } from "react";
import { useRadio as useAriaRadio } from "@react-aria/radio";
import { useDOMRef } from "@ownui/dom-utils";
import { radio } from "@ownui/tw-theme/variants";
import { useRadioClasses } from "./useRadio";
import { useRadioGroupContext } from "./RadioContext";
import type { RadioProps } from "./Radio.types";

/**
 * Una opcion de un grupo de radio.
 *
 * No tiene estado propio: lo lee del grupo. Y no tiene variante "suelta",
 * porque un radio fuera de un grupo no es un control, es un boton que no se
 * puede desmarcar — `useRadioGroupContext` lanza si falta el provider.
 *
 * El recorrido con flechas y el tabindex rotatorio los pone React Aria: el
 * grupo entero es una sola parada de tabulacion y dentro se navega con las
 * flechas, que es lo que espera un lector de pantalla de un `radiogroup`.
 */
const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(props, ref) {
  const group = useRadioGroupContext();
  const domRef = useDOMRef<HTMLInputElement>(ref);

  const { inputProps, isSelected, isDisabled } = useAriaRadio(
    {
      value: props.value,
      children: props.children,
      isDisabled: props.disabled,
      "aria-label": props["aria-label"],
      "aria-labelledby": props["aria-labelledby"],
    },
    group.state,
    domRef as never
  );

  const { fieldClassNames, boxClassNames } = useRadioClasses({
    theme: props.theme ?? group.theme,
    size: props.size ?? group.size,
    checked: isSelected,
    invalid: group.invalid,
    disabled: isDisabled,
    className: props.className,
    boxClassName: props.boxClassName,
  });

  return (
    <label className={fieldClassNames}>
      <input ref={domRef} {...inputProps} className={radio.part.input} />
      <span className={boxClassNames} aria-hidden="true">
        <span className={radio.part.mark} />
      </span>
      {props.children ? <span className={radio.part.label}>{props.children}</span> : null}
    </label>
  );
});

export default React.memo(Radio);
