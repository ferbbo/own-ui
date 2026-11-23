// CheckboxGroup.tsx
import React, { forwardRef } from "react";
import { useCheckboxGroup } from "@react-aria/checkbox";
import { useCheckboxGroupState } from "@react-stately/checkbox";
import { checkbox } from "@ownui/tw-theme/variants";
import { CheckboxGroupContext } from "./CheckboxContext";
import type { CheckboxGroupProps } from "./Checkbox.types";

/**
 * Grupo de casillas.
 *
 * El grupo es quien lleva etiqueta, ayuda y error, no cada casilla: el nombre
 * accesible de una eleccion multiple es la pregunta, y un mensaje de error
 * por opcion no dice nada. `useCheckboxGroup` genera y enlaza los `id`.
 *
 * El estado es una lista de valores, asi que cada casilla necesita `value`.
 */
const CheckboxGroup = forwardRef<HTMLDivElement, CheckboxGroupProps>(
  function CheckboxGroup(props, ref) {
    const {
      label,
      description,
      errorMessage,
      invalid = false,
      theme,
      size = "md",
      className = "",
      children,
    } = props;

    /** El error solo existe si el grupo esta marcado como invalido. */
    const visibleError = invalid ? errorMessage : undefined;

    const state = useCheckboxGroupState({
      value: props.value,
      defaultValue: props.defaultValue,
      onChange: props.onChange,
      isDisabled: props.disabled,
      isReadOnly: props.readOnly,
      isInvalid: invalid,
      name: props.name,
    });

    const { groupProps, labelProps, descriptionProps, errorMessageProps } = useCheckboxGroup(
      {
        label: typeof label === "string" ? label : undefined,
        description,
        errorMessage: visibleError,
        isDisabled: props.disabled,
        isReadOnly: props.readOnly,
        isInvalid: invalid,
      },
      state
    );

    const classNames = [checkbox.part.group, checkbox.size[size] || "", className]
      .filter((part) => part && part.length > 0)
      .join(" ")
      .trim();

    return (
      <div ref={ref} {...groupProps} className={classNames}>
        {label ? (
          <span {...labelProps} className={checkbox.part.groupLabel}>
            {label}
          </span>
        ) : null}

        <div className={checkbox.part.groupItems}>
          <CheckboxGroupContext.Provider value={{ state, theme, size, invalid }}>
            {children}
          </CheckboxGroupContext.Provider>
        </div>

        {description ? (
          <p {...descriptionProps} className={checkbox.part.groupDescription}>
            {description}
          </p>
        ) : null}

        {visibleError ? (
          <p {...errorMessageProps} className={checkbox.part.groupErrorMessage}>
            {visibleError}
          </p>
        ) : null}
      </div>
    );
  }
);

export default React.memo(CheckboxGroup);
