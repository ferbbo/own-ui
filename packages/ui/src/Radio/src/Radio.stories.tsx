import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Radio from "./Radio";
import RadioGroup from "./RadioGroup";
import type { RadioSize, RadioTheme } from "./Radio.types";

const THEMES: RadioTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const SIZES: RadioSize[] = ["xs", "sm", "md", "lg", "xl"];

/**
 * La historia es del **grupo**, no del radio suelto: un `<Radio>` fuera de un
 * `<RadioGroup>` lanza a proposito, porque sin estado compartido no hay forma
 * de deseleccionar la opcion anterior.
 */
const meta: Meta<typeof RadioGroup> = {
  title: "Components/Radio",
  component: RadioGroup,
  tags: ["autodocs"],
  args: { label: "Tamaño" },
  argTypes: {
    theme: { control: "select", options: THEMES },
    size: { control: "select", options: SIZES },
    orientation: { control: "inline-radio", options: ["vertical", "horizontal"] },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup {...args} defaultValue="md">
      <Radio value="sm">Pequeño</Radio>
      <Radio value="md">Mediano</Radio>
      <Radio value="lg">Grande</Radio>
    </RadioGroup>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {THEMES.map((theme) => (
        <RadioGroup
          key={theme}
          label={theme}
          theme={theme}
          defaultValue="a"
          orientation="horizontal"
        >
          <Radio value="a">A</Radio>
          <Radio value="b">B</Radio>
        </RadioGroup>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      {SIZES.map((size) => (
        <RadioGroup key={size} label={`size ${size}`} size={size} defaultValue="a">
          <Radio value="a">Elegida</Radio>
          <Radio value="b">Sin elegir</Radio>
        </RadioGroup>
      ))}
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <RadioGroup label="Envío" orientation="horizontal" defaultValue="estandar">
      <Radio value="estandar">Estándar</Radio>
      <Radio value="rapido">Rápido</Radio>
      <Radio value="recogida">Recogida</Radio>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1.25rem" }}>
      <RadioGroup label="Todo el grupo" disabled defaultValue="a">
        <Radio value="a">A</Radio>
        <Radio value="b">B</Radio>
      </RadioGroup>
      <RadioGroup label="Sólo una opción" defaultValue="a">
        <Radio value="a">Disponible</Radio>
        <Radio value="b" disabled>
          Agotada
        </Radio>
      </RadioGroup>
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <RadioGroup label="Tamaño" invalid errorMessage="Elige un tamaño para continuar.">
      <Radio value="sm">Pequeño</Radio>
      <Radio value="lg">Grande</Radio>
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [value, setValue] = useState("md");

    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <RadioGroup
          label="Tamaño"
          description="El estado vive fuera del grupo."
          value={value}
          onChange={setValue}
        >
          <Radio value="sm">Pequeño</Radio>
          <Radio value="md">Mediano</Radio>
          <Radio value="lg">Grande</Radio>
        </RadioGroup>
        <p style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>value: {value}</p>
      </div>
    );
  },
};
