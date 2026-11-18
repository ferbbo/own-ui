# Fixture e2e `react-components` (rescatado)

Rescatado en el **lote 0** de la rama `copilot/update-react-to-19-0-3` (2 ahead, 42 behind),
que se descarta. **No existe en `develop`** y `AGENTS.md` §11 no lo menciona.

Monta `@ownui/button` en React + Vite con un conmutador light / dark / `brand` y un tema custom
declarado vía `@plugin`. Es el punto de partida natural del fixture `component-styles/` que
piden los criterios de aceptación del **lote 1**, y material para la app de ejemplo del **lote 9**.

> Se guarda como Markdown y no como archivos reales a propósito: es material de referencia, no
> código del proyecto. Así no entra en el lint, ni en el typecheck, ni se puede importar por
> accidente.

## Por qué importa más allá del fixture

Su `index.css` declara el tema `brand` con los **8 tokens `--color-*-focus` explícitos**. Es una
confirmación independiente, escrita por el propio autor del repo, de que esos tokens son parte
del contrato público del plugin — y respalda la decisión del lote 0 de conservarlos en vez de
adoptar la paleta de la rama `components`, que los eliminaba (ver `specs/lote-0.md` D-03/D-07).

## Avisos antes de reutilizarlo

- Fija `react`/`react-dom` en `^19.0.3` y `tailwindcss` en `4.1.1`. Ajusta a las versiones
  vigentes: el lote 0 decidió **no** adoptar React 19.0.3 (D-08).
- Usa Vite, mientras que los fixtures e2e actuales compilan con `@tailwindcss/cli` y se sirven
  estáticos. Reutilizar su contenido no obliga a meter Vite en el pipeline e2e.
- `license: ISC`, mientras el resto del repo es MIT (misma incoherencia que `@ownui/dom-utils`).

## `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link href="index.css" rel="stylesheet" />
    <title>Document</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="App.tsx"></script>
  </body>
</html>
```

## `index.css`

```css
@import "tailwindcss";

/* Plugin con configuración por defecto - habilita temas light y dark */
@plugin "@ownui/tw-theme";

/* Tema custom 'brand' con colores corporativos */
@plugin "@ownui/tw-theme/theme" {
  name: brand;
  --color-primary: #7c3aed;
  --color-primary-content: #ffffff;
  --color-primary-focus: #6d28d9;
  --color-secondary: #ec4899;
  --color-secondary-content: #ffffff;
  --color-secondary-focus: #db2777;
  --color-accent: #f97316;
  --color-accent-content: #ffffff;
  --color-accent-focus: #ea580c;
  --color-neutral: #64748b;
  --color-neutral-content: #ffffff;
  --color-neutral-focus: #475569;
  --color-info: #06b6d4;
  --color-info-content: #ffffff;
  --color-info-focus: #0891b2;
  --color-success: #10b981;
  --color-success-content: #ffffff;
  --color-success-focus: #059669;
  --color-warning: #f59e0b;
  --color-warning-content: #ffffff;
  --color-warning-focus: #d97706;
  --color-error: #ef4444;
  --color-error-content: #ffffff;
  --color-error-focus: #dc2626;
}
```

## `App.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import Button from "@ownui/button";

const App = () => {
  const [theme, setTheme] = React.useState<string>("light");

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">OwnUI Button + tw-theme Test</h1>

      {/* Theme Switcher */}
      <div className="mb-8 flex gap-2">
        <button
          onClick={() => setTheme("light")}
          className="px-4 py-2 bg-gray-200 rounded"
          id="theme-light"
        >
          Light Theme
        </button>
        <button
          onClick={() => setTheme("dark")}
          className="px-4 py-2 bg-gray-700 text-white rounded"
          id="theme-dark"
        >
          Dark Theme
        </button>
        <button
          onClick={() => setTheme("brand")}
          className="px-4 py-2 bg-purple-600 text-white rounded"
          id="theme-brand"
        >
          Brand Theme
        </button>
      </div>

      {/* Test Section */}
      <div data-theme={theme} className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">Default Button with Theme Colors</h2>
          <Button id="btn-primary" className="bg-primary text-primary-content">
            Primary Button
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Secondary Color</h2>
          <Button id="btn-secondary" className="bg-secondary text-secondary-content">
            Secondary Button
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Accent Color</h2>
          <Button id="btn-accent" className="bg-accent text-accent-content">
            Accent Button
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Info Color</h2>
          <Button id="btn-info" className="bg-info text-info-content">
            Info Button
          </Button>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">Success Color</h2>
          <Button id="btn-success" className="bg-success text-success-content">
            Success Button
          </Button>
        </section>
      </div>
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
} else {
  console.error("Root element not found");
}
```

## `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./App.tsx", "./index.html"],
};
```

## `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "./", // Usar rutas relativas para compatibilidad con sirv
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
  },
  server: {
    port: 6006,
    open: true,
  },
});
```

## `package.json`

```json
{
  "name": "react-components",
  "version": "1.0.0",
  "description": "Test react components",
  "license": "ISC",
  "author": "Diego Benitez (ferbbo)",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@ownui/tw-theme": "workspace:^",
    "@ownui/button": "workspace:^",
    "react": "^19.0.3",
    "react-dom": "^19.0.3"
  },
  "devDependencies": {
    "vite": "^5.2.6",
    "vite-tsconfig-paths": "^5.1.4",
    "@tailwindcss/vite": "4.1.1",
    "@vitejs/plugin-react": "^4.3.4",
    "tailwindcss": "4.1.1",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4"
  }
}
```
