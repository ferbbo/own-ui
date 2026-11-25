import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Radio from "../src/Radio";
import RadioGroup from "../src/RadioGroup";
import { radio } from "@ownui/tw-theme/variants";

/**
 * Tests del Radio y del RadioGroup (lote 11).
 *
 * El grupo es el componente de verdad, asi que casi todo se prueba desde el.
 * El input esta oculto visualmente pero presente en el arbol de
 * accesibilidad: todo se busca por rol.
 */

function boxOf(input: HTMLElement): HTMLElement {
  const box = input.parentElement?.querySelector(`.${radio.part.box}`);
  if (!box) throw new Error("No se encontro el circulo del radio");
  return box as HTMLElement;
}

function Group(props: { onChange?: (value: string) => void; defaultValue?: string }) {
  return (
    <RadioGroup label="Tamaño" defaultValue={props.defaultValue} onChange={props.onChange}>
      <Radio value="sm">Pequeño</Radio>
      <Radio value="md">Mediano</Radio>
      <Radio value="lg">Grande</Radio>
    </RadioGroup>
  );
}

describe("Radio", () => {
  describe("render y contrato de clases", () => {
    it("monta un input accesible con su circulo, su punto y su texto", () => {
      render(<Group />);
      const input = screen.getByRole("radio", { name: "Pequeño" });

      expect(input.tagName).toBe("INPUT");
      expect(input).toHaveClass(radio.part.input);
      expect(boxOf(input)).toHaveClass(radio.part.box);
      expect(boxOf(input).querySelector(`.${radio.part.mark}`)).toBeInTheDocument();
      expect(screen.getByText("Pequeño")).toHaveClass(radio.part.label);
    });

    it("el circulo queda fuera del arbol de accesibilidad", () => {
      render(<Group />);
      expect(boxOf(screen.getByRole("radio", { name: "Pequeño" }))).toHaveAttribute(
        "aria-hidden",
        "true"
      );
    });

    it.each(Object.entries(radio.theme))("aplica la clase del rol %s", (theme, expected) => {
      render(
        <RadioGroup label="g" theme={theme as keyof typeof radio.theme}>
          <Radio value="a">A</Radio>
        </RadioGroup>
      );
      expect(boxOf(screen.getByRole("radio"))).toHaveClass(expected);
    });

    it.each(Object.entries(radio.size))("aplica la clase del tamano %s", (size, expected) => {
      render(
        <RadioGroup label="g" size={size as keyof typeof radio.size}>
          <Radio value="a">A</Radio>
        </RadioGroup>
      );
      const input = screen.getByRole("radio");

      expect(boxOf(input)).toHaveClass(expected);
      expect(input.parentElement).toHaveClass(expected);
    });

    it("una opcion puede pisar el rol del grupo", () => {
      render(
        <RadioGroup label="g" theme="success">
          <Radio value="a" theme="error">
            A
          </Radio>
        </RadioGroup>
      );
      expect(boxOf(screen.getByRole("radio"))).toHaveClass(radio.theme.error);
    });
  });

  describe("eleccion", () => {
    it("elegir una opcion deselecciona la anterior", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<Group defaultValue="sm" onChange={onChange} />);

      expect(screen.getByRole("radio", { name: "Pequeño" })).toBeChecked();

      await user.click(screen.getByRole("radio", { name: "Grande" }));

      expect(screen.getByRole("radio", { name: "Grande" })).toBeChecked();
      expect(screen.getByRole("radio", { name: "Pequeño" })).not.toBeChecked();
      expect(onChange).toHaveBeenLastCalledWith("lg");
    });

    it("la opcion elegida lleva la clase de marcada", async () => {
      const user = userEvent.setup();
      render(<Group />);

      await user.click(screen.getByRole("radio", { name: "Mediano" }));

      expect(boxOf(screen.getByRole("radio", { name: "Mediano" }))).toHaveClass(
        radio.state.checked
      );
      expect(boxOf(screen.getByRole("radio", { name: "Grande" }))).not.toHaveClass(
        radio.state.checked
      );
    });

    it("pulsar el texto elige la opcion", async () => {
      const user = userEvent.setup();
      render(<Group />);

      await user.click(screen.getByText("Grande"));

      expect(screen.getByRole("radio", { name: "Grande" })).toBeChecked();
    });

    it("controlado desde fuera", async () => {
      const user = userEvent.setup();

      function Controlled() {
        const [value, setValue] = useState("sm");
        return (
          <RadioGroup label="Tamaño" value={value} onChange={setValue}>
            <Radio value="sm">Pequeño</Radio>
            <Radio value="lg">Grande</Radio>
          </RadioGroup>
        );
      }

      render(<Controlled />);
      await user.click(screen.getByRole("radio", { name: "Grande" }));

      expect(screen.getByRole("radio", { name: "Grande" })).toBeChecked();
    });
  });

  describe("teclado: el grupo es una sola parada de tabulacion", () => {
    it("Tab entra al grupo y las flechas recorren las opciones", async () => {
      const user = userEvent.setup();
      render(<Group defaultValue="sm" />);

      await user.tab();
      expect(screen.getByRole("radio", { name: "Pequeño" })).toHaveFocus();

      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("radio", { name: "Mediano" })).toHaveFocus();
      expect(screen.getByRole("radio", { name: "Mediano" })).toBeChecked();

      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("radio", { name: "Grande" })).toHaveFocus();

      // Circular: desde la ultima, la siguiente es la primera.
      await user.keyboard("{ArrowDown}");
      expect(screen.getByRole("radio", { name: "Pequeño" })).toHaveFocus();
    });

    it("tabindex rotatorio: solo la opcion elegida es tabulable", () => {
      render(<Group defaultValue="md" />);

      expect(screen.getByRole("radio", { name: "Mediano" })).toHaveAttribute("tabindex", "0");
      expect(screen.getByRole("radio", { name: "Pequeño" })).toHaveAttribute("tabindex", "-1");
      expect(screen.getByRole("radio", { name: "Grande" })).toHaveAttribute("tabindex", "-1");
    });
  });

  describe("estados", () => {
    it("`disabled` en el grupo deshabilita todas las opciones", () => {
      render(
        <RadioGroup label="g" disabled>
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      );

      for (const input of screen.getAllByRole("radio")) {
        expect(input).toBeDisabled();
        expect(boxOf(input)).toHaveClass(radio.state.disabled);
      }
    });

    it("`disabled` en una opcion no afecta a sus hermanas", async () => {
      const user = userEvent.setup();
      render(
        <RadioGroup label="g">
          <Radio value="a">Disponible</Radio>
          <Radio value="b" disabled>
            Agotada
          </Radio>
        </RadioGroup>
      );

      await user.click(screen.getByRole("radio", { name: "Agotada" }));
      expect(screen.getByRole("radio", { name: "Agotada" })).not.toBeChecked();

      await user.click(screen.getByRole("radio", { name: "Disponible" }));
      expect(screen.getByRole("radio", { name: "Disponible" })).toBeChecked();
    });

    it("`invalid` pinta todas las opciones y anuncia el error", () => {
      render(
        <RadioGroup label="g" invalid errorMessage="Elige una">
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      );
      const error = screen.getByText("Elige una");

      expect(error).toHaveClass(radio.part.groupErrorMessage);
      for (const input of screen.getAllByRole("radio")) {
        expect(boxOf(input)).toHaveClass(radio.state.invalid);
      }
    });
  });

  describe("ref", () => {
    it("`forwardRef` expone el `<input>`", () => {
      const ref = createRef<HTMLInputElement>();
      render(
        <RadioGroup label="g">
          <Radio value="a" ref={ref}>
            A
          </Radio>
        </RadioGroup>
      );

      expect(ref.current).toBe(screen.getByRole("radio"));
    });
  });
});

