# Own UI

Librería de componentes React + sistema de theming semántico sobre **Tailwind CSS v4**,
publicada como paquetes independientes bajo el scope `@ownui/*`.

El reparto es deliberado: **el estilo vive en el plugin de Tailwind, el comportamiento vive en
React, y el contrato entre los dos es un string de clases CSS.** Un `<Button>` no lleva un solo
estilo propio: emite `class="btn btn-primary btn-md"` y esas clases las define
`@ownui/tw-theme`. La accesibilidad se delega a React Aria.

> **Arquitectura, convenciones y deuda técnica conocida: [`AGENTS.md`](./AGENTS.md).**
> Plan de trabajo por lotes: [`@docs/BUILD-BATCHES.md`](./@docs/BUILD-BATCHES.md).
> Este README documenta el uso; `AGENTS.md` documenta el sistema.

- ⚛️ React 19 (peer `>=18 <20`), TypeScript 5.7 en modo estricto
- 🎨 Theming semántico con _CSS custom properties_: se cambia de tema con un atributo
  `data-theme`, sin recompilar y sin JavaScript
- ♿ Accesibilidad vía `@react-aria/*`
- 📦 Bundle con **tsup** (ESM + CJS + `.d.ts`, banner `"use client"`)
- 📚 Storybook como escaparate visual y `apps/example-app` como prueba de consumo real
- ✅ Jest + React Testing Library para unidad, Playwright sobre CSS compilado para el plugin

**Estado: pre-1.0.** Hay tres componentes (`Button`, `Dropdown`, `Loader`). El plugin de theming
está maduro; la capa de componentes está en construcción. Lo que falta está listado y priorizado
en [`@docs/BUILD-BATCHES.md`](./@docs/BUILD-BATCHES.md), no escondido.

---

## Instalación

```bash
pnpm add @ownui/ui @ownui/tw-theme
```

Requiere **Tailwind CSS >= 4.1.0**: el plugin usa la API de v4.

### Configuración

Los tres pasos se verificaron de verdad en el lote 1 (`npm pack`, instalación del tarball en un
proyecto limpio fuera del monorepo y compilación con Tailwind 4.1.11).

En tu CSS de entrada:

```css
@import "tailwindcss";

/* 1. Tokens semánticos + utilidades de color (temas light y dark incluidos) */
@plugin "@ownui/tw-theme";

/* 2. CSS de componentes: define .btn, .dropdown y .loader */
@import "@ownui/tw-theme/css";
```

En Tailwind v4 el plugin se carga **desde el CSS** con `@plugin`: no hace falta
`tailwind.config.js` ni una entrada en `plugins: []`.

**El paso 2 no es opcional.** Sin él los componentes se renderizan sin un solo estilo: las clases
que emiten no existirían en ningún sitio. Para cargar un único componente:

```css
@import "@ownui/tw-theme/css/button.css";
```

### Uso

```jsx
import { Button, Dropdown, Loader } from "@ownui/ui";

function App() {
  return (
    <>
      <Button theme="primary">Guardar</Button>
      <Button theme="accent" variant="outline" size="lg">
        Cancelar
      </Button>
      <Button theme="success" loading>
        Enviando
      </Button>

      <Dropdown variant="primary">
        <Dropdown.Trigger>Elige</Dropdown.Trigger>
        <Dropdown.Menu>
          <Dropdown.Item onSelect={() => {}}>Opción A</Dropdown.Item>
          <Dropdown.Item disabled>Opción B</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Loader color="primary" aria-label="Cargando" />
    </>
  );
}
```

Cada componente se puede instalar suelto: `@ownui/button`, `@ownui/dropdown`, `@ownui/loader`.

---

## App de ejemplo

[`apps/example-app`](./apps/example-app/README.md) es una app de Vite + React que consume los
paquetes por `workspace:*`, con todas las variantes de los tres componentes, la escala de
superficies, un selector de tema y un tema propio declarado en CSS.

```bash
pnpm install
pnpm example          # construye las dependencias y abre Vite en :5173
pnpm example:build    # typecheck + build de producción
```

