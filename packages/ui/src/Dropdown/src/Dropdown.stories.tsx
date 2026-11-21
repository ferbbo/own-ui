import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Dropdown from "./Dropdown";
import {
  DropdownProps,
  DropdownStyleVariant,
  DropdownVariant,
  DropdownSize,
} from "./Dropdown.types";

/**
 * Las variantes, tamaños y variantes de estilo se listan desde los tipos, que
 * son la misma fuente que cruza el test de contrato del plugin
 * (`packages/tw-theme/src/__tests__/dropdown-contract.test.ts`): si mañana
 * se añade un rol al tipo y no al CSS, falla ese test, no estas stories.
 */
const VARIANTS: readonly DropdownVariant[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const SIZES: readonly DropdownSize[] = ["xs", "sm", "md", "lg", "xl"];

const STYLE_VARIANTS: readonly DropdownStyleVariant[] = ["ghost", "bordered", "compact"];

/**
 * Desde el lote 6 el menú es un panel absoluto (`position: absolute`) que flota
 * sobre el contenido en vez de empujarlo. Las stories que muestran varios
 * dropdowns abiertos a la vez necesitan sitio debajo para que los paneles no se
 * solapen con el texto que viene después.
 */
const openRowClass = "flex flex-wrap items-start gap-4 pb-56";

const meta: Meta<DropdownProps> = {
  title: "Components/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Dropdown permite a los usuarios seleccionar de una lista de opciones con soporte para temas semánticos.",
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: VARIANTS,
      description: "Variante semántica del dropdown (los 8 roles del tema)",
    },
    size: {
      control: { type: "select" },
      options: SIZES,
      description: "Tamaño del dropdown",
    },
    styleVariant: {
      control: { type: "select" },
      options: STYLE_VARIANTS,
      description: "Variante de estilo del dropdown",
    },
    defaultOpen: {
      control: { type: "boolean" },
      description: "Estado inicial del dropdown (no controlado)",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<DropdownProps>;

// Story 1: Default - Caso más básico
export const Default: Story = {
  args: {},
  render: (args) => (
    <Dropdown {...args}>
      <Dropdown.Trigger>Opciones</Dropdown.Trigger>
      <Dropdown.Menu>
        <Dropdown.Item>Editar</Dropdown.Item>
        <Dropdown.Item>Duplicar</Dropdown.Item>
        <Dropdown.Item>Eliminar</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  ),
};

// Story 2: All Variants - Las 8 variantes semánticas
export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Las 8 variantes semánticas del tema. Antes del lote 6 sólo cuatro " +
          "(primary/secondary/accent/neutral) tenían CSS: info, success, warning " +
          "y error se emitían como clase sin ninguna regla detrás.",
      },
    },
  },
  render: () => (
    <div className={openRowClass}>
      {VARIANTS.map((variant) => (
        <Dropdown key={variant} variant={variant} defaultOpen>
          <Dropdown.Trigger>{variant}</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Opción 1</Dropdown.Item>
            <Dropdown.Item selected>Opción 2</Dropdown.Item>
            <Dropdown.Item disabled>Opción 3</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ))}
    </div>
  ),
};

// Story 3: All Sizes - Los 5 tamaños
export const AllSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Los 5 tamaños. La altura del trigger sigue la misma escala que `.btn` " +
          "(xs=6, sm=8, md=10, lg=12, xl=14 × `--size-field`).",
      },
    },
  },
  render: () => (
    <div className={openRowClass}>
      {SIZES.map((size) => (
        <Dropdown key={size} size={size} variant="primary" defaultOpen>
          <Dropdown.Trigger>Tamaño {size}</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Pequeño</Dropdown.Item>
            <Dropdown.Item>Mediano</Dropdown.Item>
            <Dropdown.Item>Grande</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ))}
    </div>
  ),
};

// Story 4: Style Variants - Variantes de estilo
export const StyleVariants: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Las 3 variantes de estilo, que desde el lote 6 se aplican al panel y " +
          "no al wrapper: `ghost` quita superficie y elevación, `bordered` añade " +
          "el borde al panel y `compact` reduce su relleno.",
      },
    },
  },
  render: () => (
    <div className={openRowClass}>
      {STYLE_VARIANTS.map((styleVariant) => (
        <Dropdown key={styleVariant} styleVariant={styleVariant} defaultOpen>
          <Dropdown.Trigger>{styleVariant}</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Opción 1</Dropdown.Item>
            <Dropdown.Item>Opción 2</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ))}
    </div>
  ),
};

