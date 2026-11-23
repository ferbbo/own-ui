# AGENTS.md — Own UI

> Contexto canónico para agentes (Claude Code, Copilot, etc.) y para cualquier
> persona que entre al repo. Describe **lo que el código realmente hace hoy**,
> no lo que la documentación histórica aspira a hacer.
> Última verificación contra el código: **2026-11-23** (rama `claude/lote-11`, tras el lote 10).
>
> Plan de trabajo por lotes: **[`@docs/BUILD-BATCHES.md`](./@docs/BUILD-BATCHES.md)**

---

## 1. Objetivo del proyecto

Own UI es una **librería de componentes React headless-ish + sistema de theming semántico
sobre Tailwind CSS v4**, publicada en npm como paquetes independientes bajo el scope `@ownui/*`.

La tesis del proyecto tiene dos mitades:

1. **`@ownui/tw-theme`** — Un plugin de Tailwind v4 que define un **sistema de color
   semántico** (`primary`, `secondary`, `accent`, `neutral`, `info`, `success`, `warning`,
   `error`) materializado como *CSS custom properties* más utilidades generadas. Los temas se
   intercambian en runtime con `data-theme` o `prefers-color-scheme`, sin recompilar y sin
   JS. Inspiración declarada: la arquitectura de tokens de daisyUI + la organización de
   paquetes de HeroUI (ver `project-structure-heroui.drawio`).
2. **`@ownui/ui` y los paquetes por componente** — Componentes React 19 que **no llevan
   estilos propios**: sólo generan nombres de clase (`btn btn-primary btn-md`) que el plugin
   resuelve. La accesibilidad se delega a React Aria.

Consecuencia arquitectónica central: **el estilo vive en el plugin de Tailwind, el
comportamiento vive en React, y el contrato entre ambos es un string de clases CSS.**
Ese contrato se declara en `@ownui/tw-theme/variants`.

Estado real: **pre-1.0 funcional parcial.** El plugin de theming está maduro (tipado, testeado
con Jest + 6 fixtures e2e en Playwright, publicado). La capa de componentes está en estado de
prototipo y tiene desconexiones reales con el plugin — documentadas sin eufemismos en §9.

---

## 2. Stack

| Capa | Herramienta | Nota |
|---|---|---|
| Lenguaje | TypeScript 5.7 (`strict: true`, `noImplicitAny: false`) | `tsconfig.base.json` |
| UI | React 19.0.1 (forzado con `pnpm.overrides`) | peer: `>=18 <20` |
| Accesibilidad | `@react-aria/button`, `@react-aria/utils` | |
| Estilos | Tailwind CSS v4 (4.1.x) | plugin propio, sin preset |
| Monorepo | pnpm 10 workspaces + Turborepo 2.4 | `pnpm-workspace.yaml`, `turbo.json` |
| Bundler de librería | tsup (ESM + CJS, `dts: true`, banner `"use client"`) | por paquete |
| Docs visual | Storybook 8.6 + `@storybook/react-vite` | `packages/storybook` |
| Test unitario | Jest 29 + ts-jest ESM + React Testing Library | config multi-proyecto en raíz |
| Test e2e | Playwright (Chromium) sobre CSS compilado real | `packages/tw-theme/e2e` |
| Calidad | ESLint 9 flat config + Prettier + Husky | `printWidth: 100`, dobles comillas |
| Versionado | Changesets | único sistema; `.releaserc` eliminado en el lote 3 |
| Node | v20.16.0 (`.nvmrc`), `engines: node >=20, pnpm >=10` | |

---

## 3. Mapa del monorepo

`pnpm-workspace.yaml` declara `packages/**/**` y `apps/**`. El glob anidado es intencional:
**cada componente es su propio paquete npm viviendo dentro de `packages/ui/src/`.**

```
own-ui/
├── packages/
│   ├── tw-theme/                  → @ownui/tw-theme    [PUBLICADO] plugin Tailwind v4
│   │   ├── src/
│   │   │   ├── index.ts           → entry del plugin principal
│   │   │   ├── plugin.ts          → createPlugin(): temas built-in + utilidades
│   │   │   ├── theme.ts           → entry "@ownui/tw-theme/theme": temas custom
│   │   │   ├── types.ts           → SemanticColorName, PluginOptions, Flags…
│   │   │   ├── themes/            → TOKENS: root (forma), light, dark (color)
│   │   │   ├── variants/          → CONTRATO de clases: button, checkbox, dropdown, input,
│   │   │   │                        radio, switch, loader
│   │   │   ├── functions/         → generateThemeProperties, formatAndClean…, plugin.withOptions, splitStyles
│   │   │   ├── utilities/         → colors.ts (generateColorUtilities, cssVarName/Ref), file.ts
│   │   │   └── css/               → index + un .css por componente  [PUBLICADO en ./css]
│   │   └── e2e/                   → 11 fixtures + specs Playwright (193 tests)
│   │
│   ├── ui/                        → @ownui/ui          paquete agregador (barrel)
│   │   └── src/
│   │       ├── index.ts           → re-exporta los 7 componentes + tipos
│   │       ├── Button/            → @ownui/button      [paquete propio]
│   │       ├── Checkbox/          → @ownui/checkbox    [paquete propio] + CheckboxGroup
│   │       ├── Dropdown/          → @ownui/dropdown    [paquete propio]
│   │       ├── Input/             → @ownui/input       [paquete propio]
│   │       ├── Radio/             → @ownui/radio       [paquete propio] + RadioGroup
│   │       ├── Switch/            → @ownui/switch      [paquete propio]
│   │       └── Loader/            → @ownui/loader      [paquete propio]
│   │
│   ├── utils/
│   │   └── dom-utils/             → @ownui/dom-utils   useDOMRef
│   │
│   └── storybook/                 → @ownui/storybook   [private] docs visual
│
├── apps/
│   └── example-app/               → @ownui/example-app [private] Vite + React 19
│                                    consumo real por workspace:* y prueba de humo
│
├── @docs/                         → BUILD-BATCHES.md, Own_ui.fig, heroui-structure.svg,
│                                    salvage/ (material histórico, no vigente)
├── specs/                         → spec por lote (lote-0.md … lote-9.md)
├── .github/
│   ├── copilot-instructions.md    → puntero a este archivo (lote 9)
│   ├── instructions/components-react.instructions.md  → ARQUITECTURA DE COMPONENTES (canónica)
│   ├── instructions/components-css.instructions.md    → ARQUITECTURA CSS (canónica)
│   └── workflows/                 → ci.yml, release.yml
├── owonui_system.drawio           → diagrama C4-ish del sistema
├── project-structure-heroui.drawio→ referencia de arquitectura HeroUI
├── scripts/                       → create-component.mjs, check-contract.mjs,
│                                    check-contrast.mjs, check-docs-links.mjs
├── jest.config.js                 → 3 proyectos: "components", "tw-theme" y "scripts"
└── turbo.json
```

### Grafo de dependencias

```
@ownui/dom-utils ──┐
                   ├──► @ownui/button ──► @ownui/loader ──► @ownui/tw-theme/variants
@ownui/tw-theme ───┤                                            │
                   ├──► @ownui/dropdown ───────────────────────┘
                   └──► @ownui/storybook

@ownui/ui ──► importa los 3 componentes por ruta relativa (./Button/src/Button)
```

`apps/example-app` existe desde el lote 9 y **no declara alias al fuente de los paquetes**: sus
imports resuelven por el symlink de pnpm a lo que cada `exports` publica, es decir a `dist/`.
Eso la convierte en la prueba de humo de consumo real del monorepo — habría detectado el bug
raíz del lote 1— además de en documentación ejecutable. No sustituye a instalar un tarball de
`npm pack` fuera del repo (ver el protocolo de lote en `@docs/BUILD-BATCHES.md`).

---

## 4. Sistema de diseño y tokens

Todo el sistema de diseño son **CSS custom properties inyectadas con `addBase()`**. No hay
objeto de tema en JS que el componente consulte en runtime; el componente sólo concatena
nombres de clase.

### 4.1 Tokens de forma y geometría — `src/themes/root.ts`

Compartidos por todos los temas, inyectados en `:root`:

| Token | Valor | Rol |
|---|---|---|
| `--paragraph` | `1rem` | padding horizontal base de controles |
| `--fontsize` | `0.875rem` | tamaño de texto base de controles |
| `--size-field` | `0.25rem` | **unidad atómica de escala** |
| `--size` | `calc(var(--size-field) * 10)` | altura de control derivada |
| `--radius-field` | `0.375rem` | radio de esquina de campos |
| `--border` | `1px` | ancho de borde |
| `--depth` | `1` | **multiplicador de profundidad**: escala sombras, bordes y text-shadow |
| `--join-ss` / `-se` / `-es` / `-ee` | `var(--radius-field)` | radios por esquina (para `join`/grupos) |
| `--hover-depth` | `7%` | cuánto oscurece el hover (vía `color-mix`) |
| `--active-depth` | `5%` | cuánto oscurece el `:active` |
| `--disabled-bg-opacity` | `60%` | opacidad del relleno deshabilitado |
| `--disabled-fg-opacity` | `35%` | opacidad del texto deshabilitado |
| `--transition-duration` | `0.2s` | duración de las transiciones de color |
| `--control-size` · `-radius` · `-border-width` · `-gap` · `-mark-width` | `5 × --size-field`… | **capa de controles marcables** (L11): checkbox, radio y switch. Globales, no por componente, para que los tres se alineen entre sí cuando conviven en un formulario |
| `--noise` | `0` | opacidad de la textura de ruido |
| `--fx-noise` | `none` | imagen de ruido |
| `--btn-noise` | `var(--fx-noise)` | alias por componente |

Los cinco tokens de **estado** (`--hover-depth` … `--transition-duration`) entraron en el
lote 0, rescatados de la rama `components`. Son la capa que permite ajustar la intensidad de
las interacciones desde el tema: el CSS de componente los consume con alias propio y fallback
(`--btn-hover-depth: var(--hover-depth, 7%)`), nunca directamente.

El patrón `--depth` es el más idiosincrático del sistema: en lugar de tokens de sombra
discretos, las sombras se **calculan** con `color-mix` sobre el color de fondo, escalado por
`--depth`. Poner `--depth: 0` aplana todo el sistema sin tocar un solo componente.

### 4.2 Escala de superficies — `src/themes/light.ts` y `dark.ts`

Las superficies son los colores de *fondo* del sistema y el color de texto que va encima.
**Son dependientes del tema**, así que viven en los temas, no en `root.ts`:

