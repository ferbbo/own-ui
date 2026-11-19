import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dropdown from "../src/Dropdown";

// Tests enfocados en componentes principales y casos comunes
describe("Dropdown", () => {
  // Test básico: renderizado
  test("renders dropdown with trigger and menu", () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option 1</Dropdown.Item>
          <Dropdown.Item>Option 2</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    expect(screen.getByText("Open Menu")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  // Test de interacción: click en trigger
  test("opens menu when trigger is clicked", () => {
    render(
      <Dropdown>
        <Dropdown.Trigger>Open Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option 1</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const trigger = screen.getByText("Open Menu");

    // Menu debe estar oculto inicialmente
    expect(screen.queryByText("Option 1")).not.toBeInTheDocument();

    // Click en trigger debe abrir el menu
    fireEvent.click(trigger);
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  // Test de selección de items
  test("calls onSelect when item is clicked", () => {
    const handleSelect = jest.fn();

    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onSelect={handleSelect}>Option 1</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const item = screen.getByText("Option 1");
    fireEvent.click(item);

    expect(handleSelect).toHaveBeenCalledTimes(1);
  });

  // Test de variantes
  // El contrato (variants/dropdown.ts + css/dropdown.css) coloca variante y
  // tamaño en el CONTENEDOR como `dropdown-*`, no en el trigger como `btn-*`:
  // el trigger sólo lleva `dropdown-trigger`. Las expectativas originales
  // (`btn-primary` / `btn-lg` sobre el trigger) contradecían las tres capas del
  // contrato, así que se corrigen aquí. Que el trigger no herede ningún estilo
  // semántico es un hallazgo del lote 6 (ver specs/lote-2.md, G-01).
  test("applies variant classes correctly", () => {
    const { container } = render(
      <Dropdown variant="primary" defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    expect(container.firstChild).toHaveClass("dropdown", "dropdown-primary");
    expect(screen.getByRole("menu")).toHaveClass("dropdown-menu-primary");
    expect(screen.getByText("Menu")).toHaveClass("dropdown-trigger");
  });

  // Test de tamaños
  test("applies size classes correctly", () => {
    const { container } = render(
      <Dropdown size="lg" defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    expect(container.firstChild).toHaveClass("dropdown", "dropdown-lg");
    expect(screen.getByRole("menu")).toHaveClass("dropdown-menu-lg");
  });

  // Test de estado controlado
  test("works as controlled component", () => {
    const handleOpenChange = jest.fn();

    const ControlledDropdown = () => {
      const [open, setOpen] = React.useState(false);

      return (
        <Dropdown
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            handleOpenChange(isOpen);
          }}
        >
          <Dropdown.Trigger>Menu</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Option</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    };

    render(<ControlledDropdown />);

    const trigger = screen.getByText("Menu");
    fireEvent.click(trigger);

    expect(handleOpenChange).toHaveBeenCalledWith(true);
  });

  // Test de item seleccionado
  test("shows selected item with correct styling", () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item selected>Selected Option</Dropdown.Item>
          <Dropdown.Item>Regular Option</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const selectedItem = screen.getByText("Selected Option");
    const regularItem = screen.getByText("Regular Option");

    expect(selectedItem).toHaveClass("dropdown-item-selected");
    expect(regularItem).not.toHaveClass("dropdown-item-selected");
  });

  // Test de accesibilidad básica
  test("has proper ARIA attributes", () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const trigger = screen.getByText("Menu");
    const menu = screen.getByRole("menu");

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(menu).toBeInTheDocument();
  });

  // AGENTS.md §9.8: DropdownContainer hace {...restProps} sobre el <div>, así
  // que las props de configuración acaban como atributos inválidos en el HTML y
  // React avisa por consola. Arreglarlo es alcance del lote 7; este test es el
  // marcador: dejará de pasar (test.failing) cuando se cierre la fuga.
  test.failing("no debería filtrar props de configuración al DOM (lote 7)", () => {
    const { container } = render(
      <Dropdown variant="primary" size="lg" defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const root = container.firstChild as HTMLElement;
    expect(root.hasAttribute("variant")).toBe(false);
    expect(root.hasAttribute("size")).toBe(false);
    expect(root.hasAttribute("defaultopen")).toBe(false);
  });
});
