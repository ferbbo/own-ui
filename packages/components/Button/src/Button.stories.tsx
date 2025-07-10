// Button.stories.tsx
import { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";
import { ButtonProps } from "./Button.types";


const meta: Meta<ButtonProps> = {
  title: "Components/Button",
  component: Button,
  argTypes: {
    variant: {
      control: {
        type: "select",
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
          "outline",
          "dash",
          "soft",
        ],
      },
    },
    size: {
      control: {
        type: "select",
        options: ["xs", "sm", "md", "lg", "xl"],
      },
    },
    disabled: { control: "boolean" },
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
type Story = StoryObj<ButtonProps>;

export const Primary: Story = {
  args: {
    variant: "primary",
    size: "md",
    disabled: false,
    children: "Primary Button",
    as: "button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "md",
    disabled: false,
    children: "Secondary Button",
    as: "button",
  },
};

export const AccentLarge: Story = {
  args: {
    variant: "accent",
    size: "lg",
    disabled: false,
    children: "Accent Large",
    as: "button",
  },
};

export const NeutralSmallDisabled: Story = {
  args: {
    variant: "neutral",
    size: "sm",
    disabled: true,
    children: "Disabled Button",
    as: "button",
  },
};

export const InfoExtraSmall: Story = {
  args: {
    variant: "info",
    size: "xs",
    disabled: false,
    children: "Info XS",
    as: "button",
  },
};

export const WarningXL: Story = {
  args: {
    variant: "warning",
    size: "xl",
    disabled: false,
    children: "Warning XL",
    as: "button",
  },
};

export const SuccessGhost: Story = {
  args: {
    variant: "ghost",
    size: "md",
    disabled: false,
    children: "Ghost Button",
    as: "button",
  },
};

export const LinkAsAnchor: Story = {
  args: {
    variant: "link",
    size: "md",
    disabled: false,
    children: "Visit Example",
    href: "https://example.com",
    as: "a",
  },
};

export const OutlineDashSoft: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "1rem" }}>
      <Button variant="outline" size="md" as="a" href="#">
        Outline
      </Button>
      <Button variant="dash" size="md">
        Dashed
      </Button>
      <Button variant="soft" size="md">
        Soft
      </Button>
    </div>
  ),
};