| Token | Light | Dark | Rol |
|---|---|---|---|
| `--color-base-100` | `#ffffff` | `#1d232a` | superficie principal |
| `--color-base-200` | `#f2f2f2` | `#191e24` | superficie elevada/alterna |
| `--color-base-300` | `#e5e6e6` | `#15191e` | bordes y separadores |
| `--color-base-content` | `#1f2937` | `#e5e7eb` | texto sobre superficies |

La escala va **de la superficie principal a la más hundida en los dos temas**: `base-100` es la
más clara en light y la más clara de las oscuras en dark. No es una inversión.

Sus consumidores son tres: las 16 utilidades de superficie (§4.5), `dropdown.css`
(`--dropdown-color`, `--dropdown-item-*`) y `button.css`, que usa `--color-base-200` como
relleno por defecto y `--color-base-content` como texto del `.btn` **sin variante**.

> **Historia (lote 4).** Hasta el lote 4 esto era `src/themes/rootColors.ts`, con dos tokens
> globales y fijos: `--color-base-200: #000000` y `--color-base-content: #ffffff`. De ahí salían
> dos defectos: (1) al ser globales no cambiaban con el tema, así que un `.btn` sin variante
> salía **negro en tema claro**; (2) `--color-base-100` y `--color-base-300` simplemente **no
> existían**, aunque `dropdown.css` referenciaba el primero tres veces — y un `var()` a un token
> *indefinido* queda `guaranteed-invalid`, lo que **no** dispara el fallback (IACVT), así que el
> fondo del dropdown caía a `transparent`. El lote 4 movió la escala a los temas, la completó y
> borró `rootColors.ts`, que ya no tenía ningún color invariante que guardar.

**Consecuencia a tener presente.** Con `@plugin "@ownui/tw-theme" { themes: false }` **no hay
superficies**, igual que no hay `--color-primary`: quien deshabilite los temas built-in define
las suyas en su tema custom. Era tentador duplicarlas en `root.ts` como red de seguridad, pero
`:root` (especificidad 0,1,0) vence a `:where(:root)` (0,0,0), así que ese "fallback" ganaría al
tema y reintroduciría el bug. Ver `specs/lote-4.md` D-07.

**Regla de contrato, verificada por test.** Todo token `--color-base-*` que aparezca en
`src/css/*.css` tiene que existir en `light.ts` **y** en `dark.ts`.
`src/__tests__/surfaces.test.ts` extrae las referencias del CSS real con una regex y genera un
caso por token, así que una referencia nueva a un token inexistente falla en `pnpm test` sin que
nadie tenga que acordarse de actualizar nada. Ese mismo test exige WCAG AA (≥ 4.5:1) entre las
3 superficies y `base-content` en ambos temas.

### 4.3 Tokens de color semántico — `src/themes/light.ts` y `dark.ts`

8 familias × 3 variantes = **24 tokens por tema**:

```
--color-{name}           → color de relleno
--color-{name}-content   → color de texto legible sobre el relleno
--color-{name}-focus     → variante de interacción (hover/focus/active)
```

con `{name} ∈ primary | secondary | accent | neutral | info | success | warning | error`.

| Familia | Light | Dark | Intención |
|---|---|---|---|
| primary | `#3b82f6` | `#60a5fa` | azul, acción principal |
| secondary | `#10b981` | `#34d399` | verde |
| accent | `#8b5cf6` | `#a78bfa` | violeta |
| neutral | `#6b7280` | `#9ca3af` | gris |
| info | `#0ea5e9` | `#38bdf8` | cian |
| success | `#22c55e` | `#4ade80` | verde |
| warning | `#f59e0b` | `#fbbf24` | ámbar |
| error | `#ef4444` | `#f87171` | rojo |

El tema dark **no es una inversión**: aclara el relleno y oscurece el `-content` a `#1e293b`,
lo que mantiene el contraste en superficies oscuras. Los valores son hex planos de la paleta
Tailwind; el `-focus` de light es un paso más oscuro, y en dark es el valor de light.

✅ **Esta tabla describe el estado actual de `develop`, y es la paleta vigente.** El lote 0
decidió **no** adoptar la paleta de marca que proponía la rama `components` (Piccolo
`#4E46B4`, Hit `#40A69F`, Goku `#F5F5F5`, Beerus `#444444`…): es una decisión de producto, y
tal como venía era además defectuosa (`--color-accent` idéntico a `--color-primary`, y
`--color-accent-content` idéntico a `--color-accent`, o sea texto invisible).

Consecuencia importante: **los 8 tokens `--color-*-focus` siguen siendo parte del contrato.**
La rama `components` los eliminaba, y de ahí salían sus tres regresiones. Si algún día se
cambia la paleta, hay que mantenerlos o retirar a la vez sus tres consumidores:
`css/button.css`, las 40 utilidades que genera `utilities/colors.ts` (`semanticColorVariants`
incluye `-focus`) y los temas custom de los consumidores. Ver `specs/lote-0.md` D-03/D-07.

**P-02 decidida (aprobada por el dueño, 2026-11-19): esta paleta neutra se queda como tema
built-in por defecto, y la paleta de marca se publicará como tema con nombre**, con
`@plugin "@ownui/tw-theme/theme" { name: "ownui --default"; … }`. El motivo: una librería de
componentes cuyo tema por defecto es la marca de su autor obliga a cada consumidor a
sobreescribir 24 tokens antes de usarla. La marca entra en el lote 21 junto con la auditoría
de contraste del 22, en cuanto el dueño fije los hex definitivos (con sus `-content` que pasen
WCAG AA y sus 8 `-focus`). Ver `@docs/BUILD-BATCHES.md` L21.

### 4.4 Cómo se inyectan los temas — `src/plugin.ts`

```css
:root                                    { /* root.ts: forma y geometria */ }
:where(:root), [data-theme="light"]      { /* light.ts */ }
[data-theme="dark"]                      { /* dark.ts */ }
@media (prefers-color-scheme: dark) {
  :root                                  { /* dark.ts */ }
}
```

El uso de `:where()` baja la especificidad a 0, de modo que `[data-theme="dark"]` siempre
gana sobre el tema por defecto. Es el mecanismo que hace que
`document.documentElement.setAttribute('data-theme','dark')` funcione sin `!important`.

### 4.5 Utilidades generadas — `src/utilities/colors.ts`

`generateColorUtilities()` produce **136 clases**: 120 semánticas + 16 de superficie.

Las **120 semánticas** son 8 colores × 3 variantes × 5 prefijos:

| Prefijo | Propiedad emitida |
|---|---|
| `.bg-{token}` | `background-color` |
| `.text-{token}` | `color` |
| `.border-{token}` | `border-color` |
| `.ring-{token}` | `--tw-ring-color` |
| `.divide-{token}` | `--tw-divide-color` |

Ej.: `.bg-primary`, `.text-primary-content`, `.border-primary-focus`, `.ring-error`.

Las **16 de superficie** (lote 4, `generateSurfaceUtilities()`) son los 4 tokens de §4.2 ×
**4 prefijos**: `bg`, `text`, `border` y `divide`. Ej.: `.bg-base-100`, `.text-base-content`,
`.border-base-300`, `.divide-base-300`.

Dos asimetrías deliberadas respecto a las semánticas, las dos para no emitir clases que
apunten al vacío:

- **Sin variantes `-content` ni `-focus`.** `surfaceColorNames` es una lista **separada** de
  `semanticColorNames` justamente por esto: el generador semántico multiplica nombre × variante,
  así que meter las superficies ahí emitiría `.bg-base-100-content`, `.bg-base-100-focus` y 13
  clases más apuntando a tokens que ningún tema define. Es el mismo defecto que la rama
  `components` introdujo con los `-focus` (§11.1).
- **Sin prefijo `ring`.** Un anillo de foco del color de la propia superficie no contrasta con
  ella. Ver `specs/lote-4.md` D-04 (y P-01, por si se decide lo contrario).

Hay un bloque comentado que iteraba `vars` dinámicamente — intento abandonado de derivar
utilidades de tokens arbitrarios (p. ej. `--color-brand`). Hoy la lista es **estática**: un
token custom como `--color-brand` se inyecta pero **no genera utilidades**.

### 4.6 Configuración del plugin — `PluginOptions`

Dos entradas distintas, con responsabilidades separadas:

**(a) `@plugin "@ownui/tw-theme"`** — temas built-in + utilidades:

```css
@plugin "@ownui/tw-theme" {
  root: ":root";          /* selector raíz; default ":root" */
  colorScheme: "light dark";
  themes: false;          /* false = NO inyectar light/dark built-in */
}
```

**(b) `@plugin "@ownui/tw-theme/theme"`** — registra **un** tema custom:

```css
@plugin "@ownui/tw-theme/theme" {
  name: "onion --prefersdark";   /* "<nombre> <flag>" */
  --color-primary: #8e44ad;
  --color-primary-content: #f0e9e0;
  /* … cualquier --* string */
}
```

Flags (`src/types.ts`, enum `Flags`):

| Flag | Efecto |
|---|---|
| `--default` | el tema se aplica en `:where(<root>)` y en `[data-theme="<name>"]` |
| `--prefersdark` | además se aplica en `@media (prefers-color-scheme: dark)` |

`formatAndCleanPluginConfig` sanea las opciones de forma agresiva: `name` y `themes` pasan por
`replace(/[^a-z,-\s]+/g, '')` → **nombres de tema con mayúsculas o dígitos se corrompen
silenciosamente**. Usa sólo minúsculas y guiones.

Referencia viva de las tres formas de configurar: `packages/storybook/.storybook/styles/tailwind.css`.

### 4.7 El contrato de clases — `src/variants/*.ts`

Mapa `prop de React → clase CSS`, consumido por los hooks de los componentes vía
`import { button } from "@ownui/tw-theme/variants"`:

```ts
// variants/button.ts  (estado tras el lote 5)
theme:   { primary: "btn-primary", …, ghost: "btn-ghost", link: "btn-link" }  // 10 roles
variant: { outline: "btn-outline", dash: "btn-dash", soft: "btn-soft" }       // 3 tratamientos
size:    { xs: "btn-xs", …, xl: "btn-xl" }
shape:   { square: "btn-square", circle: "btn-circle" }
width:   { wide: "btn-wide", block: "btn-block" }
state:   { active: "btn-active", disabled: "btn-disabled" }
```

Este archivo es **la fuente de verdad del contrato** entre React y CSS. Cuando una prop de
componente, una entrada de `variants/` y un selector en `css/` se desalinean, aparecen bugs
silenciosos de "la clase no se aplica" — es lo que pasaba con `Button.variant` (§9.4, resuelto
en el lote 5) y con `dropdown-menu` (§9.7, resuelto en el lote 6).

