// Button.tsx
import React, { forwardRef } from "react";
import useButton from "./useButton";
import { ButtonProps } from "./Button.types";

/**
 * Componente Button optimizado:
 * - `as` decide si renderiza <button> (por defecto) o <a>.
 * - Llama a useButton para obtener:
 *    • classNames: cadena con clases CSS (.btn, .btn-{variant}, .btn-{size}, etc.)
 *    • buttonProps: props accesibles (react-aria) + nativos fusionados
 * - Unifica la implementación de <button> y <a> en una constante `Comp`
 * - React.memo para prevenir renders innecesarios
 */
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    // Extraemos children y props.Asinerias, sin asignar default en destructuring
    const { children } = props;

    const { classNames, buttonProps, Comp } = useButton(props, ref);

    return (
      <Comp ref={ref} className={classNames} {...buttonProps}>
        {children}
      </Comp>
    );
  }
);

export default React.memo(Button);
