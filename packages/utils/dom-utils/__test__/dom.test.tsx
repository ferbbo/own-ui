// dom.test.tsx
import React, { forwardRef, useImperativeHandle } from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useDOMRef } from "../src/dom";

/**
 * Componente de prueba con el mismo patrón que usan Button y Dropdown:
 * el ref del consumidor entra en `useDOMRef` y el ref interno devuelto es el
 * que se monta en el DOM.
 */
const Probe = forwardRef<HTMLDivElement, { children?: React.ReactNode }>(function Probe(
  { children },
  ref
) {
  const domRef = useDOMRef<HTMLDivElement>(ref);

  return (
    <div ref={domRef} data-testid="probe">
      {children}
    </div>
  );
});

describe("useDOMRef", () => {
  test("expone el nodo del DOM en un RefObject del consumidor", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Probe ref={ref}>contenido</Probe>);

    expect(ref.current).toBe(screen.getByTestId("probe"));
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  test("soporta un ref callback", () => {
    const received: Array<HTMLDivElement | null> = [];
    render(<Probe ref={(node) => received.push(node)}>contenido</Probe>);

    expect(received[0]).toBe(screen.getByTestId("probe"));
  });

  test("no falla cuando el consumidor no pasa ref (null)", () => {
    expect(() => render(<Probe ref={null}>contenido</Probe>)).not.toThrow();
    expect(screen.getByTestId("probe")).toBeInTheDocument();
  });

  test("devuelve siempre el mismo RefObject entre renders", () => {
    const seen: Array<React.RefObject<HTMLDivElement | null>> = [];

    const Tracker = forwardRef<HTMLDivElement>(function Tracker(_props, ref) {
      const domRef = useDOMRef<HTMLDivElement>(ref);
      seen.push(domRef);
      return <div ref={domRef} data-testid="tracker" />;
    });

    const { rerender } = render(<Tracker />);
    rerender(<Tracker />);

    expect(seen.length).toBeGreaterThanOrEqual(2);
    expect(seen[0]).toBe(seen[seen.length - 1]);
  });

  test("limpia el ref del consumidor al desmontar", () => {
    const ref = React.createRef<HTMLDivElement>();
    const { unmount } = render(<Probe ref={ref}>contenido</Probe>);

    expect(ref.current).not.toBeNull();
    unmount();
    expect(ref.current).toBeNull();
  });

  test("funciona con un ref encadenado por useImperativeHandle", () => {
    const outerRef = React.createRef<HTMLDivElement>();

    const Wrapper = forwardRef<HTMLDivElement>(function Wrapper(_props, ref) {
      const innerRef = React.useRef<HTMLDivElement>(null);
      useImperativeHandle(ref, () => innerRef.current as HTMLDivElement);
      return <Probe ref={innerRef} />;
    });

    render(<Wrapper ref={outerRef} />);

    expect(outerRef.current).toBe(screen.getByTestId("probe"));
  });
});
