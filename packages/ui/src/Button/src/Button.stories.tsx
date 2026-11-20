// Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

/**
 * Las clases que emite el componente las define `@ownui/tw-theme/css`, que
 * Storybook importa en `.storybook/styles/tailwind.css`. Si una story sale sin
 * estilar, el problema está en ese import, no aquí.
 */
const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    docs: {
      description: {
        component:
          "Botón con rol semántico (`theme`), tratamiento (`variant`), tamaño, iconos y " +
          "estado de carga. No lleva estilos propios: sólo compone las clases del contrato " +
          "de `@ownui/tw-theme/variants`.",
      },
    },
  },
  argTypes: {
    theme: {
      control: { type: "select" },
      options: [
        "primary",
        "secondary",
        "accent",
        "neutral",
        "info",
        "success",
        "warning",
        "error",
        "ghost",
        "link",
      ],
    },
    variant: {
      control: { type: "select" },
      // `undefined` es el botón sólido: la ausencia de tratamiento.
      options: [undefined, "outline", "dash", "soft"],
    },
    size: {
      control: { type: "select" },
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    shape: {
      control: { type: "select" },
      options: [undefined, "square", "circle"],
    },
    width: {
      control: { type: "select" },
      options: [undefined, "wide", "block"],
    },
    active: { control: "boolean" },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    as: {
      control: { type: "radio" },
      options: ["button", "a"],
    },
    href: { control: "text" },
    className: { control: "text" },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/** Iconos inline: las stories no deben depender de una librería de iconos. */
const ArrowLeft = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M15 18l-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRight = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Star = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const row = { display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" } as const;
const column = { display: "flex", flexDirection: "column", gap: "1rem" } as const;

export const Default: Story = {
  args: {
    theme: "primary",
    size: "md",
    children: "Primary Button",
  },
};

/**
 * Los tres tratamientos que el CSS define. Hasta el lote 5 ninguno aplicaba
 * clase (`dash` y `soft` se perdían, `outline` colaba por coincidencia de
 * nombre), así que esta story es la verificación visual del arreglo: los
 * cuatro botones tienen que verse distintos entre sí.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={column}>
      <div style={row}>
        <Button theme="primary">Sólido (sin variant)</Button>
        <Button theme="primary" variant="outline">
          Outline
        </Button>
        <Button theme="primary" variant="dash">
          Dash
        </Button>
        <Button theme="primary" variant="soft">
          Soft
        </Button>
      </div>
      <div style={row}>
        <Button theme="error">Sólido</Button>
        <Button theme="error" variant="outline">
          Outline
        </Button>
        <Button theme="error" variant="dash">
          Dash
        </Button>
        <Button theme="error" variant="soft">
          Soft
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Sólido = ausencia de `variant` (no existe `.btn-solid`). `outline` y `dash` vacían " +
          "el fondo y pintan el borde (dash, punteado); `soft` es un tinte del rol al 10 %.",
      },
    },
  },
};

export const AllThemes: Story = {
  render: () => (
    <div style={row}>
      <Button theme="primary">Primary</Button>
      <Button theme="secondary">Secondary</Button>
      <Button theme="accent">Accent</Button>
      <Button theme="neutral">Neutral</Button>
      <Button theme="info">Info</Button>
      <Button theme="success">Success</Button>
      <Button theme="warning">Warning</Button>
      <Button theme="error">Error</Button>
      <Button theme="ghost">Ghost</Button>
      <Button theme="link">Link</Button>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={row}>
      <Button size="xs">xs</Button>
      <Button size="sm">sm</Button>
      <Button size="md">md</Button>
      <Button size="lg">lg</Button>
      <Button size="xl">xl</Button>
    </div>
  ),
};

/** `startIcon` / `endIcon` son `ReactNode` y se renderizan alrededor del contenido. */
export const WithIcons: Story = {
  render: () => (
    <div style={column}>
      <div style={row}>
        <Button startIcon={<ArrowLeft />}>Anterior</Button>
        <Button endIcon={<ArrowRight />}>Siguiente</Button>
        <Button startIcon={<ArrowLeft />} endIcon={<ArrowRight />}>
          Ambos
        </Button>
      </div>
      <div style={row}>
        {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
          <Button key={size} size={size} startIcon={<Star />}>
            {size}
          </Button>
        ))}
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "El icono escala con el texto (`width: 1em`) y el espacio lo pone el `gap` de `.btn`.",
      },
    },
  },
};

