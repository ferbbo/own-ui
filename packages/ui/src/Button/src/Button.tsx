// Button.tsx
import React, { forwardRef } from "react";
import useButton from "./useButton";
import Loader from "@ownui/loader";
import { ButtonProps } from "./Button.types";

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const { children, loading } = props;

    const { classNames, buttonProps, Comp, domRef } = useButton(props, ref);

    return (
      <Comp ref={domRef} className={classNames} {...buttonProps}>
        {loading ? <Loader /> : <>{children}</>}
      </Comp>
    );
  }
);

export default React.memo(Button);
