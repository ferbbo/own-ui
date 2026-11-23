import { useState } from "react";
import { Dropdown } from "@ownui/ui";
import type { DropdownSize, DropdownStyleVariant, DropdownVariant } from "@ownui/ui";
import { Row, Section } from "../layout";

const VARIANTS: DropdownVariant[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

const SIZES: DropdownSize[] = ["xs", "sm", "md", "lg", "xl"];

const STYLE_VARIANTS: DropdownStyleVariant[] = ["ghost", "bordered", "compact"];

const FRUITS = ["Manzana", "Plátano", "Cereza"];

function FruitMenu({ onSelect }: { onSelect?: (fruit: string) => void }) {
  return (
    <Dropdown.Menu>
      {FRUITS.map((fruit) => (
        <Dropdown.Item key={fruit} onSelect={() => onSelect?.(fruit)}>
          {fruit}
        </Dropdown.Item>
      ))}
      <Dropdown.Item disabled>Agotado</Dropdown.Item>
    </Dropdown.Menu>
  );
}

export function DropdownSection() {
  const [selected, setSelected] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <Section
      id="dropdown"
      title="Dropdown"
      description="Patrón compound con provider: Root + Trigger + Menu + Item. El trigger reutiliza
        .btn (lote 6) y el panel trae teclado completo, cierre por Esc, click-outside y retorno de
        foco (lote 7). Abre uno con Enter y recórrelo con las flechas."
    >
      <Row label="variant (8 roles semánticos)">
        {VARIANTS.map((variant) => (
          <Dropdown key={variant} variant={variant}>
            <Dropdown.Trigger>{variant}</Dropdown.Trigger>
            <FruitMenu />
          </Dropdown>
        ))}
      </Row>

      <Row label="size">
        {SIZES.map((size) => (
          <Dropdown key={size} size={size} variant="primary">
            <Dropdown.Trigger>size {size}</Dropdown.Trigger>
            <FruitMenu />
          </Dropdown>
        ))}
      </Row>

      <Row label="styleVariant">
        {STYLE_VARIANTS.map((styleVariant) => (
          <Dropdown key={styleVariant} styleVariant={styleVariant} variant="accent">
            <Dropdown.Trigger>{styleVariant}</Dropdown.Trigger>
            <FruitMenu />
          </Dropdown>
        ))}
      </Row>

      <Row label="no controlado + onSelect">
        <Dropdown variant="success">
          <Dropdown.Trigger>{selected ?? "Elige una fruta"}</Dropdown.Trigger>
          <FruitMenu onSelect={setSelected} />
        </Dropdown>
        <span className="text-sm opacity-70">
          Seleccionado: <strong>{selected ?? "nada"}</strong>
        </span>
      </Row>

      <Row label="controlado (open / onOpenChange)">
        <Dropdown variant="info" open={open} onOpenChange={setOpen}>
          <Dropdown.Trigger>Controlado desde fuera</Dropdown.Trigger>
          <FruitMenu />
        </Dropdown>
        <span className="text-sm opacity-70">
          Estado: <strong>{open ? "abierto" : "cerrado"}</strong>
        </span>
      </Row>
    </Section>
  );
}
