import type { Meta, StoryObj } from "@storybook/react";
import Card from "./Card";
import type { CardSize, CardTheme, CardVariant } from "./Card.types";

const THEMES: CardTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const VARIANTS: (CardVariant | undefined)[] = [undefined, "elevated", "outlined", "ghost"];

const SIZES: CardSize[] = ["xs", "sm", "md", "lg", "xl"];

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: [
          "Superficie de agrupación. El rol semántico **no pinta el relleno**: colorea el",
          "borde, los separadores de las partes y el anillo de foco, porque el contenido de",
          "un card es arbitrario y repintarlo con el color de contenido del rol es imposible.",
          "",
          "Es un compound estático: `Card.Header`, `Card.Title`, `Card.Body` y `Card.Footer`",
          "no comparten estado con el root y el tamaño les llega por la cascada de custom",
          "properties, no por contexto de React.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    theme: { control: "select", options: THEMES },
    variant: { control: "select", options: ["elevated", "outlined", "ghost"] },
    size: { control: "select", options: SIZES },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

const Contenido = () => (
  <>
    <Card.Header>
      <Card.Title>Plan Pro</Card.Title>
      <span>24 €/mes</span>
    </Card.Header>
    <Card.Body>
      <p style={{ margin: 0 }}>
        Todo lo del plan básico más historial ilimitado, dominio propio y soporte con respuesta en
        menos de un día laborable.
      </p>
    </Card.Body>
    <Card.Footer>
      <button type="button" className="btn btn-neutral btn-sm">
        Comparar
      </button>
      <button type="button" className="btn btn-primary btn-sm">
        Contratar
      </button>
    </Card.Footer>
  </>
);

export const Default: Story = {
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <Card {...args}>
        <Contenido />
      </Card>
    </div>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(2, 240px)" }}>
      {VARIANTS.map((variant) => (
        <Card key={variant ?? "base"} theme="primary" variant={variant}>
          <Card.Header>
            <Card.Title>{variant ?? "(por defecto)"}</Card.Title>
          </Card.Header>
          <Card.Body>Tratamiento del marco: sombra y borde.</Card.Body>
        </Card>
      ))}
    </div>
  ),
};

export const AllThemes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(4, 180px)" }}>
      {THEMES.map((theme) => (
        <Card key={theme} theme={theme} variant="outlined">
          <Card.Header>
            <Card.Title>{theme}</Card.Title>
          </Card.Header>
          <Card.Body>El rol colorea el borde.</Card.Body>
        </Card>
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(5, 200px)" }}>
      {SIZES.map((size) => (
        <Card key={size} theme="info" size={size}>
          <Card.Header>
            <Card.Title>{size}</Card.Title>
          </Card.Header>
          <Card.Body>El tamaño escala el padding y la tipografía.</Card.Body>
          <Card.Footer>pie</Card.Footer>
        </Card>
      ))}
    </div>
  ),
};

/** Las partes son opcionales: un card puede ser sólo cuerpo. */
export const SoloCuerpo: Story = {
  render: () => (
    <div style={{ maxWidth: 360 }}>
      <Card theme="neutral">
        <Card.Body>Sin cabecera ni pie: una caja con borde, radio y padding.</Card.Body>
      </Card>
    </div>
  ),
};

/**
 * Card accionable. El tratamiento de hover y el anillo de foco **se derivan
 * del elemento**: sólo `as="a"` y `as="button"` lo reciben, para que nunca
 * haya un card que parezca pulsable sin ser enfocable (`AGENTS.md` §8.5).
 */
export const AsLink: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", maxWidth: 560 }}>
      <Card as="a" href="#detalle" theme="primary" style={{ maxWidth: 260 }}>
        <Card.Header>
          <Card.Title>Enlace</Card.Title>
        </Card.Header>
        <Card.Body>Todo el card es un `&lt;a&gt;`. Tabula y se enfoca.</Card.Body>
      </Card>

      <Card as="button" theme="accent" style={{ maxWidth: 260 }}>
        <Card.Header>
          <Card.Title>Botón</Card.Title>
        </Card.Header>
        <Card.Body>Todo el card es un `&lt;button type="button"&gt;`.</Card.Body>
      </Card>
    </div>
  ),
};
