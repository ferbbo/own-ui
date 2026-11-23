import type { Meta, StoryObj } from "@storybook/react";
import Badge from "./Badge";
import type { BadgeSize, BadgeTheme, BadgeVariant } from "./Badge.types";

const THEMES: BadgeTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const VARIANTS: (BadgeVariant | undefined)[] = [undefined, "outline", "soft"];

const SIZES: BadgeSize[] = ["xs", "sm", "md", "lg", "xl"];

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Nuevo" },
  parameters: {
    docs: {
      description: {
        component: [
          "Etiqueta corta de estado. Al contrario que el Card y el Input, **sí rellena con",
          "el rol**: su contenido es sólo texto, así que el par rol / `-content` del tema es",
          "exactamente lo que necesita.",
          "",
          "Los tratamientos `outline` y `soft` pintan texto de color de rol sobre una",
          "superficie del tema, donde el token `-content` no sirve. El CSS deriva ese texto",
          "mezclando el rol hacia `--color-base-content`, y el fixture e2e mide el ratio",
          "WCAG real en Chromium para los 8 roles y los dos temas.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    theme: { control: "select", options: THEMES },
    variant: { control: "select", options: ["outline", "soft"] },
    size: { control: "select", options: SIZES },
    dot: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {VARIANTS.map((variant) => (
        <div key={variant ?? "base"} style={{ display: "flex", gap: "0.5rem" }}>
          {THEMES.map((theme) => (
            <Badge key={theme} theme={theme} variant={variant}>
              {theme}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {SIZES.map((size) => (
        <Badge key={size} theme="primary" size={size}>
          {size}
        </Badge>
      ))}
    </div>
  ),
};

/**
 * Punto de estado. Sin `aria-label` es decorativo y se oculta al lector de
 * pantalla: el significado lo lleva el texto de al lado. Con `aria-label` pasa
 * a ser información y recibe `role="img"`.
 */
export const Dot: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
        <Badge dot theme="success" />
        Operativo
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
        <Badge dot theme="warning" />
        Degradado
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
        <Badge dot theme="error" aria-label="Caído" />
        Caído (el punto lleva el nombre accesible)
      </span>
    </div>
  ),
};

/** El badge dentro de otro componente: la cuenta de un botón. */
export const EnContexto: Story = {
  render: () => (
    <button type="button" className="btn btn-neutral btn-md">
      Mensajes
      <Badge theme="error" size="sm">
        12
      </Badge>
    </button>
  ),
};