describe("RadioGroup", () => {
  it("expone un radiogroup con su nombre accesible", () => {
    render(<Group />);
    expect(screen.getByRole("radiogroup", { name: "Tamaño" })).toBeInTheDocument();
  });

  it("la ayuda se anuncia por aria-describedby", () => {
    render(
      <RadioGroup label="Tamaño" description="Puedes cambiarlo luego.">
        <Radio value="a">A</Radio>
      </RadioGroup>
    );
    const group = screen.getByRole("radiogroup");
    const description = screen.getByText("Puedes cambiarlo luego.");

    expect(description).toHaveClass(radio.part.groupDescription);
    expect(group.getAttribute("aria-describedby")).toContain(description.id);
  });

  it("el error solo se muestra con `invalid`", () => {
    render(
      <RadioGroup label="g" errorMessage="Elige una">
        <Radio value="a">A</Radio>
      </RadioGroup>
    );
    expect(screen.queryByText("Elige una")).not.toBeInTheDocument();
  });

  it("un `<Radio>` fuera de un grupo falla rapido y explica por que", () => {
    // El error de React en consola es esperado: lo que se comprueba es que
    // el componente no se renderiza a medias con un estado imposible.
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Radio value="a">Suelto</Radio>)).toThrow(/dentro de un <RadioGroup>/);

    spy.mockRestore();
  });
});
