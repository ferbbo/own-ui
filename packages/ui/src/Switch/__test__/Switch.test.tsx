import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Switch from "../src/Switch";
import { switch as switchVariants } from "@ownui/tw-theme/variants";

/**
 * Tests del Switch (lote 11).
 *
 * Lo que distingue a un switch de un checkbox no es como se ve, es lo que
 * anuncia: `role="switch"`, que un lector de pantalla lee como
 * "activado/desactivado" en vez de "marcado". Los tests buscan por ese rol,
 * asi que si algun dia se perdiera, se caerian.
 */

/** La pista es el `<span>` hermano del input dentro del `<label>`. */
function trackOf(input: HTMLElement): HTMLElement {
  const track = input.parentElement?.querySelector(`.${switchVariants.part.box}`);
  if (!track) throw new Error("No se encontro la pista del switch");
  return track as HTMLElement;
}

describe("Switch", () => {
  describe("render y contrato de clases", () => {
    it("se anuncia como switch, no como checkbox", () => {
      render(<Switch>Notificaciones</Switch>);

      expect(screen.getByRole("switch", { name: "Notificaciones" })).toBeInTheDocument();
      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });

    it("monta input oculto visualmente, pista, pulgar y texto", () => {
      render(<Switch>Notificaciones</Switch>);
      const input = screen.getByRole("switch");
      const track = trackOf(input);

      expect(input).toHaveClass(switchVariants.part.input);
      expect(track).toHaveClass(switchVariants.part.box);
      expect(track.querySelector(`.${switchVariants.part.thumb}`)).toBeInTheDocument();
      expect(screen.getByText("Notificaciones")).toHaveClass(switchVariants.part.label);
    });

    it("la pista queda fuera del arbol de accesibilidad", () => {
      render(<Switch>x</Switch>);
      expect(trackOf(screen.getByRole("switch"))).toHaveAttribute("aria-hidden", "true");
    });

    it("aplica el rol por defecto `primary` y el tamano `md`", () => {
      render(<Switch>x</Switch>);
      const track = trackOf(screen.getByRole("switch"));

      expect(track).toHaveClass(switchVariants.theme.primary);
      expect(track).toHaveClass(switchVariants.size.md);
    });

    it.each(Object.entries(switchVariants.theme))(
      "aplica la clase del rol %s",
      (theme, expected) => {
        render(<Switch theme={theme as keyof typeof switchVariants.theme}>x</Switch>);
        expect(trackOf(screen.getByRole("switch"))).toHaveClass(expected);
      }
    );

    it.each(Object.entries(switchVariants.size))(
      "aplica la clase del tamano %s",
      (size, expected) => {
        render(<Switch size={size as keyof typeof switchVariants.size}>x</Switch>);
        const input = screen.getByRole("switch");

        expect(trackOf(input)).toHaveClass(expected);
        expect(input.parentElement).toHaveClass(expected);
      }
    );
  });

  describe("encender y apagar", () => {
    it("no controlado: alterna al pulsar y avisa con el valor", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(<Switch onChange={onChange}>Notificaciones</Switch>);
      const input = screen.getByRole("switch");

      await user.click(input);

      expect(input).toBeChecked();
      expect(onChange).toHaveBeenLastCalledWith(true);
      expect(trackOf(input)).toHaveClass(switchVariants.state.checked);

      await user.click(input);

      expect(input).not.toBeChecked();
      expect(onChange).toHaveBeenLastCalledWith(false);
    });

    it("pulsar el texto lo alterna: el <label> envuelve a los dos", async () => {
      const user = userEvent.setup();
      render(<Switch>Notificaciones</Switch>);

      await user.click(screen.getByText("Notificaciones"));

      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("respeta `defaultChecked`", () => {
      render(<Switch defaultChecked>x</Switch>);
      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("controlado: no cambia si el consumidor no lo cambia", async () => {
      const onChange = jest.fn();
      const user = userEvent.setup();
      render(
        <Switch checked={false} onChange={onChange}>
          x
        </Switch>
      );

      await user.click(screen.getByRole("switch"));

      expect(screen.getByRole("switch")).not.toBeChecked();
      expect(onChange).toHaveBeenCalledWith(true);
    });

    it("controlado de verdad: el consumidor manda", async () => {
      const user = userEvent.setup();

      function Controlled() {
        const [on, setOn] = useState(false);
        return (
          <Switch checked={on} onChange={setOn}>
            Modo oscuro
          </Switch>
        );
      }

      render(<Controlled />);
      await user.click(screen.getByRole("switch"));

      expect(screen.getByRole("switch")).toBeChecked();
    });

    it("se alterna con la barra espaciadora", async () => {
      const user = userEvent.setup();
      render(<Switch>x</Switch>);

      await user.tab();
      expect(screen.getByRole("switch")).toHaveFocus();

      await user.keyboard(" ");
      expect(screen.getByRole("switch")).toBeChecked();
    });
  });

  describe("estados", () => {
    it("`disabled` impide alternar y marca la pista", async () => {
      const user = userEvent.setup();
      render(<Switch disabled>x</Switch>);
      const input = screen.getByRole("switch");

      await user.click(input);

      expect(input).toBeDisabled();
      expect(input).not.toBeChecked();
      expect(trackOf(input)).toHaveClass(switchVariants.state.disabled);
    });

    it("`readOnly` deja el control enfocable pero no editable", async () => {
      const user = userEvent.setup();
      render(<Switch readOnly>x</Switch>);
      const input = screen.getByRole("switch");

      await user.click(input);

      expect(input).not.toBeChecked();
      expect(input).toHaveAttribute("aria-readonly", "true");
    });

    it("`invalid` marca aria-invalid y pinta el contorno de error", () => {
      render(<Switch invalid>x</Switch>);
      const input = screen.getByRole("switch");

      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(trackOf(input)).toHaveClass(switchVariants.state.invalid);
    });
  });

  describe("ref", () => {
    it("`forwardRef` expone el `<input>`, no el `<label>`", () => {
      const ref = createRef<HTMLInputElement>();
      render(<Switch ref={ref}>x</Switch>);

      expect(ref.current).toBe(screen.getByRole("switch"));
      expect(ref.current?.tagName).toBe("INPUT");
    });
  });
});
