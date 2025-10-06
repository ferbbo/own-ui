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
  test("applies variant classes correctly", () => {
    render(
      <Dropdown variant="primary" defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const trigger = screen.getByText("Menu");
    expect(trigger).toHaveClass("btn-primary");
  });

  // Test de tamaños
  test("applies size classes correctly", () => {
    render(
      <Dropdown size="lg" defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const trigger = screen.getByText("Menu");
    expect(trigger).toHaveClass("btn-lg");
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
});