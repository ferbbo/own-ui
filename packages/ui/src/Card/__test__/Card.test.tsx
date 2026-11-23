import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Card from "../src/Card";
import { card } from "@ownui/tw-theme/variants";

/**
 * Tests del Card (lote 12).
 *
 * Se comprueba comportamiento observable, no implementación: el elemento que
 * sale al DOM, lo que un lector de pantalla encuentra y las clases que el CSS
 * necesita. `pnpm check:contract` ya garantiza que esas clases existen en
 * `css/card.css`; aquí se garantiza que el componente las emite.
 *
 * Las tablas de variantes se recorren con `it.each(Object.entries(card.*))` y
 * no con una lista escrita a mano: si mañana se añade un rol al contrato, el
 * test nuevo aparece solo.
 */

describe("Card", () => {
  describe("renderizado y contrato de clases", () => {
    it("renderiza un `<div>` con la clase base y los defaults", () => {
      render(<Card data-testid="card">Contenido</Card>);
      const root = screen.getByTestId("card");

      expect(root.tagName).toBe("DIV");
      expect(root).toHaveClass(card.part.root);
      expect(root).toHaveClass(card.theme.neutral);
      expect(root).toHaveClass(card.size.md);
      expect(root).toHaveTextContent("Contenido");
    });

    it.each(Object.entries(card.theme))("aplica la clase del rol %s", (theme, expected) => {
      render(
        <Card data-testid="card" theme={theme as keyof typeof card.theme}>
          x
        </Card>
      );
      expect(screen.getByTestId("card")).toHaveClass(expected);
    });

    it.each(Object.entries(card.variant))(
      "aplica la clase del tratamiento %s",
      (variant, expected) => {
        render(
          <Card data-testid="card" variant={variant as keyof typeof card.variant}>
            x
          </Card>
        );
        expect(screen.getByTestId("card")).toHaveClass(expected);
      }
    );

    it.each(Object.entries(card.size))("aplica la clase del tamaño %s", (size, expected) => {
      render(
        <Card data-testid="card" size={size as keyof typeof card.size}>
          x
        </Card>
      );
      expect(screen.getByTestId("card")).toHaveClass(expected);
    });

    it("sin tratamiento no emite ninguna clase de `variant`", () => {
      render(<Card data-testid="card">x</Card>);
      const root = screen.getByTestId("card");

      for (const cls of Object.values(card.variant)) {
        expect(root).not.toHaveClass(cls);
      }
    });

    it("conserva las clases del consumidor", () => {
      render(
        <Card data-testid="card" className="mi-clase">
          x
        </Card>
      );
      const root = screen.getByTestId("card");

      expect(root).toHaveClass(card.part.root);
      expect(root).toHaveClass("mi-clase");
    });

    it("pasa al DOM los atributos que no son de configuración", () => {
      render(
        <Card data-testid="card" id="destacado" aria-label="Resumen">
          x
        </Card>
      );
      const root = screen.getByTestId("card");

      expect(root).toHaveAttribute("id", "destacado");
      expect(root).toHaveAccessibleName("Resumen");
    });

    it("no filtra `theme`, `variant` ni `size` como atributos del DOM", () => {
      // Es la fuga que el lote 7 tuvo que arreglar en el Dropdown (§9.8).
      render(
        <Card data-testid="card" theme="info" variant="elevated" size="lg">
          x
        </Card>
      );
      const root = screen.getByTestId("card");

      expect(root).not.toHaveAttribute("theme");
      expect(root).not.toHaveAttribute("variant");
      expect(root).not.toHaveAttribute("size");
    });
  });

  describe("polimorfismo y estado accionable", () => {
    it("renderiza el elemento de `as`", () => {
      render(
        <Card as="article" data-testid="card">
          x
        </Card>
      );
      expect(screen.getByTestId("card").tagName).toBe("ARTICLE");
    });

    it('`as="a"` es accionable: lleva .card-clickable y es un enlace', () => {
      render(
        <Card as="a" href="/detalle">
          Ver detalle
        </Card>
      );
      const link = screen.getByRole("link", { name: "Ver detalle" });

      expect(link).toHaveClass(card.state.clickable);
      expect(link).toHaveAttribute("href", "/detalle");
    });

    it('`as="button"` es accionable, recibe `type="button"` y responde al teclado', async () => {
      const onClick = jest.fn();
      render(
        <Card as="button" onClick={onClick}>
          Abrir
        </Card>
      );
      const button = screen.getByRole("button", { name: "Abrir" });

      expect(button).toHaveClass(card.state.clickable);
      // Sin `type`, un `<button>` dentro de un formulario lo envía.
      expect(button).toHaveAttribute("type", "button");

      // El teclado lo da el elemento nativo: eso es lo que compra derivar
      // `clickable` del elemento en vez de pedirlo por prop.
      await userEvent.tab();
      expect(button).toHaveFocus();
      await userEvent.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("un `<div>` nunca recibe .card-clickable", () => {
      // AGENTS.md §8.5: no se fabrica interacción sobre un div. Si el card
      // pareciera pulsable sin serlo, este test fallaría.
      render(
        <Card data-testid="card" onClick={() => undefined}>
          x
        </Card>
      );
      expect(screen.getByTestId("card")).not.toHaveClass(card.state.clickable);
    });

    it("`type` explícito gana sobre el que pone el hook", () => {
      render(
        <Card as="button" type="submit">
          Enviar
        </Card>
      );
      expect(screen.getByRole("button", { name: "Enviar" })).toHaveAttribute("type", "submit");
    });
  });

  describe("partes", () => {
    it("monta la anatomía completa con sus clases", () => {
      const { container } = render(
        <Card data-testid="card">
          <Card.Header>
            <Card.Title>Título</Card.Title>
          </Card.Header>
          <Card.Body>Cuerpo</Card.Body>
          <Card.Footer>Pie</Card.Footer>
        </Card>
      );

      expect(container.querySelector(`.${card.part.header}`)).toBeInTheDocument();
      expect(container.querySelector(`.${card.part.body}`)).toHaveTextContent("Cuerpo");
      expect(container.querySelector(`.${card.part.footer}`)).toHaveTextContent("Pie");
      expect(screen.getByRole("heading", { level: 3, name: "Título" })).toHaveClass(
        card.part.title
      );
    });

    it("el título acepta el nivel de encabezado del documento", () => {
      render(<Card.Title as="h2">Sección</Card.Title>);
      expect(screen.getByRole("heading", { level: 2, name: "Sección" })).toBeInTheDocument();
    });

    it("el título puede no ser un encabezado", () => {
      render(<Card.Title as="p">No es encabezado</Card.Title>);

      expect(screen.queryByRole("heading")).not.toBeInTheDocument();
      expect(screen.getByText("No es encabezado").tagName).toBe("P");
    });

    it.each([
      ["Header", Card.Header, card.part.header],
      ["Body", Card.Body, card.part.body],
      ["Footer", Card.Footer, card.part.footer],
      ["Title", Card.Title, card.part.title],
    ])("%s conserva las clases y los atributos del consumidor", (_name, Part, expected) => {
      render(
        <Part className="extra" data-testid="parte">
          x
        </Part>
      );
      const node = screen.getByTestId("parte");

      expect(node).toHaveClass(expected);
      expect(node).toHaveClass("extra");
    });
  });

  describe("refs", () => {
    it("el ref del root apunta al nodo del DOM", () => {
      const ref = createRef<HTMLDivElement>();
      render(
        <Card ref={ref} data-testid="card">
          x
        </Card>
      );

      expect(ref.current).toBe(screen.getByTestId("card"));
    });

    it("cada parte expone su propio nodo", () => {
      const header = createRef<HTMLDivElement>();
      const body = createRef<HTMLDivElement>();
      const footer = createRef<HTMLDivElement>();
      const title = createRef<HTMLHeadingElement>();

      render(
        <Card>
          <Card.Header ref={header}>
            <Card.Title ref={title}>t</Card.Title>
          </Card.Header>
          <Card.Body ref={body}>b</Card.Body>
          <Card.Footer ref={footer}>f</Card.Footer>
        </Card>
      );

      expect(header.current).toHaveClass(card.part.header);
      expect(body.current).toHaveClass(card.part.body);
      expect(footer.current).toHaveClass(card.part.footer);
      expect(title.current?.tagName).toBe("H3");
    });
  });
});
