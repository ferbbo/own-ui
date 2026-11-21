// Button.tsx
import React, { forwardRef } from "react";
import useButton from "./useButton";
import Loader from "@ownui/loader";
import { ButtonProps } from "./Button.types";

/**
 * Cáscara de render: toda la lógica (clases, aria, iconos, spinner) vive en
 * `useButton`. El orden del contenido es fijo y es parte del contrato:
 *
 *     [spinner] [startIcon] [children | icon] [endIcon]
 *
 * El spinner **no sustituye** al contenido (era el bug de `AGENTS.md` §9.5):
 * un botón que cambia su label por un spinner pierde el texto que explicaba
 * qué está pasando, y el `gap` de `.btn` ya separa los dos.
 */
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const { classNames, buttonProps, Comp, domRef, loaderProps, startIcon, endIcon, content } =
      useButton(props, ref);

    return (
      <Comp ref={domRef} className={classNames} {...buttonProps}>
        {loaderProps ? <Loader size={loaderProps.size} color={loaderProps.color} /> : null}
        {startIcon}
        {content}
        {endIcon}
      </Comp>
    );
  }
);

export default React.memo(Button);
