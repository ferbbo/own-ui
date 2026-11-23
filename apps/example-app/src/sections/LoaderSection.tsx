import { Button, Loader } from "@ownui/ui";
import type { LoaderColor, LoaderSize } from "@ownui/ui";
import { Panel, Row, Section } from "../layout";

const COLORS: LoaderColor[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
  "current",
];

const SIZES: LoaderSize[] = ["2xs", "xs", "sm", "md", "lg"];

export function LoaderSection() {
  return (
    <Section
      id="loader"
      title="Loader"
      description="8 roles semánticos más `current`, que hereda el color del contexto por
        currentColor: es lo que permite que el spinner de un Button contraste con el relleno de
        cualquier rol sin duplicar el mapa de colores."
    >
      <Row label="color">
        {COLORS.map((color) => (
          <div key={color} className="flex flex-col items-center gap-1">
            <Loader color={color} aria-label={`Cargando ${color}`} />
            <span className="font-mono text-[10px] opacity-60">{color}</span>
          </div>
        ))}
      </Row>

      <Row label="size">
        {SIZES.map((size) => (
          <div key={size} className="flex flex-col items-center gap-1">
            <Loader size={size} color="primary" aria-label={`Cargando ${size}`} />
            <span className="font-mono text-[10px] opacity-60">{size}</span>
          </div>
        ))}
      </Row>

      <Row label='color="current" dentro de un botón'>
        <Button theme="warning" loading>
          El spinner hereda el contenido del rol
        </Button>
        <Button theme="neutral" variant="outline" loading>
          Y el tamaño del botón
        </Button>
        <Button theme="error" size="xs" loading>
          size xs
        </Button>
      </Row>

      <Panel>
        <p className="text-sm opacity-70">
          Cada Loader lleva <code className="font-mono">role=&quot;status&quot;</code> y
          <code className="font-mono"> aria-live=&quot;polite&quot;</code>, así que un lector de
          pantalla anuncia el cambio sin robar el foco.
        </p>
      </Panel>
    </Section>
  );
}
