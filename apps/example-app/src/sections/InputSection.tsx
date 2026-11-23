import { useState } from "react";
import { Input } from "@ownui/ui";
import type { InputSize, InputTheme, InputVariant } from "@ownui/ui";
import { Row, Section } from "../layout";

const THEMES: InputTheme[] = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "info",
  "success",
  "warning",
  "error",
];

/** `undefined` es la caja rellena por defecto. */
const VARIANTS: (InputVariant | undefined)[] = [undefined, "outline", "ghost", "bordered"];

const SIZES: InputSize[] = ["xs", "sm", "md", "lg", "xl"];

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.5 10.5 14 14" />
    </svg>
  );
}

const EMAIL = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;

export function InputSection() {
  const [email, setEmail] = useState("nombre@");

  const invalid = email.length > 0 && !EMAIL.test(email);

  return (
    <Section
      id="input"
      title="Input"
      description="Campo de texto con etiqueta, ayuda, error e iconos, sobre @react-aria/useTextField.
        El rol no pinta el relleno: colorea el borde y el anillo de foco, porque un campo con
        fondo de rol es ilegible en cuanto lleva texto."
    >
      <Row label="variant">
        {VARIANTS.map((variant) => (
          <div key={variant ?? "relleno"} className="w-56">
            <Input
              theme="primary"
              variant={variant}
              label={variant ?? "— (relleno)"}
              placeholder="Escribe algo"
            />
          </div>
        ))}
      </Row>

      <Row label="theme (el rol vive en el borde y en el foco)">
        {THEMES.map((theme) => (
          <div key={theme} className="w-44">
            <Input theme={theme} label={theme} placeholder={theme} />
          </div>
        ))}
      </Row>

      <Row label="size">
        {SIZES.map((size) => (
          <div key={size} className="w-44">
            <Input size={size} theme="primary" label={`size ${size}`} placeholder={size} />
          </div>
        ))}
      </Row>

      <Row label="ayuda, iconos y tipos">
        <div className="w-72">
          <Input
            label="Correo"
            type="email"
            placeholder="nombre@ejemplo.com"
            description="Usaremos esta dirección para el recibo."
          />
        </div>
        <div className="w-72">
          <Input
            label="Buscar"
            type="search"
            placeholder="Filtrar resultados"
            startIcon={<SearchIcon />}
          />
        </div>
        <div className="w-72">
          <Input label="Contraseña" type="password" defaultValue="secreto" />
        </div>
      </Row>

      <Row label="estados">
        <div className="w-72">
          <Input
            label="Correo con validación en vivo"
            type="email"
            value={email}
            onChange={setEmail}
            invalid={invalid}
            errorMessage="Falta el dominio: prueba nombre@ejemplo.com"
            description="Escribe para ver cómo aparece y desaparece el error."
          />
        </div>
        <div className="w-56">
          <Input label="Sólo lectura" readOnly defaultValue="ownui-9f3c21" />
        </div>
        <div className="w-56">
          <Input label="Deshabilitado" disabled defaultValue="no editable" />
        </div>
      </Row>
    </Section>
  );
}
