// Button.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import Button from "../src/Button";
import type { ButtonSize, ButtonTheme, ButtonVariant } from "../src/Button.types";

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

const VARIANTS: ButtonVariant[] = ["outline", "dash", "soft"];

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

    test("sin variant no emite ninguna clase de tratamiento", () => {
      // Un botón sólido es la ausencia de tratamiento: no existe .btn-solid.
      render(<Button>Sólido</Button>);

      const className = screen.getByRole("button").className;
      expect(className).not.toMatch(/btn-(solid|outline|dash|soft)/);
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

    // El bug de origen (AGENTS.md §9.4): `useButton` consultaba
    // `button.theme[variant]` —el mapa de roles— con una clave de tratamiento,
    // así que `dash` y `soft` se perdían y `outline` sólo funcionaba por
    // coincidencia de nombre entre los dos mapas.
    test.each(VARIANTS)('variant="%s" aplica la clase btn-%s', (variant) => {
      render(<Button variant={variant}>Texto</Button>);

      expect(screen.getByRole("button")).toHaveClass(`btn-${variant}`);
    });

    test("el rol y el tratamiento conviven en el mismo nodo", () => {
      render(
        <Button theme="success" variant="soft" size="lg">
          Texto
        </Button>
      );

      expect(screen.getByRole("button")).toHaveClass("btn", "btn-success", "btn-soft", "btn-lg");
    });
  });

  describe("modificadores de layout", () => {
    test.each([
      ["square", "btn-square"],
      ["circle", "btn-circle"],
    ] as const)('shape="%s" aplica %s', (shape, expected) => {
      render(<Button shape={shape}>Texto</Button>);

      expect(screen.getByRole("button")).toHaveClass(expected);
    });

    test.each([
      ["wide", "btn-wide"],
      ["block", "btn-block"],
    ] as const)('width="%s" aplica %s', (width, expected) => {
      render(<Button width={width}>Texto</Button>);

      expect(screen.getByRole("button")).toHaveClass(expected);
    });

    test("active aplica btn-active", () => {
      render(<Button active>Texto</Button>);

      expect(screen.getByRole("button")).toHaveClass("btn-active");
    });
  });

  describe("estado disabled", () => {
    test("marca el botón como deshabilitado y añade la clase del contrato", () => {
      render(<Button disabled>Deshabilitado</Button>);

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      // `btn-disabled`, no utilidades de Tailwind: el CSS del plugin ya define
      // el estado, y `opacity-50` sólo existiría si el consumidor escaneara
      // nuestro bundle (no lo hace).
      expect(button).toHaveClass("btn-disabled");
      expect(button.className).not.toMatch(/opacity-50|cursor-not-allowed/);
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
    test('as="a" renderiza un <a> con href y expone el rol link', () => {
      render(
        <Button as="a" href="https://example.com">
          Ir
        </Button>
      );

      // React Aria fuerza `role="button"` sobre cualquier elementType que no
      // sea <button>; el hook lo retira cuando hay href para no tapar el rol
      // nativo del ancla (gap G-02 del lote 2).
      const anchor = screen.getByRole("link", { name: "Ir" });
      expect(anchor.tagName).toBe("A");
      expect(anchor).toHaveAttribute("href", "https://example.com");
      expect(anchor).toHaveClass("btn", "btn-primary", "btn-md");
      expect(anchor).not.toHaveAttribute("type");
      expect(anchor).not.toHaveAttribute("role");
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

    test("el ancla sigue siendo accionable con teclado", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <Button as="a" href="#destino" onClick={handleClick}>
          Ir
        </Button>
      );

      screen.getByRole("link").focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("higiene de props (ninguna prop de configuración llega al DOM)", () => {
    test("no emite atributos inválidos ni avisos de React", () => {
      // Gap G-03 del lote 2: `loading` llegaba al DOM y React avisaba con
      // "Received `true` for a non-boolean attribute `loading`".
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});

      render(
        <Button
          theme="success"
          variant="soft"
          size="lg"
          shape="circle"
          width="block"
          active
          loading
          startIcon={<span data-testid="start">←</span>}
          endIcon={<span data-testid="end">→</span>}
          data-testid="btn"
        >
          Guardando
        </Button>
      );

      const button = screen.getByTestId("btn");
      for (const attr of [
        "loading",
        "variant",
        "theme",
        "size",
        "shape",
        "width",
        "active",
        "starticon",
        "endicon",
        "icon",
      ]) {
        expect(button).not.toHaveAttribute(attr);
      }
      // `data-*` sí debe pasar: es un atributo válido del consumidor.
      expect(button).toHaveAttribute("data-testid", "btn");
      expect(consoleError).not.toHaveBeenCalled();

      consoleError.mockRestore();
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
    test("conserva los children junto al spinner y declara aria-busy", () => {
      render(<Button loading>Guardando</Button>);

      const button = screen.getByRole("button");
      expect(screen.getByText("Guardando")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-busy", "true");
      // El spinner va antes del contenido.
      expect(button.firstElementChild).toBe(screen.getByRole("status"));
    });

    test("sin loading no hay spinner ni aria-busy", () => {
      render(<Button>Guardar</Button>);

      expect(screen.queryByRole("status")).not.toBeInTheDocument();
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
    });

    test("el spinner hereda el color de contenido del botón, no un rol fijo", () => {
      render(
        <Button theme="warning" loading>
          Convirtiendo
        </Button>
      );

      // `loader-current` = `--loader-color: currentColor` = `--btn-fg`.
      // Antes era siempre `loader-primary`: azul sobre azul en un btn-primary.
      const spinner = screen.getByRole("status");
      expect(spinner).toHaveClass("loader-current");
      expect(spinner.className).not.toMatch(/loader-(primary|warning)\b/);
    });

    test.each([
      ["xs", "loader-2xs"],
      ["sm", "loader-xs"],
      ["md", "loader-sm"],
      ["lg", "loader-md"],
      ["xl", "loader-lg"],
    ] as const)('size="%s" usa %s en el spinner', (size, expected) => {
      render(
        <Button size={size} loading>
          Cargando
        </Button>
      );

      expect(screen.getByRole("status")).toHaveClass(expected);
    });

    test("bloquea la interacción mientras carga", async () => {
      const user = userEvent.setup();
      const handleClick = jest.fn();
      render(
        <Button loading onClick={handleClick}>
          Guardando
        </Button>
      );

      await user.click(screen.getByRole("button"));

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("iconos", () => {
    test("startIcon y endIcon renderizan en el orden correcto", () => {
      render(
        <Button
          startIcon={<span data-testid="start">←</span>}
          endIcon={<span data-testid="end">→</span>}
        >
          Texto
        </Button>
      );

      const button = screen.getByRole("button");
      const order = Array.from(button.childNodes).map((node) =>
        node.nodeType === Node.TEXT_NODE
          ? node.textContent
          : (node as HTMLElement).getAttribute("data-testid")
      );

      expect(order).toEqual(["start", "Texto", "end"]);
    });

    test("startIcon sin endIcon no inventa nodos", () => {
      render(<Button startIcon={<span data-testid="start">←</span>}>Texto</Button>);

      const button = screen.getByRole("button");
      expect(screen.getByTestId("start")).toBeInTheDocument();
      expect(button.childNodes).toHaveLength(2);
    });

    test("con loading, el spinner precede a los iconos", () => {
      render(
        <Button loading startIcon={<span data-testid="start">←</span>}>
          Texto
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button.firstElementChild).toBe(screen.getByRole("status"));
      expect(button.children[1]).toBe(screen.getByTestId("start"));
    });

    test("icon es el único contenido y hace el botón cuadrado", () => {
      render(<Button icon={<span data-testid="icon">★</span>} aria-label="Favorito" />);

      const button = screen.getByRole("button", { name: "Favorito" });
      expect(button).toHaveClass("btn-square");
      expect(screen.getByTestId("icon")).toBeInTheDocument();
      expect(button.childNodes).toHaveLength(1);
    });

    test("icon respeta una shape explícita", () => {
      render(<Button icon={<span>★</span>} shape="circle" aria-label="Favorito" />);

      const button = screen.getByRole("button");
      expect(button).toHaveClass("btn-circle");
      expect(button).not.toHaveClass("btn-square");
    });

    test("icon exige aria-label en TypeScript", () => {
      render(
        // @ts-expect-error un botón icon-only sin `aria-label` no tiene nombre accesible
        <Button icon={<span>★</span>} />
      );

      expect(screen.getByRole("button")).toHaveClass("btn-square");
    });

    test("icon no admite children en TypeScript", () => {
      render(
        // @ts-expect-error `children` está prohibido (never) junto a `icon`
        <Button icon={<span>★</span>} aria-label="Favorito">
          Texto
        </Button>
      );

      expect(screen.getByRole("button", { name: "Favorito" })).toBeInTheDocument();
    });
  });
});
