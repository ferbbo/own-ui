// Button.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Button from "../src/Button";
import type { ButtonSize, ButtonTheme } from "../src/Button.types";

const THEMES: ButtonTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
  "ghost",
  "link",
];

const SIZES: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

describe("Button", () => {
  describe("renderizado por defecto", () => {
    test("renderiza un <button> con el contenido y las clases por defecto", () => {
      render(<Button>Click me</Button>);

      const button = screen.getByRole("button", { name: "Click me" });
      expect(button).toBeInTheDocument();
      expect(button.tagName).toBe("BUTTON");
      // Defaults del hook: theme="primary", size="md"
      expect(button).toHaveClass("btn", "btn-primary", "btn-md");
    });

    test('usa type="button" por defecto y respeta el type explícito', () => {
      const { rerender } = render(<Button>Enviar</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "button");

      rerender(<Button type="submit">Enviar</Button>);
      expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
    });

    test("concatena className sin perder las clases del contrato", () => {
      render(<Button className="mi-clase">Click</Button>);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn", "btn-primary", "btn-md", "mi-clase");
    });
  });

  describe("contrato de clases", () => {
    test.each(THEMES)('theme="%s" aplica la clase btn-%s', (theme) => {
      render(<Button theme={theme}>Texto</Button>);

      expect(screen.getByRole("button")).toHaveClass(`btn-${theme}`);
    });

    test.each(SIZES)('size="%s" aplica la clase btn-%s', (size) => {
      render(<Button size={size}>Texto</Button>);

      expect(screen.getByRole("button")).toHaveClass(`btn-${size}`);
    });

    // El contrato de `variant` está roto en origen (AGENTS.md §9.4): useButton
    // consulta `button.theme[variant]` en lugar de `button.variant[variant]`, y
    // variants/button.ts declara `solid` donde el CSS tiene `dash`/`soft`.
    // Arreglarlo es el lote 5; aquí sólo se deja el test que lo delata: cuando
    // L5 alinee las tres capas, `test.failing` empezará a fallar y habrá que
    // convertirlo en `test`.
    test.failing('variant="dash" debería aplicar btn-dash (lote 5)', () => {
      render(<Button variant="dash">Texto</Button>);

      expect(screen.getByRole("button")).toHaveClass("btn-dash");
    });
  });

  describe("estado disabled", () => {
    test("marca el botón como deshabilitado y añade las clases de estado", () => {
      render(<Button disabled>Deshabilitado</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("opacity-50", "cursor-not-allowed");
    });

    test("no dispara onClick cuando está deshabilitado", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <Button disabled onClick={handleClick}>
          Deshabilitado
        </Button>
      );

      await user.click(screen.getByRole("button"));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("interacción", () => {
    test("dispara onClick una sola vez por click", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      await user.click(screen.getByRole("button", { name: "Click me" }));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test("es accionable con teclado (Enter y Espacio)", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);

      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();

      await user.keyboard("{Enter}");
      await user.keyboard(" ");

      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  describe("polimorfismo", () => {
    // Nota: React Aria (`useAriaButton` con `elementType: "a"`) fuerza
    // `role="button"` sobre el ancla, así que el nodo NO expone el rol `link`
    // aunque tenga `href`. Es comportamiento deliberado de la librería, pero
    // pierde la semántica de enlace para el lector de pantalla: registrado como
    // gap G-02 en specs/lote-2.md para decidirlo en el lote 5.
    test('as="a" renderiza un <a> con href y las clases del contrato', () => {
      render(
        <Button as="a" href="https://example.com">
          Ir
        </Button>
      );

      const anchor = screen.getByText("Ir");
      expect(anchor.tagName).toBe("A");
      expect(anchor).toHaveAttribute("href", "https://example.com");
      expect(anchor).toHaveClass("btn", "btn-primary", "btn-md");
      expect(anchor).not.toHaveAttribute("type");
    });

    test('as="a" no acepta disabled en TypeScript', () => {
      render(
        // @ts-expect-error `disabled` está prohibido (never) cuando as="a"
        <Button as="a" href="https://example.com" disabled>
          Ir
        </Button>
      );

      expect(screen.getByText("Ir").tagName).toBe("A");
    });
  });

  describe("ref", () => {
    test("reenvía la ref al nodo <button>", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Click</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current).toBe(screen.getByRole("button"));
    });

    test('reenvía la ref al nodo <a> cuando as="a"', () => {
      const ref = React.createRef<HTMLAnchorElement>();
      render(
        <Button as="a" href="https://example.com" ref={ref}>
          Ir
        </Button>
      );

      expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
    });
  });

  describe("loading", () => {
    test('renderiza el Loader con role="status"', () => {
      render(<Button loading>Guardando</Button>);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    // AGENTS.md §9.5: hoy `loading` sustituye el contenido por el spinner y el
    // Loader no hereda ni tamaño ni color del botón. El comportamiento esperado
    // (spinner junto al contenido + aria-busy) es alcance del lote 5; estos dos
    // tests son el marcador del defecto.
    test.failing("debería conservar los children junto al spinner (lote 5)", () => {
      render(<Button loading>Guardando</Button>);

      expect(screen.getByText("Guardando")).toBeInTheDocument();
    });

    test.failing("debería exponer aria-busy mientras carga (lote 5)", () => {
      render(<Button loading>Guardando</Button>);

      expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
    });
  });
});