Desde el lote 5 la regla **se verifica**, y hay dos tests que lo hacen:

- `packages/tw-theme/src/variants/__tests__/contract.test.ts` (lote 5) cruza cada clase
  declarada en `variants/{button,loader}.ts` contra los selectores de `css/{button,loader}.css`.
  Añadir una prop sin su CSS —o borrar una clase que el contrato promete— rompe la suite.
- `packages/tw-theme/src/__tests__/dropdown-contract.test.ts` (lote 6) hace lo propio con el
  Dropdown, que necesita su propio test por dos motivos: sus hooks construyen las clases con
  plantillas (`dropdown-${variant}`) en vez de leer el mapa, así que el test las expande desde
  las uniones de `Dropdown.types.ts`; y su trigger es un `.btn`, así que el contrato es
  **cruzado** y hay que validarlo también contra `button.css`. Cuando el lote 5 escribió su
  test, `dropdown` quedó fuera a propósito porque prometía clases que su CSS no definía.

Dos aclaraciones del contrato de `button`, porque la intuición falla:

- **No existe `variant="solid"`.** El botón sólido es la *ausencia* de tratamiento: el `.btn`
  base ya pinta `--btn-bg: var(--btn-color)`. `.btn-solid` nunca existió en el CSS.
- **`ghost` es un rol, no un tratamiento** (`theme="ghost"`): fija el color de texto desde
  `--btn-color`. Estaba duplicado en los dos mapas hasta el lote 5.

### 4.8 Convención CSS por componente — `src/css/*.css`

Patrón de cascada de custom properties (documentado en
`.github/instructions/components-css.instructions.md`):

```css
.btn {                                   /* 1. base define TODAS las props */
  background-color: var(--btn-bg);
  --btn-color: var(--color-base-200);     /*    color semántico actual */
  --btn-bg: var(--btn-color, var(--color-base-200));
  --btn-fg: var(--color-base-content);
  --btn-border: color-mix(in oklab, var(--btn-bg), #000 calc(var(--depth) * 5%));
}
.btn-primary {                           /* 2. la variante sólo cambia --btn-color */
  --btn-color: var(--color-primary);
  --btn-fg:    var(--color-primary-content);
}
.btn:hover {                             /* 3. los estados recalculan por color-mix */
  --btn-bg: color-mix(in oklab, var(--btn-color), #000 7%);
}
```

Reglas duras de este patrón:
- **Nomenclatura**: `--{componente}-{propiedad}` (`--btn-bg`, `--dropdown-item-fg`).
- Una variante **nunca** escribe `background-color` directo; sólo redefine `--{c}-color`.
- Los estados (`:hover`, `:active`, `:disabled`, `.{c}-active`) sólo redefinen custom properties.
- Todas las mezclas en espacio `oklab`/`oklch`, nunca sRGB.
- Siempre fallback: `var(--btn-color, var(--color-base-200))`.
- Anidamiento CSS nativo (`&:hover`) — requiere `postcss-nesting` en el pipeline.
- **El orden importa tanto como la especificidad.** `.btn:where(:disabled, …)` y `.btn-primary`
  tienen la misma especificidad (0,1,0), así que un estado final como `:disabled` tiene que
  declararse **después** de los roles y los tratamientos o éstos le sobreescriben el color.
  `button.css` lo documenta en su propia sección 4.

`button.css` se reescribió en el lote 0 (rescate de la rama `components`) y **ya no usa
`@apply`**: resuelve todo con custom properties puras, lo que elimina la dependencia del
pipeline de `@apply` para ese archivo. `dropdown.css` y `loader.css` sí lo siguen usando.

Clases existentes hoy:

| Archivo | Selectores |
|---|---|
| `button.css` (306 ln) | `.btn`, `.btn-active`, 8 semánticos, `.btn-ghost`, `.btn-link`, `.btn-outline`, `.btn-dash`, `.btn-soft`, `.btn-{xs..xl}`, `.btn-square`, `.btn-circle`, `.btn-wide`, `.btn-block` |
| `dropdown.css` (540 ln) | `.dropdown` (wrapper), `.dropdown-open`, `.dropdown-trigger` (+ `-active`, sobre `.btn`), `.dropdown-menu` (+ `-open`/`-closed`), `.dropdown-item` (+ selected/disabled/text), **8** semánticos, `.dropdown-{xs..xl}`, `.dropdown-{ghost,bordered,compact}`, y los mismos tres grupos repetidos con prefijo `.dropdown-menu-*`, más un bloque `prefers-reduced-motion` |
| `loader.css` (119 ln) | `.loader`, `.loader-spinner`, `@keyframes loader-spin`, `.loader-{2xs..lg}`, 8 colores + `.loader-current` (hereda `currentColor`, L5), soporte `prefers-reduced-motion` |
| `index.css` | agregador: `@import` de los tres anteriores. Es el destino de `@ownui/tw-theme/css` |

Estos archivos **sí llegan al paquete publicado** desde el lote 1: el build los copia a
`dist/css/` y se exponen como `@ownui/tw-theme/css` (todos) y `@ownui/tw-theme/css/<archivo>`
(uno a uno). El consumidor los carga desde su CSS de entrada, **no** como hoja de estilos
estática, porque `loader.css` usa `@apply` y hace falta que pasen por su build de Tailwind:

```css
@import "tailwindcss";
@plugin "@ownui/tw-theme";
@import "@ownui/tw-theme/css";
```

`menu.css` existía vacío (0 líneas) y se eliminó en el lote 1: no hay componente `Menu` ni
`variants/menu.ts`. Las clases `.dropdown-menu*` que el Dropdown emite **ya tienen CSS** desde
el lote 6 (§9.7).

#### Los tres niveles del Dropdown (lote 6)

El Dropdown es el único componente con cascada en tres niveles, y la regla de dónde se declara
cada token no es opcional: los hooks ponen la variante **dos veces**, en el wrapper
(`.dropdown-primary`) y en el panel (`.dropdown-menu-primary`). Como una custom property
declarada en el mismo elemento que la consume gana siempre a la heredada, el patrón es:

| Nivel | Clase | Rol |
|---|---|---|
| wrapper | `.dropdown` | `position: relative`, **sin superficie propia**. Declara TODOS los defaults de token |
| trigger | `.dropdown-trigger` | **es un `.btn`** (ver abajo): aquí sólo ancho completo y reparto horizontal |
| panel | `.dropdown-menu` | absoluto bajo el trigger, elevado, con superficie y radio. **No declara defaults** |
| fila | `.dropdown-item` | estados por `color-mix`. **No declara defaults** |

- Los hijos consumen con cadena de fallback (`var(--dropdown-menu-bg, var(--dropdown-color,
  var(--color-base-100)))`), así que siguen resolviendo sin wrapper.
- Cada variante se declara con lista de selectores (`.dropdown-x, .dropdown-menu-x`) para
  funcionar desde cualquiera de los dos niveles.
- Los defaults **compuestos** (sombra, `border-color` derivado) van en el fallback del `var()`
  que los consume, no como token: así `color-mix` se evalúa en el elemento final.
- El bloque `prefers-reduced-motion` va **al final del archivo**: tiene la misma especificidad
  que las reglas que anula y sólo gana por orden de aparición. Cubre también al trigger, que
  siendo un `.btn` no tendría ninguna reducción de movimiento (`button.css` no trae ese bloque).

**El rol semántico es acento, no superficie.** `--dropdown-color` es la superficie del panel y
**no cambia** con la variante: las 8 variantes fijan `--dropdown-role` /
`--dropdown-role-content` / `--dropdown-focus-color`, y ese acento lo consumen sólo el item
activo, el anillo de foco y el trigger (vía su `btn-{rol}`). Así el panel pasa WCAG AA siempre
(`--color-base-content` sobre `--color-base-100`) en vez de depender de que el `-content` de
cada rol contraste con su relleno — que con la paleta actual no ocurre en `warning` ni en
`success` (§9.10). Sin variante, el item activo cae a un realce neutro por `color-mix`.

**El trigger es un `.btn`.** `useDropdownTrigger` emite
`btn btn-{rol} btn-{tamaño} dropdown-trigger`, leyendo `theme` y `size` de
`variants/button.ts`. Superficie, altura, relleno, radio, hover, `:focus-visible` y `:disabled`
salen de `button.css`; `dropdown.css` sólo añade `width: 100%`, `justify-content: space-between`
y `.dropdown-trigger-active`, que remapea los tokens `--btn-*` en vez de duplicar la receta de
color. Dos consecuencias que hay que tener presentes:

1. **El contrato del Dropdown es cruzado.** Retirar un rol o un tamaño de `button.css` o de
   `variants/button.ts` deja el trigger sin estilo sin que `dropdown.css` cambie. Lo cubre el
   bloque «D-08» de `src/__tests__/dropdown-contract.test.ts`.
2. **El orden de los `@import` de `index.css` es funcional**, no cosmético: `button.css` antes
   de `dropdown.css`. Lo fija el fixture e2e midiendo `justify-content`.

---

## 5. Arquitectura frontend (componentes)

Norma canónica: **`.github/instructions/components-react.instructions.md`**. Resumen operativo:

### 5.1 Estructura de carpeta por componente

```
packages/ui/src/<Name>/
├── src/
│   ├── <Name>.tsx          # sólo render + forwardRef; export default React.memo(...)
│   ├── use<Name>.tsx       # TODA la lógica: clases, aria, merge de props, elemento
│   ├── <Name>.types.ts     # uniones discriminadas, props polimórficas
│   ├── <Name>Context.tsx   # sólo en patrón Provider
│   ├── <Name>.stories.tsx
│   └── index.ts            # export default + tipos + hooks públicos
├── __test__/<Name>.test.tsx
├── package.json            # @ownui/<name>, sideEffects:false, access public
├── tsconfig.json
└── tsup.config.ts
```

### 5.2 Patrón A — Composición simple (Button, Loader)

El componente es una cáscara tonta; el hook decide todo:

```tsx
const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const { children, loading } = props;
    const { classNames, buttonProps, Comp } = useButton(props, ref);
    return (
      <Comp ref={ref} className={classNames} {...buttonProps}>
        {loading ? <Loader /> : <>{children}</>}
      </Comp>
    );
  }
);
export default React.memo(Button);
```

El hook sigue siempre la misma secuencia de 5 pasos (ver `useButton.tsx`):