No es sólo una demo: **es la prueba de humo de consumo real.** No declara alias al fuente de los
paquetes, así que los imports resuelven por el symlink de pnpm a lo que cada `exports` publica.
Si un paquete deja de publicar algo, la app se rompe aquí antes que en el proyecto de alguien.

---

## Componentes

### Button

```jsx
<Button
  theme="primary"   // primary | secondary | accent | neutral | info | success | warning | error | ghost | link
  variant="outline" // outline | dash | soft — omitirlo es el botón sólido
  size="md"         // xs | sm | md | lg | xl
  shape="circle"    // square | circle (ancho = altura)
  width="block"     // wide (16rem) | block (100%)
  active            // aspecto de pulsado sin depender de :active
  loading           // spinner JUNTO al contenido, no en su lugar
  disabled
  startIcon={<Icon />}
  endIcon={<Icon />}
  as="button"       // "button" | "a" (con "a", href es obligatorio y disabled está prohibido)
>
  Texto
</Button>
```

Un botón icon-only usa `icon` en vez de `children`, y entonces `aria-label` es **obligatorio**:
sin texto visible no hay nombre accesible.

### Dropdown

Patrón compound: `Dropdown` + `Dropdown.Trigger` + `Dropdown.Menu` + `Dropdown.Item`. Props del
raíz: `variant` (8 roles), `size` (`xs`–`xl`), `styleVariant` (`ghost` | `bordered` | `compact`) y
`open` / `defaultOpen` / `onOpenChange` para controlarlo. Trae navegación por flechas,
`Home`/`End`, cierre con `Esc`, cierre por click fuera y retorno de foco al trigger.

### Loader

`color` (los 8 roles más `current`, que hereda el color del contexto), `size`
(`2xs`–`lg`), `as`. Lleva `role="status"` y `aria-live="polite"`.

---

## Sistema de temas

Todo el sistema de diseño son _CSS custom properties_. No hay objeto de tema en JS que el
componente consulte en runtime.

### Temas incluidos

`light` (por defecto) y `dark` (automático con `prefers-color-scheme: dark`).

### Colores semánticos

Ocho familias — `primary`, `secondary`, `accent`, `neutral`, `info`, `success`, `warning`,
`error` — cada una con tres tokens: `--color-{name}`, `--color-{name}-content` (texto legible
encima) y `--color-{name}-focus` (interacción). Más una escala de superficies:
`--color-base-100/200/300` y `--color-base-content`.

El plugin genera utilidades para todos: `.bg-primary`, `.text-primary-content`,
`.border-error-focus`, `.bg-base-200`…

### Cambiar de tema en vivo

```js
document.documentElement.setAttribute("data-theme", "dark");
```

Es un atributo: no recompila, no recarga y no ejecuta JavaScript del plugin.

### Temas propios

Se declaran **en CSS**, con la segunda entrada del plugin. Un tema por bloque:

```css
@plugin "@ownui/tw-theme/theme" {
  name: "mi-tema"; /* sólo minúsculas y guiones: ver AGENTS.md §4.6 */

  --color-primary: #7c9cff;
  --color-primary-content: #101322;
  --color-primary-focus: #a3b9ff;
  /* …el resto de familias y superficies */
}
```

Se aplica con `data-theme="mi-tema"`. Admite dos flags en el nombre: `--default` (también pinta
la raíz) y `--prefersdark` (además se aplica con `prefers-color-scheme: dark`).

Hay un ejemplo completo en
[`apps/example-app/src/styles.css`](./apps/example-app/src/styles.css) y las tres formas de
configurar el plugin, juntas, en
[`packages/storybook/.storybook/styles/tailwind.css`](./packages/storybook/.storybook/styles/tailwind.css).

---

## Desarrollo

### Requisitos

- **Node 20.16** (`.nvmrc`); `engines` exige `>=20`
- **pnpm 10** (`packageManager: pnpm@10.7.0`). No uses npm ni yarn: el repo depende de
  `workspace:*`

```bash
git clone https://github.com/ferbbo/own-ui.git
cd own-ui
pnpm install
pnpm storybook        # escaparate visual en :6006
```

### Scripts

Todos verificados ejecutándolos en el lote 9 (ver [`specs/lote-9.md`](./specs/lote-9.md)).