/**
 * Las stories con estado se escriben como componentes y no como cuerpo de
 * `render`: un hook dentro de `render` incumple las reglas de los hooks
 * (`react-hooks/rules-of-hooks`), que es un error de ESLint, no un aviso.
 */
const SelectionDemo = () => {
  const [selected, setSelected] = useState("opcion1");

  const labels: Record<string, string> = {
    opcion1: "Nombre",
    opcion2: "Fecha",
    opcion3: "Tamaño",
  };

  return (
    <div className="pb-56">
      <Dropdown variant="primary">
        <Dropdown.Trigger>Ordenar por: {labels[selected]}</Dropdown.Trigger>
        <Dropdown.Menu>
          {Object.entries(labels).map(([value, label]) => (
            <Dropdown.Item
              key={value}
              selected={selected === value}
              onSelect={() => setSelected(value)}
            >
              {label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

// Story 5: With Selection - Con selección
export const WithSelection: Story = {
  parameters: {
    docs: {
      description: {
        story: "Dropdown con items seleccionados y callbacks de selección",
      },
    },
  },
  render: () => <SelectionDemo />,
};

const ControlledDemo = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-4 pb-56">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-3 py-1 bg-gray-200 rounded text-sm"
        >
          {isOpen ? "Cerrar" : "Abrir"} desde afuera
        </button>
        <span className="text-sm text-gray-600">Estado: {isOpen ? "Abierto" : "Cerrado"}</span>
      </div>

      <Dropdown open={isOpen} onOpenChange={setIsOpen} variant="secondary">
        <Dropdown.Trigger>Dropdown Controlado</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Acción 1</Dropdown.Item>
          <Dropdown.Item>Acción 2</Dropdown.Item>
          <Dropdown.Item>Acción 3</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

// Story 6: Controlled - Controlado
export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story: "Dropdown controlado con estado externo para casos avanzados",
      },
    },
  },
  render: () => <ControlledDemo />,
};

// Story 7: Disabled - Estados deshabilitados
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: "Dropdown con elementos deshabilitados",
      },
    },
  },
  render: () => (
    <div className={openRowClass}>
      <Dropdown variant="primary">
        <Dropdown.Trigger disabled>Trigger Deshabilitado</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>No accesible</Dropdown.Item>
          <Dropdown.Item>No accesible</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Dropdown variant="secondary" defaultOpen>
        <Dropdown.Trigger>Con items deshabilitados</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Opción normal</Dropdown.Item>
          <Dropdown.Item disabled>Opción deshabilitada</Dropdown.Item>
          <Dropdown.Item>Otra opción normal</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  ),
};

const USERS: Record<string, { name: string; role: string }> = {
  juan: { name: "Juan Pérez", role: "Admin" },
  maria: { name: "María García", role: "Editor" },
  carlos: { name: "Carlos López", role: "Viewer" },
};

const RealWorldDemo = () => {
  const [user, setUser] = useState("juan");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm max-w-md pb-56">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Panel de Usuario</h3>
        <Dropdown open={isOpen} onOpenChange={setIsOpen} variant="primary" size="sm">
          <Dropdown.Trigger>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                {USERS[user].name.charAt(0)}
              </div>
              <span className="text-sm">{USERS[user].name}</span>
            </div>
          </Dropdown.Trigger>
          <Dropdown.Menu>
            {Object.entries(USERS).map(([key, userData]) => (
              <Dropdown.Item
                key={key}
                selected={user === key}
                onSelect={() => {
                  setUser(key);
                  setIsOpen(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{userData.name}</span>
                  <span className="text-xs">{userData.role}</span>
                </div>
              </Dropdown.Item>
            ))}
            <Dropdown.Item>Cerrar sesión</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <p className="text-sm text-gray-600">
        Usuario actual: <strong>{USERS[user].name}</strong> ({USERS[user].role})
      </p>
    </div>
  );
};

// Story 8: Real World Example - Ejemplo del mundo real
export const RealWorldExample: Story = {
  parameters: {
    docs: {
      description: {
        story: "Ejemplo práctico de uso en una aplicación real",
      },
    },
  },
  render: () => <RealWorldDemo />,
};
