// Loader.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Loader from "./Loader";
import { LoaderProps } from "./Loader.types";

const meta: Meta<typeof Loader> = {
  title: "Components/Loader",
  component: Loader,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "Componente Loader para mostrar estados de carga con diferentes tamaños y colores.",
      },
    },
  },
  argTypes: {
    size: {
      control: { type: "select" },
      options: ["2xs", "xs", "sm", "md", "lg"],
      description: "Tamaño del loader",
    },
    color: {
      control: { type: "select" },
      options: ["primary", "secondary", "accent", "neutral", "info", "success", "warning", "error"],
      description: "Color del loader",
    },
    className: {
      control: { type: "text" },
      description: "Clases CSS adicionales",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<LoaderProps>;

// Historia por defecto
export const Default: Story = {
  args: {
    size: "md",
    color: "primary",
  },
};

// Historias de tamaños
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Loader size="2xs" />
      <Loader size="xs" />
      <Loader size="sm" />
      <Loader size="md" />
      <Loader size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Diferentes tamaños disponibles para el loader.",
      },
    },
  },
};

// Historias de colores
export const Colors: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Loader color="primary" />
      <Loader color="secondary" />
      <Loader color="accent" />
      <Loader color="neutral" />
      <Loader color="info" />
      <Loader color="success" />
      <Loader color="warning" />
      <Loader color="error" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Diferentes colores semánticos disponibles para el loader.",
      },
    },
  },
};

// Historia dentro de un botón (caso de uso común)
export const InButton: Story = {
  render: () => (
    <button className="btn btn-primary" disabled>
      <Loader size="sm" color="primary" />
      Cargando...
    </button>
  ),
  parameters: {
    docs: {
      description: {
        story: "Ejemplo de uso del loader dentro de un botón.",
      },
    },
  },
};

// Historia con texto personalizado de accesibilidad
export const WithCustomAriaLabel: Story = {
  args: {
    size: "md",
    color: "primary",
    "aria-label": "Guardando datos...",
  },
  parameters: {
    docs: {
      description: {
        story: "Loader con etiqueta de accesibilidad personalizada.",
      },
    },
  },
};
