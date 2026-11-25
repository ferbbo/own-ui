import { Avatar } from "@ownui/ui";
import type { AvatarSize, AvatarTheme } from "@ownui/ui";
import { Row, Section } from "../layout";

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

/**
 * Retrato inline: la app de ejemplo no debe depender de la red para pintarse,
 * y así la demostración de "imagen que falla" es la única que carga algo.
 */
const RETRATO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">
       <rect width="96" height="96" fill="#0ea5e9"/>
       <circle cx="48" cy="36" r="18" fill="#e0f2fe"/>
       <path d="M12 96c0-20 16-32 36-32s36 12 36 32Z" fill="#e0f2fe"/>
     </svg>`
  );

export function AvatarSection() {
  return (
    <Section
      id="avatar"
      title="Avatar"
      description="Caja cuadrada que recorta su contenido. La cascada es imagen → hijos →
        iniciales → icono de reserva: si la imagen falla al cargar, el avatar baja al escalón
        siguiente en vez de dejar el hueco de una imagen rota. El rol no rellena a plena
        intensidad porque las iniciales son texto sobre el relleno."
    >
      <Row label="contenidos">
        <Avatar src={RETRATO} name="Ada Lovelace" />
        <Avatar name="Ada Lovelace" theme="accent" />
        <Avatar name="Grace" theme="success" />
        <Avatar aria-label="Sin datos" theme="neutral" />
        <span className="text-sm opacity-70">imagen · dos iniciales · una · icono de reserva</span>
      </Row>

      <Row label="8 roles">
        {THEMES.map((theme) => (
          <Avatar key={theme} theme={theme} name={theme} />
        ))}
      </Row>

      <Row label="tamaños">
        {SIZES.map((size) => (
          <Avatar key={size} theme="primary" size={size} name="Ada Lovelace" />
        ))}
      </Row>

      <Row label="formas">
        <Avatar src={RETRATO} name="Ada Lovelace" shape="square" />
        <Avatar name="Ada Lovelace" shape="square" theme="info" />
        <Avatar src={RETRATO} name="Ada Lovelace" />
        <Avatar name="Ada Lovelace" theme="info" />
      </Row>

      <Row label="imagen que falla">
        <Avatar src="https://ejemplo.invalido/no-existe.png" name="Ada Lovelace" theme="warning" />
        <Avatar src="https://ejemplo.invalido/no-existe.png" aria-label="Sin datos" />
        <span className="text-sm opacity-70">
          el onError descarta la url y la cascada sigue: iniciales, y si no hay, icono
        </span>
      </Row>

      <Row label="grupo">
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
      </Row>
    </Section>
  );
}
