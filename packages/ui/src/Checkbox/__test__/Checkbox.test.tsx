import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Checkbox from "../src/Checkbox";
import CheckboxGroup from "../src/CheckboxGroup";
import { checkbox } from "@ownui/tw-theme/variants";

/**
 * Tests del Checkbox y del CheckboxGroup (lote 11).
 *
 * Comportamiento observable, no implementacion. El control real es un
 * `<input>` oculto **visualmente** pero presente en el arbol de
 * accesibilidad, asi que todo se busca por rol — si algun dia se ocultara de
 * verdad, estos tests se caerian, que es lo que se quiere.
 */

/** La caja pintada es el `<span>` hermano del input dentro del `<label>`. */
function boxOf(input: HTMLElement): HTMLElement {
  const box = input.parentElement?.querySelector(`.${checkbox.part.box}`);
  if (!box) throw new Error("No se encontro la caja del checkbox");
  return box as HTMLElement;
}

describe("Checkbox", () => {
  describe("render y contrato de clases", () => {
    it("monta un input accesible, oculto visualmente, con su caja y su texto", () => {
      render(<Checkbox>Acepto</Checkbox>);
      const input = screen.getByRole("checkbox", { name: "Acepto" });

      expect(input.tagName).toBe("INPUT");
      expect(input).toHaveClass(checkbox.part.input);
      expect(boxOf(input)).toHaveClass(checkbox.part.box);
      expect(screen.getByText("Acepto")).toHaveClass(checkbox.part.label);
    });

    it("la caja queda fuera del arbol de accesibilidad", () => {
      render(<Checkbox>Acepto</Checkbox>);
      expect(boxOf(screen.getByRole("checkbox"))).toHaveAttribute("aria-hidden", "true");
    });

    it("aplica el rol por defecto `primary` y el tamano `md`", () => {
      render(<Checkbox>x</Checkbox>);
      const box = boxOf(screen.getByRole("checkbox"));

      expect(box).toHaveClass(checkbox.theme.primary);
      expect(box).toHaveClass(checkbox.size.md);
    });

    it.each(Object.entries(checkbox.theme))("aplica la clase del rol %s", (theme, expected) => {
      render(<Checkbox theme={theme as keyof typeof checkbox.theme}>x</Checkbox>);
      expect(boxOf(screen.getByRole("checkbox"))).toHaveClass(expected);
    });

    it.each(Object.entries(checkbox.size))("aplica la clase del tamano %s", (size, expected) => {
      render(<Checkbox size={size as keyof typeof checkbox.size}>x</Checkbox>);
      const input = screen.getByRole("checkbox");

      expect(boxOf(input)).toHaveClass(expected);
      // El tamano tambien va en el <label>: define --checkbox-fontsize, que
      // el texto necesita y no heredaria de un hermano.
      expect(input.parentElement).toHaveClass(expected);
    });
  });

  describe("marcar y desmarcar", () => {
    it("no controlado: alterna al pulsar y avisa con el valor", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<Checkbox onChange={onChange}>Acepto</Checkbox>);
      const input = screen.getByRole("checkbox");

      await user.click(input);

      expect(input).toBeChecked();
      expect(onChange).toHaveBeenLastCalledWith(true);
      expect(boxOf(input)).toHaveClass(checkbox.state.checked);

      await user.click(input);

      expect(input).not.toBeChecked();
      expect(onChange).toHaveBeenLastCalledWith(false);
    });

    it("pulsar el texto marca la casilla: el <label> envuelve a los dos", async () => {
      const user = userEvent.setup();
      render(<Checkbox>Acepto</Checkbox>);

      await user.click(screen.getByText("Acepto"));

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("respeta `defaultChecked`", () => {
      render(<Checkbox defaultChecked>x</Checkbox>);
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("controlado: no cambia si el consumidor no lo cambia", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(
        <Checkbox checked={false} onChange={onChange}>
          x
        </Checkbox>
      );

      await user.click(screen.getByRole("checkbox"));

      expect(screen.getByRole("checkbox")).not.toBeChecked();
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("se alterna con la barra espaciadora", async () => {
      const user = userEvent.setup();
      render(<Checkbox>x</Checkbox>);

      await user.tab();
      expect(screen.getByRole("checkbox")).toHaveFocus();

      await user.keyboard(" ");
      expect(screen.getByRole("checkbox")).toBeChecked();
    });
  });

  describe("tercer estado", () => {
    it("`indeterminate` pone la propiedad del DOM y lo pinta como parcial", () => {
      render(<Checkbox indeterminate>Todos</Checkbox>);
      const input = screen.getByRole("checkbox") as HTMLInputElement;

      // Es la propiedad del elemento, no un atributo ni un `aria-checked`:
      // en un checkbox nativo el tercer estado se expone asi, y poner
      // `aria-checked="mixed"` encima seria redundante y contradictorio.
      // Esta es tambien la razon por la que el CSS lo pinta por clase: un
      // atributo que no existe no se puede seleccionar.
      expect(input.indeterminate).toBe(true);
      expect(boxOf(input)).toHaveClass(checkbox.state.indeterminate);
    });

    it("indeterminate gana a checked: en pantalla son excluyentes", () => {
      render(
        <Checkbox indeterminate defaultChecked>
          Todos
        </Checkbox>
      );
      const box = boxOf(screen.getByRole("checkbox"));

      expect(box).toHaveClass(checkbox.state.indeterminate);
      expect(box).not.toHaveClass(checkbox.state.checked);
    });
  });

  describe("estados", () => {
    it("`disabled` impide marcar y marca la caja", async () => {
      const user = userEvent.setup();
      render(<Checkbox disabled>x</Checkbox>);
      const input = screen.getByRole("checkbox");

      await user.click(input);

      expect(input).toBeDisabled();
      expect(input).not.toBeChecked();
      expect(boxOf(input)).toHaveClass(checkbox.state.disabled);
    });

    it("`readOnly` deja el control enfocable pero no editable", async () => {
      const user = userEvent.setup();
      render(<Checkbox readOnly>x</Checkbox>);
      const input = screen.getByRole("checkbox");

      await user.click(input);

      expect(input).not.toBeChecked();
      expect(input).toHaveAttribute("aria-readonly", "true");
    });

    it("`invalid` marca aria-invalid y pinta el marco de error", () => {
      render(<Checkbox invalid>x</Checkbox>);
      const input = screen.getByRole("checkbox");

      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(boxOf(input)).toHaveClass(checkbox.state.invalid);
    });
  });

  describe("ref", () => {
    it("`forwardRef` expone el `<input>`, no el `<label>`", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Checkbox ref={ref}>x</Checkbox>);

      expect(ref.current).toBe(screen.getByRole("checkbox"));
      expect(ref.current?.tagName).toBe("INPUT");
    });
  });
});

describe("CheckboxGroup", () => {
  function Group(props: { onChange?: (value: string[]) => void }) {
    return (
      <CheckboxGroup
        label="Ingredientes"
        description="Elige los que quieras."
        onChange={props.onChange}
      >
        <Checkbox value="queso">Queso</Checkbox>
        <Checkbox value="jamon">Jamón</Checkbox>
        <Checkbox value="piña">Piña</Checkbox>
      </CheckboxGroup>
    );
  }

  it("expone un grupo con su nombre accesible", () => {
    render(<Group />);
    expect(screen.getByRole("group", { name: "Ingredientes" })).toBeInTheDocument();
  });

  it("la ayuda se anuncia por aria-describedby", () => {
    render(<Group />);
    const group = screen.getByRole("group");
    const description = screen.getByText("Elige los que quieras.");

    expect(description).toHaveClass(checkbox.part.groupDescription);
    expect(group.getAttribute("aria-describedby")).toContain(description.id);
  });

  it("el estado es una lista de valores y la mantiene el grupo", async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<Group onChange={onChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Queso" }));
    await user.click(screen.getByRole("checkbox", { name: "Piña" }));

    expect(onChange).toHaveBeenLastCalledWith(["queso", "piña"]);
    expect(screen.getByRole("checkbox", { name: "Jamón" })).not.toBeChecked();
  });

  it("controlado desde fuera", async () => {
    const user = userEvent.setup();

    function Controlled() {
      const [value, setValue] = useState<string[]>(["queso"]);
      return (
        <CheckboxGroup label="Ingredientes" value={value} onChange={setValue}>
          <Checkbox value="queso">Queso</Checkbox>
          <Checkbox value="jamon">Jamón</Checkbox>
        </CheckboxGroup>
      );
    }

    render(<Controlled />);
    expect(screen.getByRole("checkbox", { name: "Queso" })).toBeChecked();

    await user.click(screen.getByRole("checkbox", { name: "Jamón" }));

    expect(screen.getByRole("checkbox", { name: "Jamón" })).toBeChecked();
  });

  it("el rol y el tamano del grupo bajan a las casillas", () => {
    render(
      <CheckboxGroup label="g" theme="success" size="lg">
        <Checkbox value="a">A</Checkbox>
      </CheckboxGroup>
    );
    const box = boxOf(screen.getByRole("checkbox"));

    expect(box).toHaveClass(checkbox.theme.success);
    expect(box).toHaveClass(checkbox.size.lg);
  });

  it("una casilla puede pisar el rol del grupo", () => {
    render(
      <CheckboxGroup label="g" theme="success">
        <Checkbox value="a" theme="error">
          A
        </Checkbox>
      </CheckboxGroup>
    );

    expect(boxOf(screen.getByRole("checkbox"))).toHaveClass(checkbox.theme.error);
  });

  it("`disabled` en el grupo deshabilita todas las casillas", () => {
    render(
      <CheckboxGroup label="g" disabled>
        <Checkbox value="a">A</Checkbox>
        <Checkbox value="b">B</Checkbox>
      </CheckboxGroup>
    );

    for (const input of screen.getAllByRole("checkbox")) {
      expect(input).toBeDisabled();
      expect(boxOf(input)).toHaveClass(checkbox.state.disabled);
    }
  });

  it("el error solo se muestra con `invalid`", () => {
    const { rerender } = render(
      <CheckboxGroup label="g" errorMessage="Elige al menos uno">
        <Checkbox value="a">A</Checkbox>
      </CheckboxGroup>
    );
    expect(screen.queryByText("Elige al menos uno")).not.toBeInTheDocument();

    rerender(
      <CheckboxGroup label="g" invalid errorMessage="Elige al menos uno">
        <Checkbox value="a">A</Checkbox>
      </CheckboxGroup>
    );
    const error = screen.getByText("Elige al menos uno");

    expect(error).toHaveClass(checkbox.part.groupErrorMessage);
    expect(screen.getByRole("group").getAttribute("aria-describedby")).toContain(error.id);
  });
});
