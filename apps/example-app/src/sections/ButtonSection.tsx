import { useState } from "react";
import { Button } from "@ownui/ui";
import type { ButtonSize, ButtonTheme, ButtonVariant } from "@ownui/ui";
import { Row, Section } from "../layout";

const THEMES: ButtonTheme[] = [
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
];

/** `undefined` es el botón sólido: el tratamiento sólido es la ausencia de clase. */
const VARIANTS: (ButtonVariant | undefined)[] = [undefined, "outline", "dash", "soft"];

const SIZES: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

export function ButtonSection() {
  const [loading, setLoading] = useState(false);

  return (
    <Section
      id="button"
      title="Button"
      description="10 roles semánticos × 4 tratamientos, 5 tamaños, formas, anchos y estados. Cada
        combinación aplica una clase que existe de verdad en css/button.css: es el contrato de
        @ownui/tw-theme/variants."
    >
      {VARIANTS.map((variant) => (
        <Row key={variant ?? "solid"} label={`variant: ${variant ?? "— (sólido)"}`}>
          {THEMES.map((theme) => (
            <Button key={theme} theme={theme} variant={variant}>
              {theme}
            </Button>
          ))}
        </Row>
      ))}

      <Row label="size">
        {SIZES.map((size) => (
          <Button key={size} size={size} theme="primary">
            size {size}
          </Button>
        ))}
      </Row>

      <Row label="shape: square / circle (icon-only, exige aria-label)">
        <Button icon={<PlusIcon />} aria-label="Añadir" theme="primary" />
        <Button icon={<PlusIcon />} aria-label="Añadir" theme="primary" shape="circle" />
        <Button icon={<PlusIcon />} aria-label="Añadir" theme="accent" variant="outline" />
        <Button
          icon={<PlusIcon />}
          aria-label="Añadir"
          theme="error"
          shape="circle"
          variant="soft"
        />
      </Row>

      <Row label="startIcon / endIcon">
        <Button theme="secondary" startIcon={<PlusIcon />}>
          Con startIcon
        </Button>
        <Button theme="secondary" variant="outline" endIcon={<ArrowIcon />}>
          Con endIcon
        </Button>
        <Button theme="info" startIcon={<PlusIcon />} endIcon={<ArrowIcon />}>
          Los dos
        </Button>
      </Row>

      <Row label="estados: active / disabled / loading">
        <Button theme="primary" active>
          active
        </Button>
        <Button theme="primary" disabled>
          disabled
        </Button>
        <Button theme="primary" variant="outline" disabled>
          disabled outline
        </Button>
        <Button theme="success" loading>
          Guardando
        </Button>
        <Button theme="warning" loading>
          El spinner acompaña al texto
        </Button>
        <Button theme="accent" loading={loading} onClick={() => setLoading((value) => !value)}>
          {loading ? "Cargando…" : "Pulsa para cargar"}
        </Button>
      </Row>

      <Row label='as="a" (polimórfico: sin disabled, con href obligatorio)'>
        <Button as="a" href="https://github.com/ferbbo/own-ui" theme="primary">
          Enlace con aspecto de botón
        </Button>
        <Button as="a" href="https://github.com/ferbbo/own-ui" theme="link">
          theme=&quot;link&quot;
        </Button>
      </Row>

      <div className="flex flex-col gap-3">
        <h3 className="font-mono text-xs uppercase tracking-widest opacity-60">
          width: wide / block
        </h3>
        <Button theme="neutral" width="wide">
          width=&quot;wide&quot; (16rem)
        </Button>
        <Button theme="neutral" width="block">
          width=&quot;block&quot; (100%)
        </Button>
      </div>
    </Section>
  );
}