1. **Destructuring con defaults** → `theme = "primary"`, `size = "md"`, `as = rawAs ?? "button"`.
2. **`useMemo` para el string de clases** → `[base, themeCls, variantCls, sizeCls, disabledCls, className].filter(Boolean).join(" ")`, leyendo los mapas de `@ownui/tw-theme/variants`.
3. **Resolver atributos según `as`** → `type` para `<button>`, `href` para `<a>`.
4. **React Aria** → `useDOMRef(ref)` + `useAriaButton({ onPress, isDisabled, elementType }, innerRef)`.
5. **`mergeProps(ariaProps, nativos, restProps)`** y devolver `{ Comp, classNames, buttonProps }`.

`useDOMRef` (`@ownui/dom-utils`) resuelve la fricción entre el `RefObject` que React Aria
exige y el `Ref` que `forwardRef` entrega, usando `useImperativeHandle`.

### 5.3 Patrón B — Provider / compound (Dropdown)

Umbral de decisión (de la guía): **3+ subcomponentes, estado compartido, o prop drilling >2 niveles.**

```
DropdownRoot (forwardRef)   ← separa contextProps de domProps EXPLÍCITAMENTE
└── DropdownProvider          ← estado (open/setOpen) + config + ids (useId) + refs
    └── DropdownContainer     ← useDropdown()        → clases .dropdown*, ref del wrapper
        ├── Dropdown.Trigger  ← useDropdownTrigger() → btn + React Aria useButton,
        │                                              aria-expanded/-controls, flechas
        ├── Dropdown.Menu     ← useDropdownMenu()    → role="menu"; SIEMPRE montado
        │                                              (aria-hidden + inert si cerrado);
        │                                              teclado, foco inicial, click-outside
        └── Dropdown.Item     ← useDropdownItem()    → role="menuitem", Enter/Space
```

- **Controlado vs no controlado**: `isControlled = controlledOpen !== undefined`; `setOpen`
  sólo escribe estado interno si no está controlado, y siempre llama `onOpenChange?.()`.
- El compound se ensambla con un *cast*, no con `Object.assign` genérico:
  `const Dropdown = MemoizedDropdown as DropdownCompoundComponent; Dropdown.Trigger = …`
- `useDropdownContext()` lanza error si se usa fuera del provider (fail-fast intencional).
- Los subcomponentes **no reciben props de configuración**: las leen del contexto.
- **El root separa props de configuración y props de DOM con una desestructuración
  explícita**, nunca con rest spread del objeto completo. Lo que no se desestructura es, por el
  tipo (`DropdownDOMProps`), un atributo válido del `<div>`. Hacerlo al revés fue el bug §9.8.
- **El provider es el dueño de la identidad y de las refs**, no los hooks: los `id` (`useId`)
  enlazan trigger y menú por ARIA en los dos sentidos (`aria-controls` / `aria-labelledby`), y
  las refs del trigger, del menú y del wrapper las comparten tres subcomponentes (retorno de
  foco, movimiento del foco y click-outside).
- **`setOpen(open, { returnFocus })`**: no todos los cierres son iguales. `Esc` y la selección
  devuelven el foco al trigger (si no, se queda en un nodo que acaba de desmontarse); un click
  fuera **no**, porque ahí el usuario va a otra parte y robarle el foco es hostil.

#### Teclado del menú (patrón de la APG, lote 7)

| Tecla | Dónde | Efecto |
|---|---|---|
| `Enter` / `Space` | trigger | abre/cierra (lo da React Aria `useButton`) |
| `ArrowDown` / `ArrowUp` | trigger | abre y mete el foco en el primer/último item |
| `ArrowDown` / `ArrowUp` | menú | mueven el foco, con vuelta circular, **saltando deshabilitados** |
| `Home` / `End` | menú | primer / último item habilitado |
| `Enter` / `Space` | item | selecciona, cierra y devuelve el foco |
| `Esc` | menú | cierra y devuelve el foco al trigger |
| `Tab` | menú | cierra **sin** `preventDefault`: el foco sigue su camino natural |

Dos decisiones de implementación que conviene no deshacer sin leer `specs/lote-7.md`:

1. **El handler vive en el menú, no en cada item.** Los eventos de los items burbujean, así que
   un único `onKeyDown` cubre la lista entera.
2. **Los items se consultan al DOM en el momento de la pulsación**
   (`[role="menuitem"]:not([aria-disabled="true"])`), no con un registro de refs: son hijos
   libres del compound y pueden aparecer, desaparecer o reordenarse, así que cualquier índice
   guardado se queda obsoleto. El filtro del selector es además lo que hace que las flechas
   salten los deshabilitados sin lógica extra.
3. **`tabIndex` es -1 en todos los items**, incluidos los habilitados: el único punto de entrada
   por `Tab` es el trigger.

**Dónde NO se usa React Aria, y por qué.** `@react-aria/menu` trabaja sobre el modelo de
colecciones de React Stately: los items tendrían que ser `<Item>` de
`@react-stately/collections` en vez de JSX libre. Migrar no es cambiar de motor de teclado, es
romper la API pública del compound. Se decidió implementar el patrón de la APG en los hooks y
revisarlo cuando el componente se rehaga como `Select` con API de colección (L16). El trigger
**sí** pasa por React Aria (`@react-aria/button`). Es una desviación consciente de §8.5,
registrada en `specs/lote-7.md` D-01.

### 5.4 Convenciones de tipado

Uniones discriminadas sobre `as`, con props prohibidas vía `never`:

```ts
interface ButtonAsButtonProps extends ButtonBaseProps, ButtonHTMLAttributes<HTMLButtonElement> {
  as?: "button";
}
interface ButtonAsAnchorProps extends ButtonBaseProps,
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "disabled"> {
  as: "a";
  href: string;        // obligatorio
  disabled?: never;    // prohibido en <a>
}
export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;
```

Loader usa en cambio el patrón genérico `LoaderProps<T extends ElementType = "div">` con
`Omit<ComponentPropsWithoutRef<T>, keyof LoaderBaseProps>`. **Son dos patrones polimórficos
distintos coexistiendo**; conviene unificar (ver lote 5 del plan).

### 5.5 Reglas de rendimiento y a11y (no negociables)

- `React.memo` en todo componente exportado; `useMemo` para el string de clases; `useCallback`
  para handlers que cruzan el contexto.
- Todo componente interactivo pasa por un hook de `@react-aria/*`. Nada de `onClick` crudo
  sobre un `<div>` sin `role` + `tabIndex` + manejo de teclado.
- `aria-*` derivados del estado real (`aria-expanded={open}`, `aria-hidden={!open}`,
  `aria-disabled`, `role="status"` + `aria-live="polite"` en Loader).

### 5.6 Inventario de componentes (estado real)

| Paquete | Patrón | Props públicas | Tests | Stories | Estado |
|---|---|---|---|---|---|
| `@ownui/button` | Composición | `as`, `theme`(10), `variant`(3), `size`(5), `shape`(2), `width`(2), `active`, `disabled`, `loading`, `icon`, `startIcon`, `endIcon`, `className` | ✅ 39 reales (L5) | 15 stories | **completo** (L5): contrato alineado, `loading` con `aria-busy`, iconos reales, sin fuga de props |
| `@ownui/dropdown` | Provider | `variant`(8), `size`(5), `styleVariant`(3), `open`/`defaultOpen`/`onOpenChange` + `.Trigger`/`.Menu`/`.Item` | ✅ reales | 296 ln | **parcial**: sin CSS para menu/trigger, sin navegación por teclado, fuga de props al DOM |
| `@ownui/input` | Composición | `label`, `description`, `errorMessage`, `invalid`, `theme`(8), `variant`(3), `size`(5), `type`(7), `startIcon`, `endIcon`, `readOnly`, `disabled`, `value`/`defaultValue`/`onChange` | ✅ reales (33) | 142 ln | **sano** (L10): `useTextField`, el rol colorea borde y foco en vez del relleno, cobertura 100% líneas |
| `@ownui/checkbox` | Composición + Provider | `theme`(8), `size`(5), `checked`/`defaultChecked`/`onChange`, `indeterminate`, `value`, `invalid`, `readOnly`, `disabled` · `CheckboxGroup`: `label`, `description`, `errorMessage`, `value`/`defaultValue`/`onChange` | ✅ reales (32) | 119 ln | **sano** (L11): `useCheckbox` / `useCheckboxGroupItem`, tercer estado, 100% líneas |
| `@ownui/radio` | Provider | `RadioGroup`: `label`, `description`, `errorMessage`, `orientation`, `value`/`defaultValue`/`onChange` · `Radio`: `value` (obligatorio), `theme`, `size`, `disabled` | ✅ reales (23) | 134 ln | **sano** (L11): flechas y tabindex rotatorio; un `<Radio>` suelto lanza |
| `@ownui/switch` | Composición | `theme`(8), `size`(5), `checked`/`defaultChecked`/`onChange`, `invalid`, `readOnly`, `disabled` | ✅ reales (18) | 95 ln | **sano** (L11): `role="switch"`; sin tercer estado ni grupo, a propósito |
| `@ownui/loader` | Composición | `as`, `color`(8 + `current`), `size`(5), `aria-label`, `id` | ✅ reales | 121 ln | sano; `color="current"` desde L5 (hereda `currentColor`); `Loader.variants.ts` vacío |
| `@ownui/dom-utils` | — | `useDOMRef` | ✅ 6 reales (L2) | — | ok |
| `@ownui/tw-theme` | — | ver §4 | ✅ 3 suites + 6 fixtures e2e | — | **maduro** |

---

## 6. Build, test y release

### 6.1 Comandos reales

```bash
pnpm install                       # requiere Node 20.16 / pnpm 10

pnpm build                         # turbo build — los 6 paquetes en orden topológico
pnpm --filter "@ownui/ui..." build # el agregador + sus dependencias (ojo a los 3 puntos)
turbo build --filter=@ownui/ui     # equivalente vía turbo (usa dependsOn: ["^build"])
pnpm --filter @ownui/button build  # SÓLO ese paquete: falla en limpio si sus deps no están

pnpm test                          # Jest, los 3 proyectos — 19 suites / 400 tests (sin coverage)
pnpm test:coverage                 # lo mismo + informe de cobertura
pnpm test:tw-theme                 # sólo el plugin
pnpm test:components               # componentes de packages/ui + utils de packages/utils
pnpm test:scripts                  # los CLIs de scripts/ (lote 8)

pnpm --filter @ownui/tw-theme e2e  # compila fixtures + Playwright (11 fixtures / 193 tests)

pnpm create-component <Name>       # andamio completo del componente (lote 8)
pnpm create-component <Name> --compound   # patrón Provider + Trigger/Panel/Item
pnpm check:contract                # React ⇄ variants/ ⇄ css/ — puerta en CI
pnpm check:contrast                # auditoría WCAG de los pares color / -content
pnpm check:docs                    # enlaces relativos de los .md (lote 9)

pnpm lint  /  pnpm lint:fix  /  pnpm format
pnpm changeset                     # crear changeset antes de abrir PR

pnpm storybook                     # :6006 (delega en @ownui/storybook)
pnpm build-storybook               # build estático del Storybook

pnpm example                       # app de ejemplo en :5173 (construye sus deps antes)
pnpm example:build                 # typecheck + build de producción de la app
pnpm dev                           # alias de `pnpm example`
```

