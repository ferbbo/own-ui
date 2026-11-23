import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Input from "../src/Input";
import { input } from "@ownui/tw-theme/variants";

/**
 * Tests del Input (lote 10).
 *
 * Se comprueba comportamiento observable, no implementación: lo que el
 * usuario escribe, lo que un lector de pantalla anuncia y las clases que el
 * CSS necesita. `pnpm check:contract` ya garantiza que esas clases existen en
 * `css/input.css`; aquí se garantiza que el componente las emite.
 */

/** La caja (`.input`) es el padre del `<input class="input-control">`. */
function boxOf(control: HTMLElement): HTMLElement {
  const box = control.parentElement;
  if (!box) throw new Error("El control no tiene caja");
  return box;
}

describe("Input", () => {
  describe("renderizado y contrato de clases", () => {
    it("monta la anatomía completa: contenedor, caja y control", () => {
      const { container } = render(<Input label="Correo" />);
      const control = screen.getByLabelText("Correo");

      expect(control.tagName).toBe("INPUT");
      expect(control).toHaveClass(input.part.control);
      expect(boxOf(control)).toHaveClass(input.part.box);
      expect(container.querySelector(`.${input.part.field}`)).toBeInTheDocument();
    });

    it("aplica el rol por defecto `neutral` y el tamaño `md`", () => {
      render(<Input label="Campo" />);
      const box = boxOf(screen.getByLabelText("Campo"));

      expect(box).toHaveClass(input.theme.neutral);
      expect(box).toHaveClass(input.size.md);
    });

    it.each(Object.entries(input.theme))("aplica la clase del rol %s", (theme, expected) => {
      render(<Input label="Campo" theme={theme as keyof typeof input.theme} />);
      expect(boxOf(screen.getByLabelText("Campo"))).toHaveClass(expected);
    });

    it.each(Object.entries(input.variant))(
      "aplica la clase del tratamiento %s",
      (variant, expected) => {
        render(<Input label="Campo" variant={variant as keyof typeof input.variant} />);
        expect(boxOf(screen.getByLabelText("Campo"))).toHaveClass(expected);
      }
    );

    it.each(Object.entries(input.size))("aplica la clase del tamaño %s", (size, expected) => {
      const { container } = render(<Input label="Campo" size={size as keyof typeof input.size} />);
      expect(boxOf(screen.getByLabelText("Campo"))).toHaveClass(expected);
      // El tamaño también va en el contenedor: define `--input-fontsize`, que
      // el label y la ayuda necesitan y no heredarían de un hermano.
      expect(container.querySelector(`.${input.part.field}`)).toHaveClass(expected);
    });

    it("sin tratamiento no emite ninguna clase de `variant`", () => {
      render(<Input label="Campo" />);
      const box = boxOf(screen.getByLabelText("Campo"));

      for (const cls of Object.values(input.variant)) {
        expect(box).not.toHaveClass(cls);
      }
    });

    it("conserva las clases propias del consumidor en la caja y en el contenedor", () => {
      const { container } = render(
        <Input label="Campo" className="mi-caja" fieldClassName="mi-campo" />
      );

      expect(boxOf(screen.getByLabelText("Campo"))).toHaveClass("mi-caja");
      expect(container.querySelector(`.${input.part.field}`)).toHaveClass("mi-campo");
    });
  });

  describe("escritura y valor", () => {
    it("no controlado: escribe y notifica el valor, no el evento", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<Input label="Nombre" onChange={onChange} />);

      await user.type(screen.getByLabelText("Nombre"), "ana");

      expect(screen.getByLabelText("Nombre")).toHaveValue("ana");
      expect(onChange).toHaveBeenLastCalledWith("ana");
    });

    it("respeta `defaultValue`", () => {
      render(<Input label="Nombre" defaultValue="inicial" />);
      expect(screen.getByLabelText("Nombre")).toHaveValue("inicial");
    });

    it("controlado: el valor no cambia si el consumidor no lo cambia", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<Input label="Nombre" value="fijo" onChange={onChange} />);

      await user.type(screen.getByLabelText("Nombre"), "x");

      expect(screen.getByLabelText("Nombre")).toHaveValue("fijo");
      expect(onChange).toHaveBeenCalledWith("fijox");
    });

    it("`readOnly` deja seleccionar pero no escribir", async () => {
      const user = userEvent.setup();
      render(<Input label="Id" defaultValue="abc" readOnly />);
      const control = screen.getByLabelText("Id");

      await user.type(control, "xyz");

      expect(control).toHaveValue("abc");
      expect(control).toHaveAttribute("readonly");
      expect(boxOf(control)).toHaveClass(input.state.readOnly);
    });

    it("`disabled` bloquea la escritura y marca la caja", async () => {
      const user = userEvent.setup();
      render(<Input label="Nombre" disabled />);
      const control = screen.getByLabelText("Nombre");

      await user.type(control, "nada");

      expect(control).toBeDisabled();
      expect(control).toHaveValue("");
      expect(boxOf(control)).toHaveClass(input.state.disabled);
    });
  });

  describe("accesibilidad", () => {
    it("enlaza el `<label>` con el control", () => {
      render(<Input label="Correo" />);
      const control = screen.getByLabelText("Correo");
      const label = screen.getByText("Correo");

      expect(label.tagName).toBe("LABEL");
      expect(label).toHaveAttribute("for", control.id);
      expect(label).toHaveClass(input.part.label);
    });

    it("la descripción se anuncia por `aria-describedby`", () => {
      render(<Input label="Correo" description="Te enviaremos el recibo." />);
      const control = screen.getByLabelText("Correo");
      const description = screen.getByText("Te enviaremos el recibo.");

      expect(description).toHaveClass(input.part.description);
      expect(control.getAttribute("aria-describedby")).toContain(description.id);
    });

    it("`invalid` marca aria-invalid, pinta la caja y anuncia el error", () => {
      render(<Input label="Correo" invalid errorMessage="Dominio inválido" />);
      const control = screen.getByLabelText("Correo");
      const error = screen.getByText("Dominio inválido");

      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(error).toHaveClass(input.part.errorMessage);
      expect(control.getAttribute("aria-describedby")).toContain(error.id);
      expect(boxOf(control)).toHaveClass(input.state.invalid);
    });

    it("un `errorMessage` sin `invalid` no se muestra", () => {
      render(<Input label="Correo" errorMessage="Dominio inválido" />);

      expect(screen.queryByText("Dominio inválido")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Correo")).not.toHaveAttribute("aria-invalid", "true");
    });

    it("sin `label` acepta `aria-label` como nombre accesible", () => {
      render(<Input aria-label="Buscar" />);
      expect(screen.getByLabelText("Buscar")).toBeInTheDocument();
    });

    it("los iconos quedan fuera del árbol de accesibilidad", () => {
      render(<Input label="Buscar" startIcon={<span data-testid="icono">🔍</span>} />);
      const icon = screen.getByTestId("icono").parentElement;

      expect(icon).toHaveClass(input.part.icon);
      expect(icon).toHaveAttribute("aria-hidden", "true");
    });

    it("el tipo llega al control", () => {
      render(<Input label="Clave" type="password" />);
      expect(screen.getByLabelText("Clave")).toHaveAttribute("type", "password");
    });
  });

  describe("ref y foco", () => {
    it("`forwardRef` expone el `<input>`, no el contenedor", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input label="Nombre" ref={ref} />);

      expect(ref.current).toBe(screen.getByLabelText("Nombre"));
      expect(ref.current?.tagName).toBe("INPUT");
    });

    it("el ref permite enfocar el control desde fuera", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Input label="Nombre" ref={ref} />);

      ref.current?.focus();

      expect(screen.getByLabelText("Nombre")).toHaveFocus();
    });

    it("se enfoca con el teclado", async () => {
      const user = userEvent.setup();
      render(<Input label="Nombre" />);

      await user.tab();

      expect(screen.getByLabelText("Nombre")).toHaveFocus();
    });
  });
});
