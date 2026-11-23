import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import Badge from "../src/Badge";
import { badge } from "@ownui/tw-theme/variants";

/**
 * Tests del Badge (lote 12).
 *
 * Comportamiento observable: el nodo que sale al DOM, lo que un lector de
 * pantalla anuncia y las clases que el CSS necesita. `pnpm check:contract` ya
 * garantiza que esas clases existen en `css/badge.css`; aquí se garantiza que
 * el componente las emite.
 */
describe("Badge", () => {
  describe("renderizado y contrato de clases", () => {
    it("renderiza un `<span>` con la clase base y los defaults", () => {
      render(<Badge>Nuevo</Badge>);
      const node = screen.getByText("Nuevo");

      expect(node.tagName).toBe("SPAN");
      expect(node).toHaveClass(badge.part.root);
      expect(node).toHaveClass(badge.theme.neutral);
      expect(node).toHaveClass(badge.size.md);
    });

    it.each(Object.entries(badge.theme))("aplica la clase del rol %s", (theme, expected) => {
      render(<Badge theme={theme as keyof typeof badge.theme}>x</Badge>);
      expect(screen.getByText("x")).toHaveClass(expected);
    });

    it.each(Object.entries(badge.variant))(
      "aplica la clase del tratamiento %s",
      (variant, expected) => {
        render(<Badge variant={variant as keyof typeof badge.variant}>x</Badge>);
        expect(screen.getByText("x")).toHaveClass(expected);
      }
    );

    it.each(Object.entries(badge.size))("aplica la clase del tamaño %s", (size, expected) => {
      render(<Badge size={size as keyof typeof badge.size}>x</Badge>);
      expect(screen.getByText("x")).toHaveClass(expected);
    });

    it("sin tratamiento no emite ninguna clase de `variant`", () => {
      render(<Badge>x</Badge>);
      const node = screen.getByText("x");

      for (const cls of Object.values(badge.variant)) {
        expect(node).not.toHaveClass(cls);
      }
    });

    it("conserva las clases del consumidor y pasa los atributos al DOM", () => {
      render(
        <Badge className="mi-clase" id="estado" title="Estado del pedido">
          x
        </Badge>
      );
      const node = screen.getByText("x");

      expect(node).toHaveClass(badge.part.root);
      expect(node).toHaveClass("mi-clase");
      expect(node).toHaveAttribute("id", "estado");
      expect(node).toHaveAttribute("title", "Estado del pedido");
    });

    it("no filtra `theme`, `variant`, `size` ni `dot` como atributos del DOM", () => {
      // Es la fuga que el lote 7 tuvo que arreglar en el Dropdown (§9.8).
      render(
        <Badge theme="info" variant="soft" size="lg" data-testid="badge">
          x
        </Badge>
      );
      const node = screen.getByTestId("badge");

      for (const attr of ["theme", "variant", "size", "dot"]) {
        expect(node).not.toHaveAttribute(attr);
      }
    });
  });

  describe("punto de estado", () => {
    it("aplica .badge-dot y descarta el contenido", () => {
      const { container } = render(
        <Badge dot theme="success">
          texto que no debe salir
        </Badge>
      );
      const node = container.querySelector(`.${badge.state.dot}`);

      expect(node).toBeInTheDocument();
      expect(node).toHaveTextContent("");
      expect(node).toHaveClass(badge.theme.success);
    });

    it("sin nombre accesible es decorativo: `aria-hidden`", () => {
      const { container } = render(<Badge dot theme="error" />);
      const node = container.querySelector(`.${badge.state.dot}`);

      // Un <span> vacío no tiene nombre accesible: o es decorativo o miente.
      expect(node).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it('con `aria-label` es información: `role="img"` y nombre accesible', () => {
      render(<Badge dot theme="success" aria-label="En línea" />);
      const node = screen.getByRole("img", { name: "En línea" });

      expect(node).toHaveClass(badge.state.dot);
      expect(node).not.toHaveAttribute("aria-hidden");
    });

    it("`aria-labelledby` también cuenta como nombre", () => {
      render(
        <>
          <span id="etiqueta">Estado</span>
          <Badge dot aria-labelledby="etiqueta" />
        </>
      );

      expect(screen.getByRole("img", { name: "Estado" })).toBeInTheDocument();
    });

    it("el consumidor puede forzar su propio `aria-hidden`", () => {
      render(<Badge dot aria-label="x" aria-hidden="true" data-testid="badge" />);

      // `restProps` va después de los atributos derivados: lo explícito gana.
      expect(screen.getByTestId("badge")).toHaveAttribute("aria-hidden", "true");
    });

    it("sin `dot` no se oculta ni recibe rol", () => {
      render(<Badge>3</Badge>);
      const node = screen.getByText("3");

      expect(node).not.toHaveAttribute("aria-hidden");
      expect(node).not.toHaveAttribute("role");
    });
  });

  describe("refs", () => {
    it("el ref apunta al nodo del DOM", () => {
      const ref = createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>x</Badge>);

      expect(ref.current).toBe(screen.getByText("x"));
      expect(ref.current?.tagName).toBe("SPAN");
    });
  });
});
