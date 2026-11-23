import { useEffect, useState } from "react";
import { ButtonSection } from "./sections/ButtonSection";
import { DropdownSection } from "./sections/DropdownSection";
import { InputSection } from "./sections/InputSection";
import { LoaderSection } from "./sections/LoaderSection";
import { Panel, Row, Section } from "./layout";
import { applyTheme, ThemeName, ThemeSwitcher } from "./ThemeSwitcher";

/**
 * Las clases van literales a propósito: Tailwind v4 detecta candidatos
 * escaneando el fuente, así que un `bg-${name}` interpolado no genera ninguna
 * utilidad y la tira de superficies saldría transparente.
 */
const SURFACES = [
  { token: "base-100", className: "bg-base-100" },
  { token: "base-200", className: "bg-base-200" },
  { token: "base-300", className: "bg-base-300" },
] as const;

/**
 * Tira de superficies.
 *
 * Existe porque la escala `base-100/200/300` del lote 4 es lo que decide si un
 * `.btn` sin rol y el panel del Dropdown se ven en tema claro: si un tema
 * olvida un token, aquí se nota antes que en cualquier componente.
 */
function SurfaceSection() {
  return (
    <Section
      id="surfaces"
      title="Escala de superficies"
      description="base-100 es la superficie principal, base-200 la elevada y base-300 la de bordes
        y separadores. Son tokens por tema, no globales, y el plugin genera sus utilidades
        (bg-, text-, border-, divide-)."
    >
      <Row label="utilidades de superficie">
        {SURFACES.map((surface) => (
          <div
            key={surface.token}
            className={`flex h-20 w-32 items-center justify-center rounded-lg border border-base-300 ${surface.className}`}
          >
            <span className="font-mono text-xs">{surface.token}</span>
          </div>
        ))}
      </Row>
      <Panel>
        <p className="text-sm opacity-70">
          Este panel es <code className="font-mono">bg-base-200</code> con{" "}
          <code className="font-mono">border-base-300</code>, y el texto{" "}
          <code className="font-mono">text-base-content</code> heredado del body. Cambia el tema
          arriba: no se recompila nada.
        </p>
      </Panel>
    </Section>
  );
}

export default function App() {
  const [theme, setTheme] = useState<ThemeName>("light");

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-base-100 text-base-content">
      <header className="sticky top-0 z-10 border-b border-base-300 bg-base-200 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Own UI — app de ejemplo</h1>
            <p className="text-sm opacity-70">
              Consume <code className="font-mono">@ownui/ui</code> y{" "}
              <code className="font-mono">@ownui/tw-theme</code> por{" "}
              <code className="font-mono">workspace:*</code>, igual que lo haría un proyecto
              instalado desde npm.
            </p>
          </div>
          <ThemeSwitcher theme={theme} onChange={setTheme} />
        </div>
      </header>

      <main>
        <SurfaceSection />
        <ButtonSection />
        <InputSection />
        <DropdownSection />
        <LoaderSection />
      </main>

      <footer className="border-t border-base-300 px-6 py-8 text-sm opacity-70">
        Tema activo: <code className="font-mono">data-theme=&quot;{theme}&quot;</code>. El cambio es
        un atributo en <code className="font-mono">&lt;html&gt;</code>: sin recompilar, sin recargar
        y sin JavaScript del plugin.
      </footer>
    </div>
  );
}
