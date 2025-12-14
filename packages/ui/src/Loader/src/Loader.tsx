// Loader.tsx
import React, { forwardRef } from "react";
import useLoader from "./useLoader";
import { LoaderProps } from "./Loader.types";

const Loader = forwardRef<HTMLDivElement, LoaderProps>(
  function Loader(props, ref) {
    const { classNames, loaderProps, Comp } = useLoader(props);

    return (
      <Comp ref={ref} className={classNames} {...loaderProps}>
        <div className="loader-spinner" />
      </Comp>
    );
  }
);

export default React.memo(Loader);
