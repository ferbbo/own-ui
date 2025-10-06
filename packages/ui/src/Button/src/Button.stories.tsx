// Button.stories.tsx
import { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";


const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    theme: {
      control: {
        type: "select",
      },
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
      control: {
        type: "select",
      },
      options: ["", "outline", "dash", "soft"],
    },
    size: {
      control: {
        type: "select",
        options: ["xs", "sm", "md", "lg", "xl"],
      },
    },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
    as: {
      control: {
        type: "radio",
        options: ["button", "a"],
      },
    },
    href: { control: "text" },
    className: { control: "text" },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    theme: "primary",
    size: "md",
    disabled: false,
    children: "Primary Button",
    as: "button",
  },
};

export const Secondary: Story = {
  args: {
    theme: "secondary",
    size: "md",
    disabled: false,
    children: "Secondary Button",
    as: "button",
  },
};

export const AccentLarge: Story = {
  args: {
    theme: "accent",
    size: "lg",
    disabled: false,
    children: "Accent Large",
    as: "button",
  },
};

export const NeutralSmallDisabled: Story = {
  args: {
    theme: "neutral",
    size: "sm",
    disabled: true,
    children: "Disabled Button",
    as: "button",
  },
};

export const InfoExtraSmall: Story = {
  args: {
    theme: "info",
    size: "xs",
    disabled: false,
    children: "Info XS",
    as: "button",
  },
};

export const WarningXL: Story = {
  args: {
    theme: "warning",
    size: "xl",
    disabled: false,
    children: "Warning XL",
    as: "button",
  },
};

export const SuccessGhost: Story = {
  args: {
    theme: "ghost",
    size: "md",
    disabled: false,
    children: "Ghost Button",
    as: "button",
  },
};

export const LinkAsAnchor: Story = {
  render: () => (
    <Button 
      theme="link" 
      size="md" 
      href="https://example.com" 
      as="a"
    >
      Visit Example
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: "Button rendered as an anchor element with href attribute.",
      },
    },
  },
};

export const AllThemes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Button theme="primary" size="md">Primary</Button>
      <Button theme="secondary" size="md">Secondary</Button>
      <Button theme="accent" size="md">Accent</Button>
      <Button theme="neutral" size="md">Neutral</Button>
      <Button theme="info" size="md">Info</Button>
      <Button theme="success" size="md">Success</Button>
      <Button theme="warning" size="md">Warning</Button>
      <Button theme="error" size="md">Error</Button>
      <Button theme="ghost" size="md">Ghost</Button>
      <Button theme="link" size="md">Link</Button>
    </div>
  ),
};

export const OutlineDashSoft: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button theme="primary" variant="outline" size="md">
        Outline
      </Button>
      <Button theme="primary" variant="dash" size="md">
        Dashed
      </Button>
      <Button theme="primary" variant="soft" size="md">
        Soft
      </Button>
    </div>
  ),
};

export const VariantCombinations: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Button theme="primary" size="md">Primary</Button>
        <Button theme="primary" variant="outline" size="md">Primary Outline</Button>
        <Button theme="primary" variant="dash" size="md">Primary Dash</Button>
        <Button theme="primary" variant="soft" size="md">Primary Soft</Button>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Button theme="success" size="md">Success</Button>
        <Button theme="success" variant="outline" size="md">Success Outline</Button>
        <Button theme="success" variant="dash" size="md">Success Dash</Button>
        <Button theme="success" variant="soft" size="md">Success Soft</Button>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Button theme="error" size="md">Error</Button>
        <Button theme="error" variant="outline" size="md">Error Outline</Button>
        <Button theme="error" variant="dash" size="md">Error Dash</Button>
        <Button theme="error" variant="soft" size="md">Error Soft</Button>
      </div>
    </div>
  ),
};

// Historias para estado de loading
export const Loading: Story = {
  args: {
    theme: "primary",
    size: "md",
    loading: true,
    children: "Loading...",
    as: "button",
  },
  parameters: {
    docs: {
      description: {
        story: "Button en estado de loading mostrando el componente Loader.",
      },
    },
  },
};

export const LoadingWithoutText: Story = {
  args: {
    theme: "primary",
    size: "md",
    loading: true,
    children: "",
    as: "button",
  },
  parameters: {
    docs: {
      description: {
        story: "Button en estado de loading sin texto, solo mostrando el spinner.",
      },
    },
  },
};

export const LoadingDifferentSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Button theme="primary" size="xs" loading>
        Saving
      </Button>
      <Button theme="primary" size="sm" loading>
        Processing
      </Button>
      <Button theme="primary" size="md" loading>
        Loading
      </Button>
      <Button theme="primary" size="lg" loading>
        Uploading
      </Button>
      <Button theme="primary" size="xl" loading>
        Downloading
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Botones en estado de loading en diferentes tamaños.",
      },
    },
  },
};

export const LoadingDifferentThemes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <Button theme="primary" loading>Saving...</Button>
      <Button theme="secondary" loading>Processing...</Button>
      <Button theme="success" loading>Uploading...</Button>
      <Button theme="warning" loading>Converting...</Button>
      <Button theme="error" loading>Deleting...</Button>
      <Button theme="info" loading>Analyzing...</Button>
      <Button theme="accent" loading>Generating...</Button>
      <Button theme="neutral" loading>Loading...</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Botones en estado de loading con diferentes temas de color.",
      },
    },
  },
};

export const LoadingWithVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Button theme="primary" loading>Primary Loading</Button>
        <Button theme="primary" variant="outline" loading>Outline Loading</Button>
        <Button theme="primary" variant="dash" loading>Dash Loading</Button>
        <Button theme="primary" variant="soft" loading>Soft Loading</Button>
      </div>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Button theme="success" loading>Success Loading</Button>
        <Button theme="success" variant="outline" loading>Success Outline</Button>
        <Button theme="success" variant="dash" loading>Success Dash</Button>
        <Button theme="success" variant="soft" loading>Success Soft</Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Botones en estado de loading con diferentes variantes de estilo.",
      },
    },
  },
};

export const LoadingDisabled: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button theme="primary" loading disabled>
        Loading & Disabled
      </Button>
      <Button theme="secondary" loading disabled>
        Processing...
      </Button>
      <Button theme="success" loading disabled>
        Uploading...
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Botones en estado de loading y deshabilitados simultáneamente.",
      },
    },
  },
};
