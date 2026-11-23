// Checkbox.tsx
import React, { forwardRef, useMemo } from "react";
import { useCheckbox as useAriaCheckbox, useCheckboxGroupItem } from "@react-aria/checkbox";
import { useToggleState } from "@react-stately/toggle";
import { useDOMRef } from "@ownui/dom-utils";
import { checkbox } from "@ownui/tw-theme/variants";
import { useCheckboxClasses } from "./useCheckbox";
import { useCheckboxGroupContext, type CheckboxGroupContextValue } from "./CheckboxContext";
import type { CheckboxProps } from "./Checkbox.types";

/** Trazo de la casilla: check cuando esta marcada, guion cuando es parcial. */
function CheckboxMark({ indeterminate }: { indeterminate: boolean }) {
  return (
    <svg className={checkbox.part.mark} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      {indeterminate ? <path d="M4 8h8" /> : <path d="m3.5 8.5 3 3 6-6.5" />}
    </svg>
  );
}

/** Lo que se pinta, una vez resuelto de donde sale el estado. */
function CheckboxView({
  inputProps,
  domRef,
  fieldClassNames,
  boxClassNames,
  indeterminate,
  children,
}: {
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  domRef: React.RefObject<HTMLInputElement | null>;
  fieldClassNames: string;
  boxClassNames: string;
  indeterminate: boolean;
  children?: React.ReactNode;
}) {
  return (
    <label className={fieldClassNames}>
      <input ref={domRef} {...inputProps} className={checkbox.part.input} />
      <span className={boxClassNames} aria-hidden="true">
        <CheckboxMark indeterminate={indeterminate} />
      </span>
      {children ? <span className={checkbox.part.label}>{children}</span> : null}
    </label>
  );
}

/** Traduce las props publicas a las que espera React Aria. */
function toAriaProps(props: CheckboxProps) {
  const {
    checked,
    defaultChecked,
    indeterminate,
    onChange,
    disabled,
    readOnly,
    invalid,
    value,
    name,
    children,
  } = props;

  return {
    isSelected: checked,
    defaultSelected: defaultChecked,
    isIndeterminate: indeterminate,
    onChange,
    isDisabled: disabled,
    isReadOnly: readOnly,
    isInvalid: invalid,
    value: value as string,
    name,
    children,
    "aria-label": props["aria-label"],
    "aria-labelledby": props["aria-labelledby"],
  };
}

/**
 * Casilla suelta: el estado vive aqui.
 */
const StandaloneCheckbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function StandaloneCheckbox(props, ref) {
    const ariaProps = toAriaProps(props);
    const state = useToggleState(ariaProps);
    const domRef = useDOMRef<HTMLInputElement>(ref);
    const { inputProps } = useAriaCheckbox(ariaProps, state, domRef as never);

    const { fieldClassNames, boxClassNames } = useCheckboxClasses({
      theme: props.theme,
      size: props.size,
      checked: state.isSelected,
      indeterminate: props.indeterminate,
      invalid: props.invalid,
      disabled: props.disabled,
      className: props.className,
      boxClassName: props.boxClassName,
    });

    return (
      <CheckboxView
        inputProps={inputProps}
        domRef={domRef}
        fieldClassNames={fieldClassNames}
        boxClassNames={boxClassNames}
        indeterminate={Boolean(props.indeterminate)}
      >
        {props.children}
      </CheckboxView>
    );
  }
);

/**
 * Casilla dentro de un grupo: el estado vive en el grupo y aqui solo se lee.
 *
 * Rol y tamano salen del contexto salvo que la casilla los pise: un grupo
 * con casillas de tamanos distintos no es una decision de diseno, es un
 * descuido.
 */
const GroupedCheckbox = forwardRef<
  HTMLInputElement,
  CheckboxProps & { group: CheckboxGroupContextValue }
>(function GroupedCheckbox({ group, ...props }, ref) {
  const ariaProps = toAriaProps(props);
  const domRef = useDOMRef<HTMLInputElement>(ref);
  const { inputProps } = useCheckboxGroupItem(
    { ...ariaProps, value: props.value as string },
    group.state,
    domRef as never
  );

  const checked = useMemo(
    () => group.state.isSelected(props.value as string),
    [group.state, props.value]
  );

  const { fieldClassNames, boxClassNames } = useCheckboxClasses({
    theme: props.theme ?? group.theme,
    size: props.size ?? group.size,
    checked,
    indeterminate: props.indeterminate,
    invalid: props.invalid ?? group.invalid,
    disabled: props.disabled || group.state.isDisabled,
    className: props.className,
    boxClassName: props.boxClassName,
  });

  return (
    <CheckboxView
      inputProps={inputProps}
      domRef={domRef}
      fieldClassNames={fieldClassNames}
      boxClassNames={boxClassNames}
      indeterminate={Boolean(props.indeterminate)}
    >
      {props.children}
    </CheckboxView>
  );
});

/**
 * Casilla de verificacion.
 *
 * La rama entre suelta y agrupada se hace **eligiendo componente**, no
 * llamando a un hook dentro de un `if`: `useCheckbox` y `useCheckboxGroupItem`
 * son hooks distintos y las reglas de hooks no permiten alternarlos. Una
 * casilla no entra ni sale de un grupo durante su vida, asi que la rama es
 * estable y no provoca remontajes.
 */
const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(props, ref) {
  const group = useCheckboxGroupContext();

  return group ? (
    <GroupedCheckbox {...props} group={group} ref={ref} />
  ) : (
    <StandaloneCheckbox {...props} ref={ref} />
  );
});

export default React.memo(Checkbox);
