import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Input from "./Input";
import type { InputSize, InputTheme, InputVariant } from "./Input.types";

const THEMES: InputTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const VARIANTS: (InputVariant | undefined)[] = [undefined, "outline", "ghost", "bordered"];

const SIZES: InputSize[] = ["xs", "sm", "md", "lg", "xl"];

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: {
    label: "Correo",
    placeholder: "nombre@ejemplo.com",
  },
  argTypes: {
    theme: { control: "select", options: THEMES },
    variant: { control: "select", options: ["outline", "ghost", "bordered"] },
    size: { control: "select", options: SIZES },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "search", "tel", "url"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1.5rem", maxWidth: 420 }}>
      {VARIANTS.map((variant) => (
        <Input
          key={variant ?? "relleno"}
          theme="primary"
          variant={variant}
          label={`variant: ${variant ?? "— (relleno)"}`}
          placeholder="Escribe algo"
        />
      ))}
    </div>
  ),
};

export const AllThemes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", maxWidth: 420 }}>
      {THEMES.map((theme) => (
        <Input key={theme} theme={theme} label={theme} placeholder={`theme="${theme}"`} />
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", maxWidth: 420 }}>
      {SIZES.map((size) => (
        <Input key={size} size={size} theme="primary" label={`size ${size}`} placeholder={size} />
      ))}
    </div>
  ),
};

export const WithDescription: Story = {
  args: {
    description: "Usaremos esta dirección para enviarte el recibo.",
  },
};

export const Invalid: Story = {
  args: {
    invalid: true,
    errorMessage: "Ese correo no tiene un dominio válido.",
    defaultValue: "nombre@",
  },
};

export const WithIcons: Story = {
  args: {
    label: "Buscar",
    type: "search",
    placeholder: "Filtrar resultados",
    startIcon: <SearchIcon />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "no se puede editar",
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
    label: "Identificador",
    defaultValue: "ownui-9f3c21",
  },
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState("");

    return (
      <div style={{ display: "grid", gap: "0.75rem", maxWidth: 420 }}>
        <Input
          label="Nombre"
          value={value}
          onChange={setValue}
          description="El estado vive fuera del componente."
          placeholder="Escribe para ver el valor"
        />
        <p style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
          value: {JSON.stringify(value)}
        </p>
      </div>
    );
  },
};
