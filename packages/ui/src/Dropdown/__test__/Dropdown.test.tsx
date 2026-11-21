import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Dropdown from "../src/Dropdown";

/** Dropdown abierto con tres items, el del medio deshabilitado. */
const renderOpenMenu = (onSelect?: () => void) =>
  render(
    <Dropdown defaultOpen>
      <Dropdown.Trigger>Menu</Dropdown.Trigger>
      <Dropdown.Menu>
        <Dropdown.Item onSelect={onSelect}>Uno</Dropdown.Item>
        <Dropdown.Item disabled>Dos</Dropdown.Item>
        <Dropdown.Item>Tres</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );

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
  // El contrato coloca variante y tamaño en el CONTENEDOR como `dropdown-*`,
  // y desde el lote 6 (D-08) el trigger **además** compone las clases del
  // Button: `btn btn-{rol} btn-{tamaño} dropdown-trigger`. Era el hallazgo
  // G-01 de specs/lote-2.md — el trigger no heredaba ningún estilo semántico —
  // y se resolvió reutilizando `.btn` en vez de duplicar su superficie.
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
    expect(screen.getByText("Menu")).toHaveClass("dropdown-trigger", "btn", "btn-primary");
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
    // El tamaño del trigger sale del contrato del Button (D-08).
    expect(screen.getByText("Menu")).toHaveClass("btn-lg");
  });

  // El estado abierto se marca en el trigger, para que `dropdown.css` pueda
  // remapear los tokens de `.btn` sin duplicar la receta de color (D-08).
  test("marks the trigger as active while the menu is open", () => {
    render(
      <Dropdown defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    expect(screen.getByText("Menu")).toHaveClass("dropdown-trigger-active");
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

  // AGENTS.md §9.8: DropdownContainer hacía {...restProps} sobre el <div>, así
  // que las props de configuración acababan como atributos inválidos en el HTML
  // y React avisaba por consola. El lote 2 dejó este test como `test.failing`
  // para que avisara al cerrarse la fuga; el lote 7 la cierra, así que pasa a
  // ser un test normal. AC2.
  test("no filtra props de configuración al DOM", () => {
    const { container } = render(
      <Dropdown variant="primary" size="lg" styleVariant="bordered" defaultOpen>
        <Dropdown.Trigger>Menu</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Option</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );

    const root = container.firstChild as HTMLElement;
    for (const attr of ["variant", "size", "stylevariant", "defaultopen", "open", "onopenchange"]) {
      expect(root.hasAttribute(attr)).toBe(false);
    }

    // Y las que sí son del DOM siguen llegando: la clase se compone, no se pisa.
    expect(root).toHaveClass("dropdown", "dropdown-primary", "dropdown-lg", "dropdown-bordered");
  });

  // ───────────────────────────────────────────────────────────────────────
  // Lote 7 — accesibilidad e higiene de props
  // ───────────────────────────────────────────────────────────────────────

  // AC1. El test que de verdad cierra la fuga de props: no basta con mirar los
  // atributos del HTML, porque React avisa por `console.error` también de
  // props desconocidas en los hijos. Si vuelve cualquier aviso, falla.
  test("AC1: renderizar no emite ningún warning de React", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    try {
      render(
        <Dropdown
          variant="success"
          size="sm"
          styleVariant="ghost"
          defaultOpen
          onOpenChange={() => {}}
        >
          <Dropdown.Trigger>Menu</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item selected>Uno</Dropdown.Item>
            <Dropdown.Item disabled>Dos</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  // AC5
  test("AC5: aria-controls del trigger es el id del menú", () => {
    renderOpenMenu();

    const trigger = screen.getByText("Menu");
    const menu = screen.getByRole("menu");

    expect(menu.id).toBeTruthy();
    expect(trigger).toHaveAttribute("aria-controls", menu.id);
    // Y el enlace es recíproco: el menú se etiqueta con el trigger.
    expect(menu).toHaveAttribute("aria-labelledby", trigger.id);
  });

  test("dos dropdowns en la misma página no comparten ids", () => {
    render(
      <>
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Uno</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>A</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Dos</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>B</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );

    const [first, second] = screen.getAllByRole("menu");
    expect(first.id).not.toBe(second.id);
  });

  describe("AC3: teclado", () => {
    test("al abrir, el foco entra en el primer item", () => {
      renderOpenMenu();

      expect(screen.getByText("Uno")).toHaveFocus();
    });

    test("al abrir, el foco va al item seleccionado si hay uno", () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Menu</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Uno</Dropdown.Item>
            <Dropdown.Item selected>Dos</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      expect(screen.getByText("Dos")).toHaveFocus();
    });

    test("ArrowDown baja y salta los deshabilitados", () => {
      renderOpenMenu();
      const menu = screen.getByRole("menu");

      fireEvent.keyDown(menu, { key: "ArrowDown" });

      // "Dos" está disabled: el foco se lo salta y aterriza en "Tres".
      expect(screen.getByText("Tres")).toHaveFocus();
    });

    test("ArrowUp sube y hace la vuelta por el final", () => {
      renderOpenMenu();
      const menu = screen.getByRole("menu");

      fireEvent.keyDown(menu, { key: "ArrowUp" });

      expect(screen.getByText("Tres")).toHaveFocus();
    });

    test("ArrowDown hace la vuelta por el principio", () => {
      renderOpenMenu();
      const menu = screen.getByRole("menu");

      fireEvent.keyDown(menu, { key: "End" });
      fireEvent.keyDown(menu, { key: "ArrowDown" });

      expect(screen.getByText("Uno")).toHaveFocus();
    });

    test("Home y End van al primero y al último habilitado", () => {
      renderOpenMenu();
      const menu = screen.getByRole("menu");

      fireEvent.keyDown(menu, { key: "End" });
      expect(screen.getByText("Tres")).toHaveFocus();

      fireEvent.keyDown(menu, { key: "Home" });
      expect(screen.getByText("Uno")).toHaveFocus();
    });

    test("Enter selecciona, cierra y devuelve el foco al trigger", () => {
      const onSelect = jest.fn();
      renderOpenMenu(onSelect);

      fireEvent.keyDown(screen.getByText("Uno"), { key: "Enter" });

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(screen.getByText("Menu")).toHaveFocus();
    });

    test("Space selecciona igual que Enter", () => {
      const onSelect = jest.fn();
      renderOpenMenu(onSelect);

      fireEvent.keyDown(screen.getByText("Tres"), { key: " " });

      expect(onSelect).not.toHaveBeenCalled(); // "Tres" no lleva onSelect
      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    test("un item deshabilitado no selecciona con Enter", () => {
      const onSelect = jest.fn();
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Menu</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item disabled onSelect={onSelect}>
              Dos
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      fireEvent.keyDown(screen.getByText("Dos"), { key: "Enter" });

      expect(onSelect).not.toHaveBeenCalled();
      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    test("Esc cierra y devuelve el foco al trigger", () => {
      renderOpenMenu();

      fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      expect(screen.getByText("Menu")).toHaveFocus();
    });

    test("Tab cierra sin robar el foco de vuelta", () => {
      renderOpenMenu();

      fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" });

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
      // El usuario va al siguiente elemento de la página: el trigger NO
      // recupera el foco (sería retroceder en vez de avanzar).
      expect(screen.getByText("Menu")).not.toHaveFocus();
    });

    test("ArrowDown en el trigger abre el menú", () => {
      render(
        <Dropdown>
          <Dropdown.Trigger>Menu</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Uno</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();

      fireEvent.keyDown(screen.getByText("Menu"), { key: "ArrowDown" });

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(screen.getByText("Uno")).toHaveFocus();
    });

    test("los items no están en el orden de tabulación", () => {
      renderOpenMenu();

      // Patrón de menú de la APG: el único punto de entrada por Tab es el
      // trigger; dentro del menú el foco se mueve con las flechas.
      for (const label of ["Uno", "Dos", "Tres"]) {
        expect(screen.getByText(label)).toHaveAttribute("tabindex", "-1");
      }
    });
  });

  describe("AC4 y AC6: click fuera y limpieza del listener", () => {
    test("AC4: un click fuera cierra el menú", () => {
      render(
        <div>
          <Dropdown defaultOpen>
            <Dropdown.Trigger>Menu</Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Item>Uno</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <button type="button">Fuera</button>
        </div>
      );

      fireEvent.pointerDown(screen.getByText("Fuera"));

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    test("un click fuera NO devuelve el foco al trigger", () => {
      render(
        <div>
          <Dropdown defaultOpen>
            <Dropdown.Trigger>Menu</Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Item>Uno</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <button type="button">Fuera</button>
        </div>
      );

      fireEvent.pointerDown(screen.getByText("Fuera"));

      expect(screen.getByText("Menu")).not.toHaveFocus();
    });

    test("un click dentro del menú no lo cierra", () => {
      render(
        <Dropdown defaultOpen>
          <Dropdown.Trigger>Menu</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Uno</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );

      fireEvent.pointerDown(screen.getByRole("menu"));

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    test("AC6: el listener se quita al desmontar", () => {
      const addSpy = jest.spyOn(document, "addEventListener");
      const removeSpy = jest.spyOn(document, "removeEventListener");

      try {
        const { unmount } = renderOpenMenu();

        const added = addSpy.mock.calls.filter(([type]) => type === "pointerdown");
        expect(added).toHaveLength(1);

        act(() => unmount());

        const removed = removeSpy.mock.calls.filter(([type]) => type === "pointerdown");
        expect(removed).toHaveLength(1);
        // El handler que se quita es el mismo que se puso: si no, el listener
        // seguiría vivo y el test de arriba no lo notaría.
        expect(removed[0][1]).toBe(added[0][1]);
      } finally {
        addSpy.mockRestore();
        removeSpy.mockRestore();
      }
    });

    test("el listener no se registra mientras está cerrado", () => {
      const addSpy = jest.spyOn(document, "addEventListener");

      try {
        render(
          <Dropdown>
            <Dropdown.Trigger>Menu</Dropdown.Trigger>
            <Dropdown.Menu>
              <Dropdown.Item>Uno</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        );

        // Un dropdown cerrado no debe pagar un listener de documento.
        expect(addSpy.mock.calls.filter(([type]) => type === "pointerdown")).toHaveLength(0);
      } finally {
        addSpy.mockRestore();
      }
    });
  });
});