> **`pnpm check:contrast` sale con código 1 a propósito**: reporta los 15 pares por debajo de
> 4.5:1 que son el alcance del lote 22. Es un informe de deuda, no un fallo del comando.

> **La app de ejemplo no entra en `turbo build`.** Su script se llama `build:app`, no `build`,
> para que ni CI ni `release.yml` —que invocan `pnpm build`— dependan nunca de que una demo
> compile. `pnpm example` y `pnpm example:build` construyen antes sus dependencias con
> `turbo build --filter=@ownui/example-app^...`, así que funcionan desde un checkout limpio.

> **Orden topológico.** `pnpm --filter <pkg> build` ejecuta **sólo** el script de ese paquete:
> pnpm no construye sus dependencias. Para que las construya hay que pedirlo — con el sufijo
> `...` (`pnpm --filter "@ownui/ui..." build`) o con turbo, que lo deriva de
> `dependsOn: ["^build"]`. Es semántica de pnpm, no un defecto del repo.

### 6.2 tsup por paquete

```ts
{ entry: ["src/index.ts"], format: ["cjs","esm"], dts: true, clean: true,
  target: "es2019", banner: { js: '"use client";' },   // compatibilidad RSC/Next
  external: ["react","react-dom"], treeshake: true, minify: true }
```

`tw-theme` difiere: sólo ESM, `minify: false`, `external: ["tailwindcss","@tailwindcss/oxide"]`
(no empaquetar Oxide), y multi-entry `["src/index.ts","src/theme.ts","src/variants/*.ts"]` para
sostener los subpath exports `.`, `./theme`, `./variants`. Desde el lote 1 añade un hook
`onSuccess` que copia `src/css` → `dist/css` (tsup no procesa CSS), que es lo que sostiene los
exports `./css` y `./css/*`.

### 6.3 Jest — tres proyectos

| Proyecto | Entorno | testMatch |
|---|---|---|
| `components` | jsdom | `packages/ui/**/__test__/**` + `packages/utils/**/__test__/**` ✅ |
| `tw-theme` | node | `packages/tw-theme/src/**/*.{test,spec}.{ts,tsx}` ✅ |
| `scripts` | node | `scripts/__tests__/**/*.{test,spec}.ts` ✅ (lote 8) |

El proyecto `scripts` prueba los CLIs de `scripts/` invocándolos con `execFileSync` sobre un
árbol temporal: así se verifica también su **código de salida**, que es lo que los convierte en
puerta de CI. Se eligió un tercer proyecto de Jest en vez de `node --test` para no meter un
segundo runner de tests en el repo.

Preset `ts-jest/presets/default-esm`; CSS mapeado a `identity-obj-proxy`; `maxWorkers: "50%"`.
La cobertura **no** es global: se pide con `pnpm test:coverage` (corregido en el lote 2).

El proyecto `components` resuelve los paquetes del workspace **a su código fuente**, no a
`dist/`, en dos sitios que hay que mover juntos:

- `moduleNameMapper` de `jest.config.js` → resolución en runtime.
- `paths` de `tsconfig.jest.json` → resolución de tipos para ts-jest.

Así las suites corren en un clon limpio sin `pnpm build` previo (los `exports` de cada paquete
apuntan a `dist/`, que no existe hasta construir) y la cobertura se atribuye al fuente.
Convención de los marcadores de defecto: un bug conocido que pertenece a otro lote se deja
documentado con `test.failing(... "(lote N)")`; cuando ese lote lo arregle, el marcador pasará
a fallar y habrá que convertirlo en `test` normal.

### 6.4 E2E del plugin — el patrón más valioso del repo

`packages/tw-theme/e2e/` no testea JS: **compila CSS real con la CLI de Tailwind y verifica en
Chromium los valores computados**.

```
fixtures/<caso>/{tailwind.config.js, input.css, index.html}
  → scripts/compile-fixtures.js  → e2e/dist/
  → sirv en :3456 → tests/<caso>.spec.ts
```

Fixtures: `default-themes`, `no-default-themes`, `custom-theme`, `theme-switching`,
`utility-classes`, `custom-root-scope`. **Cualquier token o utilidad nueva debe venir con su
fixture.** Es el único mecanismo que detecta regresiones reales del plugin.

### 6.5 CI/CD

- **`ci.yml`** (PR → `main` o `develop`, y push → `develop`): tubería lineal
  `install → lint → build → test → e2e`, sin detección de cambios. Lint entra con
  `continue-on-error: true` hasta que el lote 6 cierre los 4 errores de `Dropdown.stories.tsx`.
  Reescrito en el lote 3: antes disparaba **sólo** en PRs a `main`, así que ningún PR de los
  lotes 0–3 pasó por CI; la detección de cambios comparaba contra `main` (diff equivocado en un
  PR a `develop`); y el paso de tests era `pnpm test:$pkg || echo "No tests for $pkg"`, que
  invocaba `test:ui`/`test:utils` —scripts inexistentes— y se tragaba el fallo.
- **`release.yml`** (push → main): `pnpm build` → `pnpm version` (changesets) →
  `pnpm release` (`changeset publish`) → GitHub Releases vía `changesets/action`.
  Secrets: `NPM_TOKEN`, `CHANGESET_PAT`.
- El release cubre los **6 paquetes publicables** (los que el README anuncia); `@ownui/storybook`
  queda fuera por `private: true`. `changeset publish` sólo publica lo que tenga changeset
  (resuelto en el lote 3; antes estaba cableado sólo a `@ownui/tw-theme`).
- Changesets es el **único** sistema de release. `.releaserc` (semantic-release) se eliminó en el
  lote 3: ningún workflow lo invocaba.
- **Versiones.** El repo adoptó la `1.0.1` publicada de `@ownui/tw-theme` (lote 3), así que la
  base del versionado coincide con el registro. El próximo release sale en **1.1.0** para el
  plugin y **1.0.1** para los otros cinco, que es su **primera publicación**.
- ⚠️ **La `@ownui/tw-theme@1.0.1` que hay hoy en npm está parcialmente rota** y lo seguirá
  estando hasta que salga la 1.1.0: su `exports["./css"]` apunta a un directorio, así que
  `@import "@ownui/tw-theme/css"` falla en el consumidor; no lleva agregador `index.css`;
  `menu.css` va vacío; y su peer de Tailwind excluye las 4.1.x que el plugin necesita. Todo
  corregido en `develop` por el lote 1. Ver `packages/tw-theme/CHANGELOG.md` y
  `specs/lote-3.md` G-18.

**Modelo de ramas** (vigente desde el lote 0):

| Rama | Rol |
|---|---|
| `main` | Release y publicación. **No se commitea, pushea ni mergea directamente.** |
| `develop` | Integración. Base de todos los lotes y destino de sus PRs. |
| `claude/lote-<N>` | Rama de trabajo de un lote, creada desde la última `develop`. Un lote = una PR. |

- ✅ **Las PRs de lote sí ejecutan CI**, desde el lote 3: el trigger cubre PRs hacia `main` y
  hacia `develop`, más push a `develop`. Antes era sólo `branches: [main]`, así que ninguna PR
  de los lotes 0–3 pasó por CI y la ausencia de checks no significaba nada. Dicho esto, el paso
  de **lint no bloquea** todavía (`continue-on-error`), así que un check verde **no** garantiza
  que `pnpm lint` pase — sólo que build, tests y e2e pasan.