/** `icon` hace el botón icon-only: exige `aria-label` y aplica `.btn-square`. */
export const IconOnly: Story = {
  render: () => (
    <div style={row}>
      <Button icon={<Star />} aria-label="Favorito" />
      <Button icon={<Star />} aria-label="Favorito" shape="circle" />
      <Button icon={<Star />} aria-label="Favorito" theme="ghost" />
      <Button icon={<Star />} aria-label="Favorito" variant="outline" size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Sin texto visible no hay nombre accesible, así que `aria-label` es obligatorio en " +
          "TypeScript cuando se pasa `icon`.",
      },
    },
  },
};

/** Modificadores de layout que el CSS tenía y React no exponía hasta el lote 5. */
export const Modifiers: Story = {
  render: () => (
    <div style={column}>
      <div style={row}>
        <Button shape="square" icon={<Star />} aria-label="Cuadrado" />
        <Button shape="circle" icon={<Star />} aria-label="Círculo" />
        <Button active>Active</Button>
      </div>
      <Button width="wide">Wide (16rem)</Button>
      <Button width="block">Block (100 %)</Button>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={row}>
      <Button disabled>Sólido</Button>
      <Button disabled variant="outline">
        Outline
      </Button>
      <Button disabled theme="error">
        Error
      </Button>
      <Button as="a" href="https://example.com" theme="link">
        Enlace (no admite disabled)
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "`disabled` emite `.btn-disabled`, que es el estado final del CSS: gana a rol y " +
          'tratamiento. En `as="a"` la prop está prohibida por tipos.',
      },
    },
  },
};

export const AsLink: Story = {
  render: () => (
    <div style={row}>
      <Button as="a" href="https://example.com">
        Enlace con aspecto de botón
      </Button>
      <Button as="a" href="https://example.com" theme="link">
        Enlace de verdad
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Con `href`, el nodo conserva el rol nativo `link`: el lector de pantalla anuncia " +
          "que navega, no que acciona.",
      },
    },
  },
};

/** El spinner acompaña al contenido; no lo sustituye. */
export const Loading: Story = {
  args: {
    theme: "primary",
    size: "md",
    loading: true,
    children: "Guardando",
  },
};

export const LoadingAllThemes: Story = {
  render: () => (
    <div style={row}>
      <Button theme="primary" loading>
        Primary
      </Button>
      <Button theme="secondary" loading>
        Secondary
      </Button>
      <Button theme="accent" loading>
        Accent
      </Button>
      <Button theme="neutral" loading>
        Neutral
      </Button>
      <Button theme="info" loading>
        Info
      </Button>
      <Button theme="success" loading>
        Success
      </Button>
      <Button theme="warning" loading>
        Warning
      </Button>
      <Button theme="error" loading>
        Error
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "El spinner usa `loader-current`, o sea `--btn-fg`: contrasta con el relleno de " +
          "cualquier rol. Con un color semántico fijo, el spinner de un `btn-primary` era azul " +
          "sobre azul.",
      },
    },
  },
};

export const LoadingAllSizes: Story = {
  render: () => (
    <div style={row}>
      {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
        <Button key={size} size={size} loading>
          {size}
        </Button>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "El spinner hereda el tamaño del botón: `xs → loader-2xs` … `xl → loader-lg`.",
      },
    },
  },
};

export const LoadingWithVariants: Story = {
  render: () => (
    <div style={row}>
      <Button loading>Sólido</Button>
      <Button variant="outline" loading>
        Outline
      </Button>
      <Button variant="dash" loading>
        Dash
      </Button>
      <Button variant="soft" loading>
        Soft
      </Button>
      <Button icon={<Star />} aria-label="Guardando" loading />
    </div>
  ),
};
