import { Button } from "@ownui/ui";

/**
 * Temas seleccionables.
 *
 * `light` y `dark` los inyecta `@plugin "@ownui/tw-theme"`; `ownui-dusk` lo
 * declara `styles.css` con `@plugin "@ownui/tw-theme/theme"`.
 */
export const THEMES = ["light", "dark", "ownui-dusk"] as const;

export type ThemeName = (typeof THEMES)[number];

/**
 * Aplica un tema escribiendo `data-theme` en `<html>`.
 *
 * Es todo lo que hace falta: el plugin publica cada tema bajo
 * `[data-theme="<nombre>"]`, así que cambiar el atributo repinta la página sin
 * recompilar, sin recargar y sin que ningún componente de React se entere
 * (`AGENTS.md` §4.4).
 */
export function applyTheme(theme: ThemeName) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function ThemeSwitcher({
  theme,
  onChange,
}: {
  theme: ThemeName;
  onChange: (theme: ThemeName) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-xs uppercase tracking-widest opacity-60">data-theme</span>
      {THEMES.map((name) => (
        <Button
          key={name}
          size="sm"
          theme="primary"
          variant={theme === name ? undefined : "outline"}
          active={theme === name}
          aria-pressed={theme === name}
          onClick={() => onChange(name)}
        >
          {name}
        </Button>
      ))}
    </div>
  );
}
