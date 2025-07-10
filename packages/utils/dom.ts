import { Ref, RefObject, useImperativeHandle, useRef } from "react";

export const useDOMRef = <T extends HTMLElement>(ref: RefObject<T | null> | Ref<T | null>) => {
    const innerRef = useRef<T>(null);
    useImperativeHandle(ref, () => innerRef.current as T);
    return innerRef;
}