| Script | Qué hace |
| --- | --- |
| `pnpm build` | Construye los 6 paquetes publicables en orden topológico (Turborepo) |
| `pnpm test` | Jest, los 3 proyectos: 15 suites / 271 tests |
| `pnpm test:components` · `test:tw-theme` · `test:scripts` | Un proyecto de Jest cada uno |
| `pnpm test:watch` · `test:components:watch` · `test:tw-theme:watch` | Modo watch |
| `pnpm test:coverage` | Jest con informe de cobertura (la cobertura **no** va activada por defecto) |
| `pnpm --filter @ownui/tw-theme e2e` | Playwright sobre CSS compilado: 9 fixtures / 150 tests |
| `pnpm lint` · `pnpm lint:fix` | ESLint sobre todo el repo |
| `pnpm format` | Prettier sobre todo el repo |
| `pnpm check:contract` | Cruza React ⇄ `variants/` ⇄ CSS de cada componente. Puerta de CI |
| `pnpm check:docs` | Verifica que ningún enlace relativo de los `.md` esté roto |
| `pnpm check:contrast` | Audita el contraste WCAG AA de los temas. **Sale con 1 a propósito**: reporta la deuda pendiente del lote 22 |
| `pnpm create-component <Name>` | Genera un componente con sus tres capas ya registradas (`--compound` para el patrón provider) |
| `pnpm storybook` · `pnpm build-storybook` | Storybook en :6006 / build estático |
| `pnpm example` · `pnpm example:build` · `pnpm dev` | App de ejemplo (`dev` es un alias de `example`) |
| `pnpm changeset` | Registra un changeset antes de abrir un PR (interactivo) |
| `pnpm version` · `pnpm release` | Los ejecuta el workflow de release, no tú |

Para construir un paquete junto con sus dependencias, pídelas explícitamente:
`pnpm --filter "@ownui/ui..." build` (con los tres puntos) o `turbo build --filter=@ownui/ui`.
Un `pnpm --filter @ownui/ui build` a secas corre sólo su propio script y falla en un checkout
limpio.

### Añadir un componente

Usa `pnpm create-component <Name>`: genera el CSS, el contrato, el paquete, los tipos, el hook,
el componente, los tests y las stories, y los registra en `css/index.css`, `variants/index.ts` y
`packages/ui/src/index.ts`. El procedimiento manual equivalente está en `AGENTS.md` §7.

Antes de abrir el PR: `pnpm check:contract`, `pnpm test`, `pnpm lint` y `pnpm changeset`.

---

## Publicación

Se usa [Changesets](https://github.com/changesets/changesets).

1. **Cambias algo**: `pnpm changeset`, eliges paquetes, tipo de cambio y escribes el resumen.
2. **Se mergea a `main`**: la acción crea o actualiza un PR "Version Packages" que agrega los
   changesets, sube las versiones y actualiza los `CHANGELOG.md`.
3. **Se mergea ese PR**: se construye y se publican a npm sólo los paquetes con cambios, y se
   crean las releases de GitHub.

Paquetes publicables: `@ownui/tw-theme`, `@ownui/ui`, `@ownui/button`, `@ownui/dropdown`,
`@ownui/loader` y `@ownui/dom-utils`. `@ownui/storybook` y `@ownui/example-app` son privados.

Requiere los secretos `NPM_TOKEN` y `CHANGESET_PAT`. Detalles en
[`.github/RELEASE_SETUP.md`](./.github/RELEASE_SETUP.md).

---

## Contribuir

1. Rama desde `develop` (no desde `main`, que es la rama de publicación).
2. Lee [`AGENTS.md`](./AGENTS.md) §8, que son las reglas duras del repo.
3. `pnpm check:contract && pnpm test && pnpm lint`.
4. `pnpm changeset` si tocas un paquete publicable.
5. Commits en [conventional commits](https://www.conventionalcommits.org/); comentarios y JSDoc
   en español.
6. PR hacia `develop`.

## Licencia

MIT, declarada en el `package.json` de cada paquete. (Todavía no hay un archivo `LICENSE` en la
raíz: falta decidir la línea de copyright.)
