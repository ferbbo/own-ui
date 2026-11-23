// Switch.tsx
import React, { forwardRef } from "react";
import { useSwitch as useAriaSwitch } from "@react-aria/switch";
import { useToggleState } from "@react-stately/toggle";
import { useDOMRef } from "@ownui/dom-utils";
import { switch as switchVariants } from "@ownui/tw-theme/variants";
import { useSwitchClasses } from "./useSwitch";
import type { SwitchProps } from "./Switch.types";

/**
 * Interruptor.
 *
 * Mismo esqueleto que el Checkbox —input nativo oculto visualmente dentro de
 * un `<label>`, mas un hermano que se pinta— pero `role="switch"` en vez de
 * `checkbox`, que es lo que hace que un lector de pantalla diga "activado" en
 * vez de "marcado". Lo pone `useAriaSwitch`.
 *
 * El pulgar se mueve con `translateX(var(--switch-travel))`, una distancia
 * que el CSS deriva del ancho y del tamano del pulgar: cambiar de tamano no
 * descuadra el recorrido.
 */
const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(props, ref) {
  const ariaProps = {
    isSelected: props.checked,
    defaultSelected: props.defaultChecked,
    onChange: props.onChange,
    isDisabled: props.disabled,
    isReadOnly: props.readOnly,
    isInvalid: props.invalid,
    value: props.value,
    name: props.name,
    children: props.children,
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"],
  };

  const state = useToggleState(ariaProps);
  const domRef = useDOMRef<HTMLInputElement>(ref);
  const { inputProps } = useAriaSwitch(ariaProps, state, domRef as never);

  const { fieldClassNames, boxClassNames } = useSwitchClasses({
    theme: props.theme,
    size: props.size,
    checked: state.isSelected,
    invalid: props.invalid,
    disabled: props.disabled,
    className: props.className,
    boxClassName: props.boxClassName,
  });

  return (
    <label className={fieldClassNames}>
      <input ref={domRef} {...inputProps} className={switchVariants.part.input} />
      <span className={boxClassNames} aria-hidden="true">
        <span className={switchVariants.part.thumb} />
      </span>
      {props.children ? <span className={switchVariants.part.label}>{props.children}</span> : null}
    </label>
  );
});

export default React.memo(Switch);
