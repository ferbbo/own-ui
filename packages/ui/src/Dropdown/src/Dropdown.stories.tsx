import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Dropdown from "./Dropdown";
import { DropdownProps } from "./Dropdown.types";

const meta: Meta<DropdownProps> = {
  title: "Components/Dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Dropdown permite a los usuarios seleccionar de una lista de opciones con soporte para temas semánticos."
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["primary", "secondary", "success", "warning", "error"],
      description: "Variante visual del dropdown"
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
      description: "Tamaño del dropdown"
    },
    styleVariant: {
      control: { type: "select" },
      options: ["ghost", "bordered", "compact"],
      description: "Variante de estilo del dropdown"
    },
    defaultOpen: {
      control: { type: "boolean" },
      description: "Estado inicial del dropdown (no controlado)"
    }
  },
  tags: ["autodocs"]
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
  )
};

// Story 2: All Variants - Todas las variantes
export const AllVariants: Story = {
  parameters: {
    docs: {
      description: {
        story: "Muestra todas las variantes disponibles del dropdown"
      }
    }
  },
  render: () => (
    <div className="flex gap-4 flex-wrap">
      {(["primary", "secondary", "success", "warning", "error"] as const).map(variant => (
        <Dropdown key={variant} variant={variant}>
          <Dropdown.Trigger>{variant}</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Opción 1</Dropdown.Item>
            <Dropdown.Item>Opción 2</Dropdown.Item>
            <Dropdown.Item>Opción 3</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ))}
    </div>
  )
};

// Story 3: All Sizes - Todos los tamaños
export const AllSizes: Story = {
  parameters: {
    docs: {
      description: {
        story: "Muestra todos los tamaños disponibles del dropdown"
      }
    }
  },
  render: () => (
    <div className="flex gap-4 items-center">
      {(["sm", "md", "lg"] as const).map(size => (
        <Dropdown key={size} size={size} variant="primary">
          <Dropdown.Trigger>Tamaño {size}</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item>Pequeño</Dropdown.Item>
            <Dropdown.Item>Mediano</Dropdown.Item>
            <Dropdown.Item>Grande</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      ))}
    </div>
  )
};

// Story 4: With Selection - Con selección
export const WithSelection: Story = {
  parameters: {
    docs: {
      description: {
        story: "Dropdown con items seleccionados y callbacks de selección"
      }
    }
  },
  render: () => {
    const [selected, setSelected] = useState("opcion1");
    
    return (
      <Dropdown variant="primary">
        <Dropdown.Trigger>
          Ordenar por: {selected === "opcion1" ? "Nombre" : selected === "opcion2" ? "Fecha" : "Tamaño"}
        </Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item 
            selected={selected === "opcion1"}
            onSelect={() => setSelected("opcion1")}
          >
            Nombre
          </Dropdown.Item>
          <Dropdown.Item 
            selected={selected === "opcion2"}
            onSelect={() => setSelected("opcion2")}
          >
            Fecha
          </Dropdown.Item>
          <Dropdown.Item 
            selected={selected === "opcion3"}
            onSelect={() => setSelected("opcion3")}
          >
            Tamaño
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
};

// Story 5: Controlled - Controlado
export const Controlled: Story = {
  parameters: {
    docs: {
      description: {
        story: "Dropdown controlado con estado externo para casos avanzados"
      }
    }
  },
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1 bg-gray-200 rounded text-sm"
          >
            {isOpen ? "Cerrar" : "Abrir"} desde afuera
          </button>
          <span className="text-sm text-gray-600">
            Estado: {isOpen ? "Abierto" : "Cerrado"}
          </span>
        </div>
        
        <Dropdown 
          open={isOpen} 
          onOpenChange={setIsOpen}
          variant="secondary"
        >
          <Dropdown.Trigger>Dropdown Controlado</Dropdown.Trigger>
          <Dropdown.Menu>
            <Dropdown.Item onSelect={() => console.log("Acción 1")}>
              Acción 1
            </Dropdown.Item>
            <Dropdown.Item onSelect={() => console.log("Acción 2")}>
              Acción 2
            </Dropdown.Item>
            <Dropdown.Item onSelect={() => console.log("Acción 3")}>
              Acción 3
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    );
  }
};

// Story 6: Disabled - Estados deshabilitados
export const Disabled: Story = {
  parameters: {
    docs: {
      description: {
        story: "Dropdown con elementos deshabilitados"
      }
    }
  },
  render: () => (
    <div className="flex gap-4">
      <Dropdown variant="primary">
        <Dropdown.Trigger disabled>Trigger Deshabilitado</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>No accesible</Dropdown.Item>
          <Dropdown.Item>No accesible</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      
      <Dropdown variant="secondary">
        <Dropdown.Trigger>Con items deshabilitados</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item>Opción normal</Dropdown.Item>
          <Dropdown.Item disabled>Opción deshabilitada</Dropdown.Item>
          <Dropdown.Item>Otra opción normal</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  )
};

// Story 7: Real World Example - Ejemplo del mundo real
export const RealWorldExample: Story = {
  parameters: {
    docs: {
      description: {
        story: "Ejemplo práctico de uso en una aplicación real"
      }
    }
  },
  render: () => {
    const [user, setUser] = useState("juan");
    const [isOpen, setIsOpen] = useState(false);
    
    const users = {
      juan: { name: "Juan Pérez", role: "Admin" },
      maria: { name: "María García", role: "Editor" },
      carlos: { name: "Carlos López", role: "Viewer" }
    };
    
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Panel de Usuario</h3>
          <Dropdown 
            open={isOpen} 
            onOpenChange={setIsOpen}
            variant="primary" 
            size="sm"
          >
            <Dropdown.Trigger>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  {users[user].name.charAt(0)}
                </div>
                <span className="text-sm">{users[user].name}</span>
              </div>
            </Dropdown.Trigger>
            <Dropdown.Menu>
              {Object.entries(users).map(([key, userData]) => (
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
                    <span className="text-xs text-gray-500">{userData.role}</span>
                  </div>
                </Dropdown.Item>
              ))}
              <hr className="my-1" />
              <Dropdown.Item onSelect={() => console.log("Cerrar sesión")}>
                Cerrar sesión
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <p className="text-sm text-gray-600">
          Usuario actual: <strong>{users[user].name}</strong> ({users[user].role})
        </p>
      </div>
    );
  }
};