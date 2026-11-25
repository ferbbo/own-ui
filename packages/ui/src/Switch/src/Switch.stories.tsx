import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Switch from "./Switch";
import type { SwitchSize, SwitchTheme } from "./Switch.types";

const THEMES: SwitchTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const SIZES: SwitchSize[] = ["xs", "sm", "md", "lg", "xl"];

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { children: "Notificaciones" },
  argTypes: {
    theme: { control: "select", options: THEMES },
    size: { control: "select", options: SIZES },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {THEMES.map((theme) => (
        <Switch key={theme} theme={theme} defaultChecked>
          {theme}
        </Switch>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {SIZES.map((size) => (
        <Switch key={size} size={size} defaultChecked>
          size {size}
        </Switch>
      ))}
    </div>
  ),
};

export const OffAndOn: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Switch>Apagado</Switch>
      <Switch defaultChecked>Encendido</Switch>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Switch disabled>Deshabilitado</Switch>
      <Switch disabled defaultChecked>
        Deshabilitado y encendido
      </Switch>
      <Switch readOnly defaultChecked>
        Sólo lectura
      </Switch>
    </div>
  ),
};

export const Controlled: Story = {
  render: function ControlledStory() {
    const [on, setOn] = useState(false);

    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Switch checked={on} onChange={setOn} theme="success">
          Modo oscuro
        </Switch>
        <p style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>checked: {String(on)}</p>
      </div>
    );
  },
};
