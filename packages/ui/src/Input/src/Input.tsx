// Input.tsx
import React, { forwardRef } from "react";
import useInput from "./useInput";
import { input } from "@ownui/tw-theme/variants";
import { InputProps } from "./Input.types";

/**
 * Cáscara de render: toda la lógica (clases, `id`, ARIA, reparto de props)
 * vive en `useInput`.
 *
 * El orden del contenido es fijo y es parte del contrato:
 *
 *     <label>
 *     <div class="input">  [startIcon] <input class="input-control"> [endIcon]
 *     <p class="input-description">
 *     <p class="input-error-message">
 *
 * El `ref` apunta al `<input>` nativo, no al contenedor: es el nodo que el
 * consumidor necesita para enfocar, leer el valor o hacer `select()`.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const {
    fieldClassNames,
    boxClassNames,
    labelProps,
    controlProps,
    descriptionProps,
    errorMessageProps,
    domRef,
    label,
    description,
    errorMessage,
    startIcon,
    endIcon,
  } = useInput(props, ref);

  return (
    <div className={fieldClassNames}>
      {labelProps ? <label {...labelProps}>{label}</label> : null}

      <div className={boxClassNames}>
        {startIcon ? (
          <span className={input.part.icon} aria-hidden="true">
            {startIcon}
          </span>
        ) : null}

        <input ref={domRef} {...controlProps} />

        {endIcon ? (
          <span className={input.part.icon} aria-hidden="true">
            {endIcon}
          </span>
        ) : null}
      </div>

      {descriptionProps ? <p {...descriptionProps}>{description}</p> : null}
      {errorMessageProps ? <p {...errorMessageProps}>{errorMessage}</p> : null}
    </div>
  );
});

export default React.memo(Input);
