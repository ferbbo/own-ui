import { Badge, Button } from "@ownui/ui";
import type { BadgeSize, BadgeTheme, BadgeVariant } from "@ownui/ui";
import { Row, Section } from "../layout";

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

/** `undefined` es el relleno sólido del rol. */
const VARIANTS: (BadgeVariant | undefined)[] = [undefined, "outline", "soft"];

const SIZES: BadgeSize[] = ["xs", "sm", "md", "lg", "xl"];

const ESTADOS = [
  { theme: "success", label: "Operativo" },
  { theme: "warning", label: "Degradado" },
  { theme: "error", label: "Caído" },
] as const;

export function BadgeSection() {
  return (
    <Section
      id="badge"
      title="Badge"
      description="Etiqueta corta de estado. Al contrario que el Card y el Input, sí rellena con el
        rol: su contenido es sólo texto, así que el par rol / -content del tema es lo que
        necesita. Los tratamientos outline y soft pintan texto de color de rol sobre una
        superficie, y ahí el -content no sirve: el CSS lo deriva mezclando el rol hacia
        --color-base-content, con el ratio AA medido en Chromium."
    >
      {VARIANTS.map((variant) => (
        <Row key={variant ?? "base"} label={variant ?? "relleno sólido"}>
          {THEMES.map((theme) => (
            <Badge key={theme} theme={theme} variant={variant}>
              {theme}
            </Badge>
          ))}
        </Row>
      ))}

      <Row label="tamaños">
        {SIZES.map((size) => (
          <Badge key={size} theme="primary" size={size}>
            {size}
          </Badge>
        ))}
      </Row>

      <Row label="punto de estado">
        {ESTADOS.map((estado) => (
          <span key={estado.label} className="inline-flex items-center gap-1.5 text-sm">
            <Badge dot theme={estado.theme} />
            {estado.label}
          </span>
        ))}
        <span className="text-sm opacity-70">
          sin aria-label el punto es decorativo; con él recibe role=&quot;img&quot;
        </span>
      </Row>

      <Row label="en contexto">
        <Button theme="neutral">
          Mensajes
          <Badge theme="error" size="sm">
            12
          </Badge>
        </Button>
      </Row>
    </Section>
  );
}