### 6.6 Convenciones de código

Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`). Prettier: `printWidth: 100`,
comillas dobles, `semi: true`, `trailingComma: "es5"`, `arrowParens: "always"`.
Los comentarios y JSDoc del repo están mayormente **en español**; mantener ese idioma.
Rama de trabajo para sesiones de agente: **`claude/great-archimedes-5f008a`**.

---

## 7. Cómo añadir un componente nuevo (receta end-to-end)

Desde el lote 8 los pasos mecánicos **no se hacen a mano**: `pnpm create-component` los ejecuta
en el orden correcto (**CSS y contrato antes que React**, que es lo que impide que un componente
nazca sin estilos) y `pnpm check:contract` verifica que las tres capas digan lo mismo.

```bash
pnpm create-component Tabs              # patrón A (composición simple)
pnpm create-component Select --compound # patrón B (Provider + Trigger/Panel/Item)
pnpm create-component Chip --prefix cp  # prefijo de clase distinto del nombre
pnpm create-component Tabs --dry-run    # enseña lo que haría sin escribir nada
```

Qué genera y registra, en este orden:

1. **CSS** → `packages/tw-theme/src/css/<name>.css` con la cascada de §4.8 (la base define
   todas las custom properties → las variantes sólo redefinen `--{c}-color` → los estados
   recalculan por `color-mix` en oklab → los tamaños derivan de `--size-field` →
   `:focus-visible` → `disabled`).
2. **Contrato** → `packages/tw-theme/src/variants/<name>.ts` con los 8 roles, los 5 tamaños y
   los estados, más su `export` en `variants/index.ts`.
3. **Publicación del CSS** → `@import "./<name>.css"` en `css/index.css`, que es lo que viaja
   en el paquete (`@ownui/tw-theme/css`). Sin este paso el componente no renderiza estilado:
   es el bug del lote 1.
4. **Paquete** → `packages/ui/src/<Name>/` con `package.json` (`@ownui/<name>`,
   `sideEffects: false`, `publishConfig.access: "public"`, peers de React), `tsconfig.json` y
   `tsup.config.ts` con el banner `"use client"`.
5. **Tipos, hook, componente y barrel** → `<Name>.types.ts` (uniones de literales para `theme`
   y `size`), `use<Name>.tsx` (toda la lógica; las clases se **leen del contrato**),
   `<Name>.tsx` (`forwardRef` + `React.memo`, sin lógica) e `index.ts`.
6. **Tests y stories** → `__test__/<Name>.test.tsx` con RTL real (nunca stubs de
   `console.log`) y `<Name>.stories.tsx` con `Default`, `AllVariants`, `AllSizes` y `Disabled`.
7. **Registros** → `packages/ui/src/index.ts`, las `dependencies` de `@ownui/ui`, el
   `moduleNameMapper` de `jest.config.js` y los `paths` de `tsconfig.jest.json`.

Todo lo generado pasa por Prettier al escribirse, así que nace limpio de lint.

Lo que **sigue siendo tuyo** — el andamio no sabe qué hace el componente:

8. **Rellenar el CSS** con la geometría y los estados reales, y **ajustar contrato y tipos** a
   las props que de verdad tiene.
9. **React Aria** → si el componente es interactivo, el hook pasa por un hook de
   `@react-aria/*` (§5.5). El compound generado trae `Esc` + retorno de foco, pero **no**
   navegación con flechas ni click-outside: eso es trabajo del componente.
10. **Fixture e2e** → `packages/tw-theme/e2e/fixtures/` + spec, si introduce tokens o
    utilidades nuevas (§6.4). Obligatorio para cualquier cambio del plugin.
11. **Tests de comportamiento** y stories específicas.
12. **Changeset** → `pnpm changeset`.

Antes de abrir el PR, estas dos tienen que estar en verde:

```bash
pnpm check:contract   # ninguna clase emitida sin CSS, ningún valor de tipo sin contrato
pnpm test             # los 3 proyectos de Jest
```

Checklist de "listo" (de la guía canónica): todas las variantes y tamaños aplican clase real ·
teclado completo · ARIA correcto · `memo`+`useMemo`+`forwardRef` · cobertura >90% ·
stories completas · build sin errores con banner `"use client"`.

---

## 8. Reglas para agentes

1. **Lee el contrato antes de tocar un componente**: `variants/<name>.ts` + `css/<name>.css`
   + `<Name>.types.ts`. Los tres deben decir lo mismo. Si no, eso *es* el bug.
2. **Nunca escribas colores literales en un componente React ni en el CSS de componente.**
   Siempre `var(--color-*)`. Un hex nuevo sólo puede aparecer en `themes/*.ts`.
3. **Nunca uses clases de utilidad de Tailwind para color dentro del CSS de componente.**
   Usa la cascada de custom properties.
4. **No crees abstracciones nuevas de theming.** El sistema es: tokens → custom properties →
   clases semánticas. No añadas CSS-in-JS, `tailwind-variants` ni `cva`.
5. **Todo componente interactivo pasa por React Aria.** Si no existe el hook adecuado,
   dilo en el PR en vez de improvisar manejo de teclado.
6. **Tests reales o nada.** `packages/ui/src/Button/__test__/Button.test.tsx` redefine
   `describe`/`test`/`expect`/`render` con `console.log` y no comprueba nada: **es el
   antipatrón del repo, no una plantilla.**
7. **Cambios en el plugin vienen con fixture e2e.** Las pruebas unitarias no capturan
   regresiones de CSS compilado.
8. **Usa `pnpm`** (nunca npm/yarn) y `workspace:*` para dependencias internas.
9. **Confía en el código, no en los `.md` históricos.** Desde el lote 9 el README,
   `copilot-instructions.md`, `TESTING.md` y las guías de `.github/instructions/` están
   verificados contra el árbol (§9.9), y `pnpm check:docs` impide que vuelvan los enlaces
   muertos. Lo único deliberadamente desactualizado es `@docs/salvage/`, que lleva la
   advertencia delante. Si tocas una ruta o un script, actualiza el `.md` que lo nombra en el
   mismo PR.
10. **`pnpm changeset` en cada PR** que toque un paquete publicable.
11. Commits en conventional commits; comentarios en español.
12. **Componente nuevo ⇒ `pnpm create-component`** (§7), no copiar y pegar otro paquete; y
    **`pnpm check:contract` en verde antes del PR** — es puerta en CI desde el lote 8.

---

## 9. Deuda técnica conocida (verificada en el código)

Ordenada por impacto. Cada ítem está convertido en lote de trabajo en
[`@docs/BUILD-BATCHES.md`](./@docs/BUILD-BATCHES.md).

### 9.1 ✅ El CSS de componentes nunca se publicaba — *bug raíz, RESUELTO en el lote 1*
**Era** el bug #1 del repo: `packages/tw-theme/src/css/*.css` no se importaba en ningún lado
(`grep`: 0 referencias) y `tsup` no procesa CSS, así que quien instalaba `@ownui/ui` +
`@ownui/tw-theme` obtenía `class="btn btn-primary btn-md"` **sin una sola regla que la
defina**; la librería no renderizaba estilada fuera de Storybook.

Resuelto con la opción (B) del plan: CSS plano publicado + subpath exports.
- `src/css/index.css` agrega los tres componentes.
- `exports["./css"] → ./dist/css/index.css` y `exports["./css/*"] → ./dist/css/*`. Ojo: el
  prototipo de `tw-theme/v1` era `"./css": "./dist/css"`, que apunta a un **directorio** y Node
  no resuelve.
- El hook `onSuccess` de `tsup.config.ts` copia `src/css` → `dist/css` con `node:fs`, y
  `files: ["dist"]` lo mete en el tarball.
- Verificado con el fixture e2e `component-styles` (estilos computados en Chromium) **y** con
  el tarball de `npm pack` instalado en un proyecto limpio fuera del monorepo. Esto último es
  imprescindible: dentro del paquete, `@import "@ownui/tw-theme/css"` resuelve por
  *self-reference* de Node y da un falso positivo.

Sigue pendiente: `components-css.instructions.md` describe un paso `build:components` que
genera `src/build/components.js` con exports `{component}Styles` — **ese script y esa carpeta
no existen** y la opción (A) que describen no se implementó. La guía debería actualizarse o
marcar ese apartado como no vigente (lote 9).

### 9.2 ✅ Los tests de componentes no se ejecutaban — *corregido en el lote 2*
`jest.config.js` → proyecto `components` → `testMatch: packages/components/**`, ruta que no
existe (la real es `packages/ui/src/*/__test__/`). Los tests de Dropdown y Loader nunca
corrieron, `Button.test.tsx` era un stub con `console.log` y `pnpm test` salía en verde con
0 tests de componentes.

Hoy: `testMatch` y `collectCoverageFrom` apuntan a `packages/ui/**` y `packages/utils/**`,
`Button.test.tsx` está reescrito con RTL + `user-event`, `useDOMRef` tiene suite propia, y
`pnpm test` corre **10 suites / 122 tests** (89 tras el lote 2, +33 del lote 4). Ver
`specs/lote-2.md`.

**La parte de CI se cerró en el lote 3** (gap G-04), con autorización del dueño: el paso era
`pnpm test:$pkg || echo "No tests for $pkg"`, que se tragaba el fallo y además invocaba
`test:ui`/`test:utils`, scripts inexistentes. Hoy el pipeline corre `pnpm test` incondicional.

### 9.3 ✅ `pnpm build` no construye la librería — *resuelto en el lote 3*
Era `"build": "turbo build --filter='@ownui/tw-theme'"`, así que `@ownui/ui`, `@ownui/button`,
`@ownui/dropdown`, `@ownui/loader` y `@ownui/dom-utils` no se construían con el comando raíz,
y `release.yml` llamaba exactamente a ese `pnpm build` antes de publicar.
Hoy `pnpm build` es `turbo build` y la tarea `build` declara `dependsOn: ["^build"]`, con las
dependencias internas de `@ownui/ui` declaradas para que el grafo exista. Verificado en limpio:
6/6 `dist/`. Ver `specs/lote-3.md`.

### 9.4 ✅ `Button.variant` no aplicaba ninguna clase — *resuelto en el lote 5*
`useButton.tsx` resolvía `button.theme[variant]`: consultaba el mapa de **roles** con una clave
de **tratamiento**, así que `variant="dash"` y `variant="soft"` se perdían y `variant="outline"`
sólo funcionaba por coincidencia de nombre entre los dos mapas. Las tres capas discrepaban
además entre sí (`variants/button.ts` declaraba `solid` y `ghost`; el CSS tiene
`dash`/`soft`/`outline`).

Ahora el hook resuelve `button.variant[variant]`, `ButtonVariant` es
`"outline" | "dash" | "soft"` y el contrato está cubierto por el test que lo cruza contra el CSS
(§4.7). De paso, `disabled` dejó de emitir `opacity-50 cursor-not-allowed` —utilidades de
Tailwind que el consumidor no genera, porque no escanea nuestro bundle— y emite `.btn-disabled`,
que es el estado final del CSS.

### 9.5 ✅ `Button loading` descartaba el contenido — *resuelto en el lote 5*
`{loading ? <Loader /> : <>{children}</>}` sustituía el label por el spinner, y el `<Loader />`
se renderizaba sin `size`/`color` derivados del botón (siempre `primary`/`md`): azul sobre azul
en un `btn-primary`. Las props `icon`, `startIcon`, `endIcon` estaban en los tipos y no se
usaban en el render, y `startIcon`/`endIcon` estaban tipadas `boolean`.

El render es ahora `[spinner] [startIcon] [children | icon] [endIcon]`, con `aria-busy="true"` y
la interacción bloqueada mientras carga. El spinner hereda el tamaño (mapa
`ButtonSize → LoaderSize`) y el color: usa `color="current"`, la clase `.loader-current` que el
lote 5 añadió a `loader.css` (`--loader-color: currentColor`), de modo que toma `--btn-fg` —el
token `-content` del rol— y contrasta en los 10 temas. `icon` define un botón icon-only con
`aria-label` obligatorio por tipos y `.btn-square` implícito; ese caso es la **única** excepción
al "spinner junto al contenido": mientras carga muestra sólo el spinner, porque un `.btn-square`
mide lo mismo de ancho que de alto y no caben los dos.

### 9.6 ✅ `--color-base-100` no existía — *corregido en el lote 4*
`dropdown.css` lo referenciaba 3 veces como color de superficie, y `rootColors.ts` sólo definía
`--color-base-200` y `--color-base-content`. El fallback de `var()` no se dispara cuando el
token está *indefinido* (queda `guaranteed-invalid`, no vacío) ⇒ el fondo del dropdown caía a
`transparent`. Faltaba la escala de superficies completa que el patrón daisyUI-like presupone, y
los dos tokens que sí existían eran **globales y fijos** (negro/blanco), de modo que un `.btn`
sin variante salía negro en tema claro.

El lote 4 movió la escala a `light.ts`/`dark.ts`, la completó con `base-100`/`base-300`, añadió
16 utilidades de superficie y borró `rootColors.ts`. Ver §4.2, §4.5 y `specs/lote-4.md`.
Queda fijado por `src/__tests__/surfaces.test.ts` (contrato token↔CSS + WCAG AA) y por el
fixture e2e `base-surfaces/` (18 tests sobre estilos computados en Chromium).

### 9.7 ✅ Dropdown: clases generadas sin CSS — *resuelto en el lote 6*
Los hooks emitían `dropdown-trigger`, `dropdown-trigger-active`, `dropdown-open`,
`dropdown-menu`, `dropdown-menu-{variant|size|styleVariant}` y `dropdown-menu-open/closed`, y
en `dropdown.css` **no había un solo selector** para ninguna: el menú salía en el flujo del
documento, sin posicionamiento, elevación ni transición, y los semánticos sólo cubrían
`primary/secondary/accent/neutral` de los 8 que permite `DropdownVariant`.

El lote 6 escribió el CSS de trigger y panel, completó los 8 roles en los dos niveles, movió la
superficie del wrapper al panel (**cambio observable**, ver `specs/lote-6.md` D-02) y alineó
`variants/dropdown.ts`, que declaraba tres clases inexistentes heredadas de `button`. Queda
fijado por `src/__tests__/dropdown-contract.test.ts` (contrato de las tres capas) y por el
fixture e2e `dropdown/` (23 tests sobre estilos computados en Chromium). Ver §4.8 y
`specs/lote-6.md`.

### 9.8 ✅ Dropdown: fuga de props al DOM y a11y incompleta — *resuelto en el lote 7*
`DropdownContainer` hacía `{...restProps}` sobre un `<div>` incluyendo `variant`, `size`,
`styleVariant`, `defaultOpen`, `open` y `onOpenChange` ⇒ warnings de React y atributos
inválidos en el HTML servido. Y la a11y estaba a medias: `role="menu"` y `role="menuitem"`
sin navegación por flechas, sin `Esc`, sin click-outside, sin retorno de foco y sin
`aria-controls`.

El lote 7 cerró las dos mitades: separación explícita de `contextProps` y `domProps` (tipada,
con `DropdownDOMProps`), `useId` para enlazar trigger y menú en los dos sentidos, y el patrón
de teclado de la APG completo. Queda fijado por 21 tests de RTL, entre ellos uno que falla si
`console.error` recibe **cualquier** aviso y otro que comprueba que el listener de documento
no se registra con el menú cerrado y se retira al desmontar. Ver §5.3 y `specs/lote-7.md`.

De paso se arregló en el Dropdown el bug de refs que el lote 5 ya había corregido en el
Button: el componente montaba la ref *forwarded* en vez de la `innerRef` que `useDOMRef`
devuelve, así que `innerRef.current` era siempre `null`, React Aria trabajaba sin nodo y la ref
del consumidor resolvía a `null`. **El patrón correcto es el que documenta §5.2**: el hook
devuelve la ref que hay que montar (`domRef` / `triggerRef`) y el componente monta **esa**, no
la que recibe por `forwardRef`. Es el error más fácil de reintroducir de todo el repo.

Y el menú **dejó de desmontarse al cerrarse** (era el gap G-01 del lote 6): sin el panel en el
DOM antes de abrir, el navegador no tiene estado inicial desde el que interpolar y la
transición de `dropdown.css` no se veía nunca. Montado y cerrado no significa accesible:
lleva `aria-hidden` (lo saca del árbol de accesibilidad) e `inert` (lo saca del foco y del
puntero, sin depender del CSS), y el CSS lo oculta con `visibility: hidden`, que a diferencia
de `display: none` sí es animable. Verificado en Chromium midiendo la opacidad a mitad de
transición; el caso `prefers-reduced-motion` sirve de control negativo, porque ahí la misma
medida da 1.

### 9.9 ✅ Documentación que miente — **cerrado en el lote 9**
Queda aquí porque explica por qué existen `pnpm check:docs` y `apps/example-app`.

- README: documentaba `apps/example-app`, `pnpm example`, `pnpm dev` y `pnpm storybook` en la
  raíz cuando `apps/` no existía. → La app **existe** y los cuatro scripts también; cada
  comando del README se ejecutó uno a uno (evidencia en `specs/lote-9.md`).
- README: anunciaba 6 paquetes publicados mientras el workflow publicaba 1. → Desde el lote 3
  `pnpm release` es `changeset publish`, que publica los 6 no privados.
- `copilot-instructions.md`: describía una estructura de directorios que no existe. → Pasa a
  ser un puntero a este archivo; dos descripciones del mismo sistema garantizan que una mienta.
- `.github/instructions/*`: `applyTo` y rutas corregidas; el paso `build:components` que
  generaba `src/build/components.js` —script y carpeta que nunca existieron— se sustituye por
  el pipeline real (`@import` en `css/index.css` + copia a `dist/css`).
- `e2e/README.md`: enlazaba siete documentos inexistentes y hablaba de 6 fixtures / ~88 tests.
  → Reescrito con 9 fixtures / 150 tests, medidos corriendo la suite.
- `@docs/my-project-structure.md` (un solo paquete, con Emotion): archivado en
  `@docs/salvage/` con la advertencia delante.
- **Gate nuevo**: `pnpm check:docs` falla si algún enlace relativo de un `.md` apunta a algo que
  no existe, y un test lo fija sobre el árbol real. No está en CI (el lote no lo pedía y tocar
  workflows quedaba fuera de su alcance): candidato inmediato.

### 9.10 🟡 Varios
- ~~`peerDependencies: tailwindcss ">= 3.4.17 <4.1.1"`~~ **corregido a `">=4.1.0 <5"` en el
  lote 1**: el rango viejo excluía las versiones realmente usadas (4.1.7 dev / 4.1.1 storybook)
  y hacía fallar `npm install` del tarball con `ERESOLVE`. Este punto sale del alcance de L3.
- `@ownui/ui` importa los componentes por ruta relativa, pero `Button` importa `@ownui/loader`
  y `@ownui/dom-utils`, que **no están en las dependencias de `@ownui/ui`** ⇒ build frágil.
- ~~`@ownui/dropdown` tiene `"main": ".src/index.ts"` (typo)~~ → corregido en el lote 3, junto
  con su entrada de build (`tsup src --dts` metía `Dropdown.stories.tsx` en el bundle publicado).
- `Loader.variants.ts` existe y está vacío.
- `generateThemeProperties` está duplicado: en `functions/` (exportado y testeado) y
  reimplementado literal dentro de `plugin.ts`.
- `splitStyles.ts` está testeado pero no lo usa nadie (restos del pipeline PostCSS planeado).
- `formatAndCleanPluginConfig` corrompe nombres de tema con mayúsculas/dígitos sin avisar.
- ~~`@ownui/dom-utils` no tiene tests~~ **Corregido en el lote 2** (6 tests de `useDOMRef` en
  `packages/utils/dom-utils/__test__/`). Sigue sin `tsconfig` propio de test — usa el
  `tsconfig.jest.json` de la raíz. ~~`license: ISC`~~ → MIT desde el lote 3.
- ~~`collectCoverage: true` global en Jest.~~ **Corregido en el lote 2**: sólo en
  `pnpm test:coverage`.
- ~~El ref de `Button` nunca llegaba al consumidor~~ **Corregido en el lote 2**: `Button.tsx`
  montaba en el DOM el ref del consumidor mientras `useDOMRef` reflejaba en él su `innerRef`
  vacío, así que `ref.current` quedaba en `null` y React Aria tampoco veía el nodo. Ahora
  `useButton` devuelve `domRef` y el componente monta ese.
- `useButton` **no saca `loading` de `restProps`**, así que llega al DOM y React protesta
  (`Received \`true\` for a non-boolean attribute \`loading\``). Detectado en el lote 2;
  arreglo en el lote 5 junto al resto del comportamiento de `loading`.
- Con `as="a"`, React Aria fuerza `role="button"` sobre el ancla: el nodo tiene `href` pero
  **no** expone el rol `link`. Decidir en el lote 5 si un Button-enlace debe pasar por
  `useLink` en lugar de `useButton`.
- ~~`packages/tw-theme/test-results/` está versionado~~ → desindexado e ignorado en el lote 3.
- ~~`getThemeNameConfig` (`theme.ts`) compara `flag !== "string"`…~~ **Corregido en el lote 0.**
  Era una comparación contra el literal `"string"` donde se pretendía `typeof`, así que
  `--prefersdark` se ignoraba y todo tema custom se registraba como `--default`. Cubierto con
  10 tests en `src/__tests__/theme.test.ts`.
- ✅ `variants/button.ts` declaraba `ghost` **dos veces**, en `theme` y en `variant`: era la
  razón por la que `variant="ghost"` parecía funcionar pese al bug de §9.4 (el lookup caía en
  `theme` y encontraba la clave por coincidencia). **Resuelto en el lote 5**: `ghost` es sólo un
  rol, y el test de contrato impide que vuelva a duplicarse.
- **Contraste fuera de norma, ya medido**: `node scripts/check-contrast.mjs` audita los dos
  temas y **15 de los 32 pares relleno/`-content` suspenden AA (4.5:1)**. En el tema claro
  fallan 11, por el patrón `-content: #ffffff` uniforme sobre rellenos claros (`warning`
  2.15:1, `success` 2.28:1, `primary` 3.68:1). En el oscuro fallan 4, y todos son el estado de
  **interacción**: los `-focus` de `primary` (3.98), `accent` (3.45), `neutral` (3.03) y `error`
  (3.89) suspenden aunque su estado de reposo apruebe — ese estado no se había medido nunca.
  La paleta correcta está calculada y aprobada en `@docs/BUILD-BATCHES.md` §L21; la corrección
  de los temas built-in es el lote 22.

---

## 10. Dónde mirar primero

| Pregunta | Archivo |
|---|---|
| ¿Qué tokens existen? | `packages/tw-theme/src/themes/{root,light,dark}.ts` |
| ¿Cómo se inyecta un tema? | `packages/tw-theme/src/plugin.ts`, `src/theme.ts` |
| ¿Qué clases genera el plugin? | `packages/tw-theme/src/utilities/colors.ts` |
| ¿Qué prop → qué clase? | `packages/tw-theme/src/variants/*.ts` |
| ¿Cómo se escribe CSS de componente? | `packages/tw-theme/src/css/button.css` + `.github/instructions/components-css.instructions.md` |
| ¿Cómo se escribe un componente? | `packages/ui/src/Button/src/useButton.tsx` + `.github/instructions/components-react.instructions.md` |
| ¿Cómo se hace un compound? | `packages/ui/src/Dropdown/src/{Dropdown.tsx,DropdownContext.tsx}` |
| ¿Cómo se testea el plugin de verdad? | `packages/tw-theme/e2e/` |
| ¿Las 3 formas de configurar el plugin? | `packages/storybook/.storybook/styles/tailwind.css` |
| ¿Cómo se ve todo junto, consumido de verdad? | `apps/example-app/` (`pnpm example`) |
| ¿Qué construir y qué publicar? | `turbo.json`, `.github/workflows/release.yml` |

---

## 11. Estado de ramas: trabajo no mergeado

> **Reconciliado en el lote 0** (2026-11-18). El inventario completo, con la decisión tomada
> para cada una de las 14 ramas y las decisiones de diseño asociadas, está en
> [`specs/lote-0.md`](./specs/lote-0.md). Esta sección queda como resumen.

**Qué cambió.** `develop` es la rama de integración y ya incorpora lo que valía la pena de las
dos ramas con trabajo real: el fix de `getThemeNameConfig` de `tw-theme/v1` y, de `components`,
los 5 tokens de estado y el `button.css` rediseñado. Lo que quedó fuera lo hizo a propósito.

**No se borró ninguna rama.** El borrado es destructivo y no se puede revisar en una PR, así
que el lote 0 lo dejó empaquetado en `scripts/cleanup-dead-branches.sh` (dry-run por defecto)
para ejecución manual. Hasta que alguien lo corra, las 14 ramas siguen ahí.

Ahead/behind medidos contra `origin/develop` el 2026-11-18. **No los fijes a mano en este
documento: caducan en el siguiente merge** — recalcúlalos con el bucle de
`@docs/BUILD-BATCHES.md` §L0.

| Rama | A/B | Decisión del lote 0 | Estado |
|---|---|---|---|
| `components` | 7/1 | Rescate parcial: entran los tokens de estado y `button.css`. **Fuera**: paleta de marca, bump de React (D-08), skill de React (fuera de alcance) | **Conservar**: es la única copia de los hex de marca, y P-02 decidió publicarlos como tema con nombre en el lote 21 |
| `tw-theme/v1` | 4/10 | Rescate parcial: entra el fix de `getThemeNameConfig`. La publicación de CSS la resolvió el lote 1 (§9.1) | **Borrable**: P-01 se cerró conservando la semántica actual, así que su cambio de `:where(root)` se descarta; su mitad útil entra como flag `--opt-in` en el lote 21 |
| `copilot/update-tw-theme-readme` | 5/38 | README extraído a `@docs/salvage/` (insumo del lote 9) | Borrable |
| `copilot/update-react-to-19-0-3` | 2/42 | Fixture React extraído a `@docs/salvage/` (insumo de los lotes 1 y 9); el bump se descarta | Borrable |
| `copilot/update-react-versions-to-19-0-3` | 2/45 | El mismo bump, sin contenido único | Borrable |
| `claude/great-archimedes-5f008a` | 3/1 | Redundante: su árbol es idéntico al commit de squash de la PR #24 (`70d1d22`), ya en `develop`. El conteo de *ahead* no lo ve porque el lote 0 editó después esos archivos; la comprobación correcta es `git diff 70d1d22 origin/claude/great-archimedes-5f008a` → vacío | Borrable |
| `copilot/update-copilot-instructions`, `copilot/delegate-to-cloud-agent` | 1/38, 1/42 | Un commit "Initial plan" cada una, **sin ningún cambio** | Borrable |
| `feat/tw-theme`, `feat/v1`, `copilot/fix-release-workflow-error`, `copilot/fix-uncommitted-changes-detected`, `copilot/update-react-version-19-0-1` | 0/9–50 | Sin aporte: 0 commits ahead | Borrable |
| `changeset-release/main` | 1/0 | La regenera Changesets sola | No tocar a mano |

### 11.1 `components` — 7 ahead, 1 behind

> **Resuelto parcialmente en el lote 0.** Ya están en `develop` los 5 tokens de estado y el
> `button.css` rediseñado. **Las tres regresiones de abajo ya no aplican**: existían porque la
> rama borraba la paleta con sus `--color-*-focus`, y al no adoptarse la paleta (D-07) dejaron
> de tener objeto — no hubo que parchear nada. Lo que sigue vivo de esta rama es la paleta de
> marca (pendiente de P-02) y el skill de React, fuera de alcance. El análisis se conserva como
> registro de por qué se decidió así.

Es la rama más reciente y la que **más afecta al sistema de diseño**. Aporta:

- **`button.css` reescrito** (441 ln cambiadas) y claramente mejor que el de `main`:
  introduce `--btn-focus-color` como fuente del color de interacción, tokens de estado por
  componente con fallback al global (`--btn-hover-depth: var(--hover-depth, 7%)`,
  `--btn-active-depth`, `--btn-disabled-bg-opacity`, `--btn-disabled-fg-opacity`,
  `--btn-transition-duration`), fallbacks literales
  (`var(--color-base-200, #f3f4f6)`, `var(--color-base-content, #111827)`) que mitigan §9.6,
  y una escala de tamaños completa (`xs`=6, `sm`=8, `md`=10, `lg`=12, `xl`=14 × `--size-field`).
- **`root.ts`**: 5 tokens globales nuevos — `--hover-depth`, `--active-depth`,
  `--disabled-bg-opacity`, `--disabled-fg-opacity`, `--transition-duration`. Extiende el
  sistema de §4.1 con una capa de **estados** que `main` no tiene.
- **Paleta de marca** en `light.ts`/`dark.ts` con naming propio (Piccolo, Hit, Jireh, Goku,
  Jiren, Beerus).
- **`@import` de los 4 `.css`** en el `tailwind.css` de Storybook — workaround de §9.1, pero
  apunta a `node_modules/@ownui/tw-theme/src/css/…`, ruta que **no existe en el paquete
  publicado** (`files: ["dist"]`). Funciona en el monorepo por el symlink de pnpm y se rompe al
  instalar desde npm. Es confirmación del bug, no su solución.
- `.github/skills/react-best-practices/` — skill de ~2900 ln + 60 reglas de rendimiento React,
  y `.github/agents/teacher-react.agent.md`. No colisiona con este `AGENTS.md` (está anidado).
- Bump a React 19.0.3; borra un `.eslintrc.js` residual (`eslint.config.js` sigue en su sitio).

**Tres regresiones que esta rama introduce y que hay que resolver antes de mergearla:**

1. 🔴 **Elimina los 8 tokens `--color-*-focus`, pero el `button.css` de la misma rama depende
   de ellos**: los roles hacen `--btn-focus-color: var(--color-primary-focus)`. Un `var()` a un
   token inexistente produce un valor *guaranteed-invalid*, así que `--btn-focus-color` queda
   definido-pero-inválido y el fallback de `var(--btn-focus-color, …)` **no se dispara** (se
   aplica IACVT y la propiedad hereda o se desactiva). Hover y `outline` se rompen en silencio.
2. 🔴 **`utilities/colors.ts` sigue con `semanticColorVariants = ["", "-content", "-focus"]`** y
   la rama no lo toca ⇒ **40 utilidades `.bg-*-focus` / `.text-*-focus` / `.border-*-focus` /
   `.ring-*-focus` / `.divide-*-focus` apuntando a tokens que ya no existen.**
3. 🟠 **`--color-accent-content: #4E46B4` es idéntico a `--color-accent`** en el tema light ⇒
   texto invisible sobre superficies accent (contraste 1:1).

**El bug de §9.4 NO está arreglado aquí**: el diff de `useButton.tsx` (51 ln) es exclusivamente
reformateo de Prettier; `button.theme[variant]` sigue intacto.

### 11.2 `tw-theme/v1` — 4 ahead, 10 behind

> **Resuelto parcialmente en el lote 0.** El fix de `getThemeNameConfig` ya está en `develop`
> con 10 tests. El mecanismo de publicación de CSS se trasladó literal (y corregido) a la ficha
> del lote 1. El cambio de semántica de `:where(root)` **no** se adoptó: es una decisión de
> producto que necesita fixture e2e (P-01).

Más pequeña pero resuelve **el bug raíz del repo**, y justamente con la opción (B) del lote 1:

```json
"exports": { "./css": "./dist/css" },
"build": "rimraf dist && npm run build:lib && cp -R ./src/css dist/"
```

Con `files: ["dist"]` el CSS **sí se publicaría**. Queda un detalle pendiente: `"./css"` apunta a
un **directorio**, lo que Node no resuelve — hace falta `"./css/*": "./dist/css/*"` (y
opcionalmente `"./css": "./dist/css/index.css"`).

También corrige el bug de `getThemeNameConfig` (§9.10) y cambia la semántica de aplicación de
temas custom: elimina `:where(${root})` de la rama `--default`, de modo que un tema custom
*default* ya no pinta la raíz y sólo aplica con `[data-theme="<name>"]`. **Es un cambio de
comportamiento observable**, no una limpieza: hay que decidir si es el deseado y cubrirlo con
fixture e2e. Incluye además el versionado a 1.0.1 y los CHANGELOG de 5 paquetes.

### 11.3 Consecuencia para el plan de trabajo

El lote 0 ya cerró el solape que tenían los lotes 1, 4 y 5 con estas dos ramas. Lo que queda
pendiente para quien siga:

- **Lote 1** parte del snippet ya corregido que le dejó el lote 0 en su ficha, más el fixture
  React de `@docs/salvage/`. No hace falta volver a `tw-theme/v1`.
- **Lote 4** (escala `base-100/200/300`) ✅ **hecho**. Era más urgente de lo que parecía:
  `rootColors.ts` definía `--color-base-200: #000000`, y el `button.css` que entró en el lote 0
  lo usa como relleno del botón neutro por defecto, así que ese botón salía negro en tema claro.
  La escala vive ahora en los temas (§4.2) y `rootColors.ts` ya no existe.
- **Lote 5** ✅ **hecho**. Ninguna rama traía el arreglo: el diff de `useButton.tsx` en
  `components` era sólo reformateo de Prettier. Se reimplementó sobre `develop` (§9.4, §9.5), sin
  tocar el conjunto de selectores de `button.css` que dejó el lote 0: la única clase nueva del
  lote está en `loader.css` (`.loader-current`).
- **Decisiones de producto abiertas**: la paleta de marca (P-02) y la semántica de los temas
  custom `--default` (P-01). Ambas en `specs/lote-0.md` §9.
