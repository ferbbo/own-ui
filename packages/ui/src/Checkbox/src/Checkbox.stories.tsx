import type { Meta, StoryObj } from "@storybook/react";
import { useMemo, useState } from "react";
import Checkbox from "./Checkbox";
import CheckboxGroup from "./CheckboxGroup";
import type { CheckboxSize, CheckboxTheme } from "./Checkbox.types";

const THEMES: CheckboxTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const SIZES: CheckboxSize[] = ["xs", "sm", "md", "lg", "xl"];

const meta: Meta<typeof Checkbox> = {
  title: "Components/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: { children: "Acepto los términos" },
  argTypes: {
    theme: { control: "select", options: THEMES },
    size: { control: "select", options: SIZES },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {THEMES.map((theme) => (
        <Checkbox key={theme} theme={theme} defaultChecked>
          {theme}
        </Checkbox>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      {SIZES.map((size) => (
        <Checkbox key={size} size={size} defaultChecked>
          size {size}
        </Checkbox>
      ))}
    </div>
  ),
};

export const Indeterminate: Story = {
  render: function IndeterminateStory() {
    const options = ["Queso", "Jamón", "Piña"];
    const [value, setValue] = useState<string[]>(["Queso"]);

    const all = value.length === options.length;
    const some = value.length > 0 && !all;

    const summary = useMemo(() => value.join(", ") || "nada", [value]);

    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <Checkbox
          checked={all}
          indeterminate={some}
          onChange={(checked) => setValue(checked ? options : [])}
        >
          Seleccionar todo
        </Checkbox>
        <div style={{ paddingLeft: "1.5rem" }}>
          <CheckboxGroup label="Ingredientes" value={value} onChange={setValue}>
            {options.map((option) => (
              <Checkbox key={option} value={option}>
                {option}
              </Checkbox>
            ))}
          </CheckboxGroup>
        </div>
        <p style={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>value: {summary}</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <Checkbox disabled>Deshabilitado</Checkbox>
      <Checkbox disabled defaultChecked>
        Deshabilitado y marcado
      </Checkbox>
      <Checkbox readOnly defaultChecked>
        Sólo lectura
      </Checkbox>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <CheckboxGroup
      label="Ingredientes"
      description="Elige los que quieras."
      theme="success"
      defaultValue={["queso"]}
    >
      <Checkbox value="queso">Queso</Checkbox>
      <Checkbox value="jamon">Jamón</Checkbox>
      <Checkbox value="pina">Piña</Checkbox>
    </CheckboxGroup>
  ),
};

export const GroupInvalid: Story = {
  render: () => (
    <CheckboxGroup label="Ingredientes" invalid errorMessage="Elige al menos uno.">
      <Checkbox value="queso">Queso</Checkbox>
      <Checkbox value="jamon">Jamón</Checkbox>
    </CheckboxGroup>
  ),
};
