import type { Meta, StoryObj } from "@storybook/react";
import Avatar from "./Avatar";
import type { AvatarSize, AvatarTheme } from "./Avatar.types";

const THEMES: AvatarTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const SIZES: AvatarSize[] = ["xs", "sm", "md", "lg", "xl"];

/** Imagen inline: una story no debería depender de la red para pintarse. */
const RETRATO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
       <rect width="96" height="96" fill="#0ea5e9"/>
       <circle cx="48" cy="36" r="18" fill="#e0f2fe"/>
       <path d="M12 96c0-20 16-32 36-32s36 12 36 32Z" fill="#e0f2fe"/>
     </svg>`
  );

const meta: Meta<typeof Avatar> = {
  title: "Components/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "Ada Lovelace" },
  parameters: {
    docs: {
      description: {
        component: [
          "Caja cuadrada que recorta su contenido. La cascada es **imagen → hijos →",
          "iniciales → icono de reserva**: si la imagen falla al cargar, el avatar baja al",
          "escalón siguiente en vez de dejar el hueco de una imagen rota.",
          "",
          "El rol no rellena a plena intensidad: las iniciales son texto sobre el relleno,",
          "así que el CSS usa relleno lavado y texto del rol mezclado hacia",
          "`--color-base-content`. Los 8 roles pasan AA en los dos temas.",
        ].join("\n"),
      },
    },
  },
  argTypes: {
    theme: { control: "select", options: THEMES },
    shape: { control: "select", options: ["circle", "square"] },
    size: { control: "select", options: SIZES },
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "0.5rem" }}>
      {THEMES.map((theme) => (
        <Avatar key={theme} theme={theme} name={theme} />
      ))}
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {SIZES.map((size) => (
        <Avatar key={size} theme="primary" size={size} name="Ada Lovelace" />
      ))}
    </div>
  ),
};

/** Los tres contenidos posibles, más la forma cuadrada. */
export const Contenidos: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Avatar src={RETRATO} name="Con imagen" />
      <Avatar name="Ada Lovelace" theme="accent" />
      <Avatar aria-label="Sin datos" theme="neutral" />
      <Avatar src={RETRATO} name="Cuadrado" shape="square" />
      <Avatar name="Cuadrado" shape="square" theme="info" />
    </div>
  ),
};

/**
 * Imagen que no existe: `onError` descarta la url y el avatar cae a las
 * iniciales. Es lo que pasa con un CDN caído, no un caso de laboratorio.
 */
export const ImagenRota: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <Avatar src="https://ejemplo.invalido/no-existe.png" name="Ada Lovelace" theme="warning" />
      <Avatar src="https://ejemplo.invalido/no-existe.png" aria-label="Sin datos" />
    </div>
  ),
};

/** Grupo con `max`: los que sobran se resumen en un contador. */
export const Grupo: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <Avatar.Group size="md">
        <Avatar src={RETRATO} name="Ada Lovelace" />
        <Avatar name="Grace Hopper" theme="accent" />
        <Avatar name="Alan Turing" theme="success" />
      </Avatar.Group>

      <Avatar.Group size="lg" max={3} total={50} theme="primary">
        <Avatar src={RETRATO} name="Ada Lovelace" />
        <Avatar name="Grace Hopper" theme="accent" />
        <Avatar name="Alan Turing" theme="success" />
        <Avatar name="Katherine Johnson" theme="warning" />
      </Avatar.Group>

      <Avatar.Group size="sm" shape="square" max={2}>
        <Avatar name="Ada Lovelace" theme="info" />
        <Avatar name="Grace Hopper" theme="accent" />
        <Avatar name="Alan Turing" theme="success" />
      </Avatar.Group>
    </div>
  ),
};
