// RadioGroup.tsx
import React, { forwardRef } from "react";
import { useRadioGroup } from "@react-aria/radio";
import { useRadioGroupState } from "@react-stately/radio";
import { radio } from "@ownui/tw-theme/variants";
import { RadioGroupContext } from "./RadioContext";
import type { RadioGroupProps } from "./Radio.types";

/**
 * Grupo de radio: el componente de verdad del par.
 *
 * Guarda el valor elegido, genera y enlaza los `id` de etiqueta, ayuda y
 * error, y expone el `role="radiogroup"` que hace que un lector de pantalla
 * anuncie "opcion 2 de 5".
 */
const RadioGroup = forwardRef<HTMLDivElement, RadioGroupProps>(function RadioGroup(props, ref) {
  const {
    label,
    description,
    errorMessage,
    invalid = false,
    orientation = "vertical",
    theme,
    size = "md",
    className = "",
    children,
  } = props;

  /** El error solo existe si el grupo esta marcado como invalido. */
  const visibleError = invalid ? errorMessage : undefined;

  const ariaProps = {
    label: typeof label === "string" ? label : undefined,
    description,
    errorMessage: visibleError,
    value: props.value,
    defaultValue: props.defaultValue,
    onChange: props.onChange,
    name: props.name,
    isDisabled: props.disabled,
    isReadOnly: props.readOnly,
    isRequired: props.required,
    isInvalid: invalid,
    orientation,
  };

  const state = useRadioGroupState(ariaProps);
  const { radioGroupProps, labelProps, descriptionProps, errorMessageProps } = useRadioGroup(
    ariaProps,
    state
  );

  const classNames = [radio.part.group, radio.size[size] || "", className]
    .filter((part) => part && part.length > 0)
    .join(" ")
    .trim();

  const itemsStyle =
    orientation === "horizontal"
      ? { flexDirection: "row" as const, flexWrap: "wrap" as const }
      : undefined;

  return (
    <div ref={ref} {...radioGroupProps} className={classNames}>
      {label ? (
        <span {...labelProps} className={radio.part.groupLabel}>
          {label}
        </span>
      ) : null}

      <div className={radio.part.groupItems} style={itemsStyle}>
        <RadioGroupContext.Provider value={{ state, theme, size, invalid }}>
          {children}
        </RadioGroupContext.Provider>
      </div>

      {description ? (
        <p {...descriptionProps} className={radio.part.groupDescription}>
          {description}
        </p>
      ) : null}

      {visibleError ? (
        <p {...errorMessageProps} className={radio.part.groupErrorMessage}>
          {visibleError}
        </p>
      ) : null}
    </div>
  );
});

export default React.memo(RadioGroup);
