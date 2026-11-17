# AGENTS.md — Own UI

> Contexto canónico para agentes (Claude Code, Copilot, etc.) y para cualquier
> persona que entre al repo. Describe **lo que el código realmente hace hoy**,
> no lo que la documentación histórica aspira a hacer.
> Última verificación contra el código: **2026-11-17** (rama `claude/great-archimedes-5f008a`).
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
| Versionado | Changesets | `.releaserc` de semantic-release quedó huérfano |
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
│   │   │   ├── themes/            → TOKENS: root, rootColors, light, dark
│   │   │   ├── variants/          → CONTRATO de clases: button, dropdown, loader
│   │   │   ├── functions/         → generateThemeProperties, formatAndClean…, plugin.withOptions, splitStyles
│   │   │   ├── utilities/         → colors.ts (generateColorUtilities, cssVarName/Ref), file.ts
│   │   │   └── css/               → button/dropdown/loader/menu .css  ⚠️ HUÉRFANOS (§9.1)
│   │   └── e2e/                   → 6 fixtures + specs Playwright
│   │
│   ├── ui/                        → @ownui/ui          paquete agregador (barrel)
│   │   └── src/
│   │       ├── index.ts           → re-exporta Button, Dropdown, Loader + tipos
│   │       ├── Button/            → @ownui/button      [paquete propio]
│   │       ├── Dropdown/          → @ownui/dropdown    [paquete propio]
│   │       └── Loader/            → @ownui/loader      [paquete propio]
│   │
│   ├── utils/
│   │   └── dom-utils/             → @ownui/dom-utils   useDOMRef
│   │
│   └── storybook/                 → @ownui/storybook   [private] docs visual
│
├── @docs/                         → my-project-structure.md, Own_ui.fig, heroui-structure.svg
├── .github/
│   ├── copilot-instructions.md    → guía general (rutas desactualizadas, §9.9)
│   ├── instructions/components-react.instructions.md  → ARQUITECTURA DE COMPONENTES (canónica)
│   ├── instructions/components-css.instructions.md    → ARQUITECTURA CSS (canónica)
│   └── workflows/                 → ci.yml, release.yml
├── owonui_system.drawio           → diagrama C4-ish del sistema
├── project-structure-heroui.drawio→ referencia de arquitectura HeroUI
├── jest.config.js                 → 2 proyectos: "components" y "tw-theme"
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

`apps/` está declarado en el workspace **pero no existe**. El README menciona
`apps/example-app` y `pnpm example`: es documentación aspiracional (§9.9).

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
| `--noise` | `0` | opacidad de la textura de ruido |
| `--fx-noise` | `none` | imagen de ruido |
| `--btn-noise` | `var(--fx-noise)` | alias por componente |

El patrón `--depth` es el más idiosincrático del sistema: en lugar de tokens de sombra
discretos, las sombras se **calculan** con `color-mix` sobre el color de fondo, escalado por
`--depth`. Poner `--depth: 0` aplana todo el sistema sin tocar un solo componente.

### 4.2 Tokens de color base — `src/themes/rootColors.ts`

```ts
'--color-base-200':     '#000000'
'--color-base-content': '#ffffff'
```

Sólo dos. **`--color-base-100` y `--color-base-300` no existen** aunque
`dropdown.css` los usa (§9.6).

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

⚠️ **Esta tabla describe `main`. La rama `components` sustituye la paleta por una de marca
(Piccolo `#4E46B4`, Hit `#40A69F`, Goku `#F5F5F5`, Beerus `#444444`…) y elimina los 8 tokens
`-focus`, lo que rompe cosas que todavía dependen de ellos.** Ver §11 antes de tocar tokens.

### 4.4 Cómo se inyectan los temas — `src/plugin.ts`

```css
:root                                    { /* root.ts + rootColors.ts */ }
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

`generateColorUtilities()` produce **120 clases** = 8 colores × 3 variantes × 5 prefijos:

| Prefijo | Propiedad emitida |
|---|---|
| `.bg-{token}` | `background-color` |
| `.text-{token}` | `color` |
| `.border-{token}` | `border-color` |
| `.ring-{token}` | `--tw-ring-color` |
| `.divide-{token}` | `--tw-divide-color` |

Ej.: `.bg-primary`, `.text-primary-content`, `.border-primary-focus`, `.ring-error`.
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
// variants/button.ts
theme:   { primary: "btn-primary", …, ghost: "btn-ghost", link: "btn-link" }
variant: { outline: "btn-outline", solid: "btn-solid", ghost: "btn-ghost" }
size:    { xs: "btn-xs", …, xl: "btn-xl" }
```

Este archivo es **la fuente de verdad del contrato** entre React y CSS. Cuando una prop de
componente, una entrada de `variants/` y un selector en `css/` se desalinean, aparecen bugs
silenciosos de "la clase no se aplica" — exactamente lo que pasa hoy con `Button.variant`
(§9.4) y con `dropdown-menu` (§9.7).

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

Clases existentes hoy:

| Archivo | Selectores |
|---|---|
| `button.css` (315 ln) | `.btn`, `.btn-active`, 8 semánticos, `.btn-ghost`, `.btn-link`, `.btn-outline`, `.btn-dash`, `.btn-soft`, `.btn-{xs..xl}`, `.btn-square`, `.btn-circle`, `.btn-wide`, `.btn-block` |
| `dropdown.css` (224 ln) | `.dropdown`, `.dropdown-item` (+ selected/disabled), `.dropdown-{primary,secondary,accent,neutral}`, `.dropdown-{xs..xl}`, `.dropdown-{ghost,bordered,compact}`, `.dropdown-item-text` |
| `loader.css` (110 ln) | `.loader`, `.loader-spinner`, `@keyframes loader-spin`, `.loader-{2xs..lg}`, 8 colores, soporte `prefers-reduced-motion` |
| `menu.css` | **vacío (0 líneas)** |

⚠️ Ninguno de estos archivos llega al bundle publicado. Ver §9.1 — es el bug #1 del repo.

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
DropdownRoot (forwardRef)
└── DropdownProvider          ← estado: open/setOpen + variant/size/styleVariant
    └── DropdownContainer     ← useDropdown()        → clases .dropdown*
        ├── Dropdown.Trigger  ← useDropdownTrigger() → React Aria useButton + aria-expanded
        ├── Dropdown.Menu     ← useDropdownMenu()    → role="menu"; devuelve null si !open
        └── Dropdown.Item     ← useDropdownItem()    → role="menuitem", cierra al seleccionar
```

- **Controlado vs no controlado**: `isControlled = controlledOpen !== undefined`; `setOpen`
  sólo escribe estado interno si no está controlado, y siempre llama `onOpenChange?.()`.
- El compound se ensambla con un *cast*, no con `Object.assign` genérico:
  `const Dropdown = MemoizedDropdown as DropdownCompoundComponent; Dropdown.Trigger = …`
- `useDropdownContext()` lanza error si se usa fuera del provider (fail-fast intencional).
- Los subcomponentes **no reciben props de configuración**: las leen del contexto.

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
| `@ownui/button` | Composición | `as`, `theme`(10), `variant`(3), `size`(5), `disabled`, `loading`, `icon`, `startIcon`, `endIcon`, `className` | ⚠️ stub falso | 337 ln | **parcial**: `variant` roto, `loading` tapa children, `icon`/`startIcon`/`endIcon` declarados y no implementados |
| `@ownui/dropdown` | Provider | `variant`(8), `size`(5), `styleVariant`(3), `open`/`defaultOpen`/`onOpenChange` + `.Trigger`/`.Menu`/`.Item` | ✅ reales | 296 ln | **parcial**: sin CSS para menu/trigger, sin navegación por teclado, fuga de props al DOM |
| `@ownui/loader` | Composición | `as`, `color`(8), `size`(5), `aria-label`, `id` | ✅ reales | 121 ln | **el más sano**; `Loader.variants.ts` vacío |
| `@ownui/dom-utils` | — | `useDOMRef` | ❌ | — | ok |
| `@ownui/tw-theme` | — | ver §4 | ✅ 3 suites + 6 fixtures e2e | — | **maduro** |

---

## 6. Build, test y release

### 6.1 Comandos reales

```bash
pnpm install                       # requiere Node 20.16 / pnpm 10

pnpm build                         # ⚠️ turbo build --filter='@ownui/tw-theme' — SÓLO el plugin
pnpm --filter @ownui/ui build      # construir el agregador
pnpm --filter @ownui/button build  # construir un componente

pnpm test                          # Jest, ambos proyectos (coverage siempre activo)
pnpm test:tw-theme                 # sólo el plugin
pnpm test:components               # ⚠️ 0 tests: el testMatch apunta a una ruta inexistente (§9.2)

pnpm --filter @ownui/tw-theme e2e  # compila fixtures + Playwright (~88 tests)

pnpm lint  /  pnpm lint:fix  /  pnpm format
pnpm changeset                     # crear changeset antes de abrir PR

pnpm --filter @ownui/storybook storybook   # :6006 — NO existe `pnpm storybook` en la raíz
```

### 6.2 tsup por paquete

```ts
{ entry: ["src/index.ts"], format: ["cjs","esm"], dts: true, clean: true,
  target: "es2019", banner: { js: '"use client";' },   // compatibilidad RSC/Next
  external: ["react","react-dom"], treeshake: true, minify: true }
```

`tw-theme` difiere: sólo ESM, `minify: false`, `external: ["tailwindcss","@tailwindcss/oxide"]`
(no empaquetar Oxide), y multi-entry `["src/index.ts","src/theme.ts","src/variants/*.ts"]` para
sostener los subpath exports `.`, `./theme`, `./variants`.

### 6.3 Jest — dos proyectos

| Proyecto | Entorno | testMatch |
|---|---|---|
| `components` | jsdom | `packages/components/**/__test__/**` ⚠️ **ruta inexistente** |
| `tw-theme` | node | `packages/tw-theme/src/**/*.{test,spec}.{ts,tsx}` ✅ |

Preset `ts-jest/presets/default-esm`; CSS mapeado a `identity-obj-proxy`; `maxWorkers: "50%"`;
`collectCoverage: true` global (ralentiza toda corrida).

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

- **`ci.yml`** (PR → main): detecta paquetes cambiados con `git diff --name-only main...HEAD`
  (prefijos `packages/tw-theme/`, `packages/ui/`, `packages/utils/`; cambios en archivos raíz ⇒
  `all`), construye, instala Chromium, corre e2e y unitarios sólo de lo cambiado.
- **`release.yml`** (push → main): `pnpm build` → `pnpm version` (changesets) →
  `pnpm release` (`pnpm --filter @ownui/tw-theme publish --access public --no-git-checks`) →
  GitHub Releases vía `changesets/action`. Secrets: `NPM_TOKEN`, `CHANGESET_PAT`.
- ⚠️ El paso de publicación está **cableado sólo a `@ownui/tw-theme`**, aunque el README anuncia
  6 paquetes publicados.
- `.releaserc` (semantic-release) está huérfano: no lo invoca ningún workflow. Conviven dos
  sistemas de release declarados y sólo Changesets está en uso.

### 6.6 Convenciones de código

Conventional commits (`feat:`, `fix:`, `chore:`, `docs:`). Prettier: `printWidth: 100`,
comillas dobles, `semi: true`, `trailingComma: "es5"`, `arrowParens: "always"`.
Los comentarios y JSDoc del repo están mayormente **en español**; mantener ese idioma.
Rama de trabajo para sesiones de agente: **`claude/great-archimedes-5f008a`**.

---

## 7. Cómo añadir un componente nuevo (receta end-to-end)

El orden importa: **CSS y contrato antes que React**, o el componente nace sin estilos.

1. **CSS** → `packages/tw-theme/src/css/<name>.css` siguiendo la cascada de §4.8
   (base define todas las props → variantes sólo redefinen `--{c}-color` → estados por `color-mix`).
2. **Contrato** → `packages/tw-theme/src/variants/<name>.ts` + export en `variants/index.ts`.
   Las claves son props de React; los valores, clases CSS que existan realmente en (1).
3. **Wiring del CSS** → el plugin debe inyectar esas clases (hoy **no lo hace**: resolver §9.1
   / lote 1 antes de que esto tenga efecto).
4. **Fixture e2e** → `packages/tw-theme/e2e/fixtures/` + spec, si introduce tokens o utilidades.
5. **Paquete** → `packages/ui/src/<Name>/` con `package.json` (`@ownui/<name>`,
   `sideEffects: false`, `publishConfig.access: "public"`, peers React), `tsconfig.json`,
   `tsup.config.ts`.
6. **Tipos** → `<Name>.types.ts`: unión discriminada sobre `as`, `never` para props inválidas.
7. **Hook** → `use<Name>.tsx`: los 5 pasos de §5.2. Si hay 3+ subcomponentes, Provider (§5.3).
8. **Componente** → `<Name>.tsx`: `forwardRef` + `React.memo`, sin lógica.
9. **Export** → `index.ts` del componente **y** registro en `packages/ui/src/index.ts`.
10. **Tests** → `__test__/<Name>.test.tsx` con RTL real (nunca stubs de `console.log`).
11. **Stories** → `Default`, `AllVariants`, `AllSizes`, `Disabled`, `AsLink` (si es polimórfico).
12. **Changeset** → `pnpm changeset`.

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
9. **Confía en el código, no en los `.md` históricos.** `copilot-instructions.md` y el README
   describen rutas y scripts que ya no existen (§9.9); las guías de `.github/instructions/`
   siguen siendo válidas en lo arquitectónico.
10. **`pnpm changeset` en cada PR** que toque un paquete publicable.
11. Commits en conventional commits; comentarios en español.

---

## 9. Deuda técnica conocida (verificada en el código)

Ordenada por impacto. Cada ítem está convertido en lote de trabajo en
[`@docs/BUILD-BATCHES.md`](./@docs/BUILD-BATCHES.md).

### 9.1 🔴 El CSS de componentes nunca se publica — *bug raíz*
`packages/tw-theme/src/css/{button,dropdown,loader,menu}.css` **no se importan en ningún
lado** (`grep` sobre todo el repo: 0 referencias). `plugin.ts` sólo llama
`addBase(temas)` + `addUtilities(colores)`. `package.json` publica únicamente `dist/`, y
`tsup` no procesa CSS. Consecuencia: quien instale `@ownui/ui` + `@ownui/tw-theme` obtiene
`class="btn btn-primary btn-md"` **sin una sola regla que las defina**. La librería no
renderiza estilada fuera de Storybook.
`components-css.instructions.md` describe un paso `build:components` que genera
`src/build/components.js` con exports `{component}Styles`: **ese script y esa carpeta no
existen.** `menu.css` está vacío.

**Hay dos soluciones ya prototipadas en ramas sin mergear** (ver §11): `tw-theme/v1` añade
`exports["./css"]` y copia `src/css` → `dist/css` en el build; `components` añade `@import` de
los cuatro `.css` en el `tailwind.css` de Storybook. Ninguna está en `main`.

### 9.2 🔴 Los tests de componentes no se ejecutan
`jest.config.js` → proyecto `components` → `testMatch: packages/components/**`. La ruta real es
`packages/ui/src/*/__test__/`. Los tests de Dropdown y Loader (reales y útiles) **nunca
corren**. Mismo error en `collectCoverageFrom`. `pnpm test` global sale **en verde** porque el
proyecto `tw-theme` sí encuentra tests, y `ci.yml` ejecuta el paso por paquete como
`pnpm test:$pkg || echo "No tests for $pkg"`, que **se traga el fallo** ⇒ falsa señal verde.

### 9.3 🔴 `pnpm build` no construye la librería
`"build": "turbo build --filter='@ownui/tw-theme'"`. `@ownui/ui`, `@ownui/button`,
`@ownui/dropdown`, `@ownui/loader` y `@ownui/dom-utils` **no se construyen** con el comando
raíz — y `release.yml` llama exactamente a ese `pnpm build` antes de publicar.

### 9.4 🟠 `Button.variant` no aplica ninguna clase
`useButton.tsx` resuelve `const variantCls = button.theme[variant]` — busca la variante en el
mapa de **themes**. Además `variants/button.ts` declara `variant: {outline, solid, ghost}`
mientras `ButtonVariant` es `"outline" | "dash" | "soft"` y el CSS define
`.btn-outline`/`.btn-dash`/`.btn-soft` (no existe `.btn-solid`). Resultado: `variant="dash"` y
`variant="soft"` se pierden; `variant="outline"` sólo funciona por coincidencia de nombre.

### 9.5 🟠 `Button loading` descarta el contenido
`{loading ? <Loader /> : <>{children}</>}` sustituye el label por el spinner, y el `<Loader />`
se renderiza sin `size`/`color` derivados del botón (siempre `primary`/`md`), lo que rompe el
contraste en botones no-primary. Lo esperable es spinner **junto** al contenido, heredando
tamaño y usando el color `-content` del tema. Las props `icon`, `startIcon`, `endIcon` están
en los tipos pero **no se usan en el render**.

### 9.6 🟠 `--color-base-100` no existe
`dropdown.css` lo referencia 3 veces como color de superficie; `rootColors.ts` sólo define
`--color-base-200` y `--color-base-content`. El fallback de `var()` no se dispara (el token
está *indefinido*, no vacío) ⇒ fondo del dropdown sin resolver. Falta la escala de superficies
(`base-100`/`200`/`300`) que el patrón daisyUI-like presupone.

### 9.7 🟠 Dropdown: clases generadas sin CSS
Los hooks emiten `dropdown-trigger`, `dropdown-trigger-active`, `dropdown-open`,
`dropdown-menu`, `dropdown-menu-{variant|size|styleVariant}`, `dropdown-menu-open/closed`.
En `dropdown.css` **no hay un solo selector `.dropdown-menu*` ni `.dropdown-trigger*`**: el
menú no tiene posicionamiento, elevación ni transición. Además los semánticos sólo cubren
`primary/secondary/accent/neutral`, pero `DropdownVariant` permite los 8.

### 9.8 🟠 Dropdown: fuga de props al DOM y a11y incompleta
`DropdownContainer` hace `{...restProps}` sobre un `<div>` incluyendo `variant`, `size`,
`styleVariant`, `defaultOpen`, `open`, `onOpenChange` ⇒ warnings de React y atributos
inválidos en el HTML. Falta además: navegación por flechas, `Esc` para cerrar, cierre por
click-outside, focus trap/retorno de foco, `aria-controls`/`id` enlazando trigger y menú.

### 9.9 🟡 Documentación que miente
- README: `apps/example-app`, `pnpm example`, `pnpm dev`, `pnpm storybook` en la raíz →
  **`apps/` no existe y esos scripts no están en el `package.json` raíz**.
- README: anuncia 6 paquetes publicados; el workflow publica 1.
- `copilot-instructions.md`: usa `packages/components/` (real: `packages/ui/src/`),
  `packages/utils/dom.ts` (real: `packages/utils/dom-utils/src/dom.ts`) e importaciones
  `../../../utils/dom` (real: `@ownui/dom-utils`).
- `e2e/README.md`: enlaza QUICKSTART.md, FINAL-SUMMARY.md, INSTALLATION.md, EXAMPLES.md,
  SUMMARY.md, CHECKLIST.md, ROADMAP.md → **ninguno existe**.
- `@docs/my-project-structure.md`: describe una estructura `src/components/` de un solo
  paquete con Emotion; no corresponde a este monorepo.

### 9.10 🟡 Varios
- `peerDependencies: tailwindcss ">= 3.4.17 <4.1.1"` pero se usa 4.1.7 (dev) / 4.1.1
  (storybook) ⇒ el rango excluye lo que realmente se usa, y el plugin depende de features v4.
- `@ownui/ui` importa los componentes por ruta relativa, pero `Button` importa `@ownui/loader`
  y `@ownui/dom-utils`, que **no están en las dependencias de `@ownui/ui`** ⇒ build frágil.
- `@ownui/dropdown` tiene `"main": ".src/index.ts"` (typo, con punto inicial).
- `Loader.variants.ts` existe y está vacío.
- `generateThemeProperties` está duplicado: en `functions/` (exportado y testeado) y
  reimplementado literal dentro de `plugin.ts`.
- `splitStyles.ts` está testeado pero no lo usa nadie (restos del pipeline PostCSS planeado).
- `formatAndCleanPluginConfig` corrompe nombres de tema con mayúsculas/dígitos sin avisar.
- `@ownui/dom-utils` no tiene tests ni `tsconfig` de test; `license: ISC` mientras el resto es MIT.
- `collectCoverage: true` global en Jest.
- `packages/tw-theme/test-results/` está versionado (artefacto de Playwright).
- `getThemeNameConfig` (`theme.ts`) compara `flag !== "string"` — comparación contra el
  **literal** `"string"` donde se pretendía `typeof flag !== "string"`. La primera rama se
  cumple casi siempre, así que `--prefersdark` se ignora y todo tema custom se registra como
  `--default`. **Ya corregido en la rama `tw-theme/v1`** (§11).
- `variants/button.ts` declara `ghost` **dos veces**: en `theme` y en `variant`. Es la razón
  por la que `variant="ghost"` parece funcionar pese al bug de §9.4 (el lookup cae en `theme`
  y encuentra la clave por coincidencia).
- **Contraste sin verificar y probablemente fuera de norma**: el patrón `-content: #ffffff`
  uniforme en las 8 familias del tema light da ratios por debajo de WCAG AA (4.5:1) —
  medidos: `warning` 2.15:1, `success` 2.28:1, `primary` 3.68:1. Los rellenos claros necesitan
  `-content` oscuro. Ver lote 22.

---

## 11. Estado de ramas: trabajo no mergeado

**`main` no es el estado más avanzado del repo.** Hay 15 ramas remotas y dos contienen trabajo
real que se solapa con la deuda de §9. Leer esto antes de abrir cualquier lote, o se reimplementa
algo que ya existe en una rama.

| Rama | Ahead | Behind | Fecha | Contenido |
|---|---|---|---|---|
| `components` | **7** | **0** | 2026-02-27 | Rediseño de `button.css`, nueva paleta de marca, tokens de estado, skill de React |
| `tw-theme/v1` | **4** | 9 | 2026-02-27 | **Publicación del CSS** (`exports["./css"]`), fix de `getThemeNameConfig`, v1.0.1 |
| `copilot/update-tw-theme-readme` | 5 | 37 | 2025-12-12 | +375 ln de README documentando el sistema de componentes |
| `changeset-release/main` | 1 | 0 | 2025-12-15 | Automática de Changesets (release de 6 paquetes) |
| `copilot/update-react-to-19-0-3`, `…-versions-to-19-0-3` | 2 | 41/44 | 2025-12-12 | Bump React 19.0.3 (ya incluido en `components`) |
| `copilot/update-copilot-instructions`, `copilot/delegate-to-cloud-agent` | 1 | 37/41 | 2025-12-12 | Obsoletas |
| `feat/tw-theme`, `feat/v1`, `copilot/fix-*`, `copilot/update-react-version-19-0-1` | 0 | 33–49 | 2025-12 | **Sin aporte**: 0 commits ahead, mergeadas o abandonadas |

### 11.1 `components` — 7 ahead, 0 behind (descendiente directo de `main`)

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

### 11.2 `tw-theme/v1` — 4 ahead, 9 behind

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

Los lotes 1, 4 y 5 de [`@docs/BUILD-BATCHES.md`](./@docs/BUILD-BATCHES.md) **se solapan con
estas dos ramas**. Por eso el plan abre con un lote 0 de reconciliación: decidir qué se rescata,
qué se descarta y qué se reimplementa, antes de escribir código nuevo.

---

## 10. Dónde mirar primero

| Pregunta | Archivo |
|---|---|
| ¿Qué tokens existen? | `packages/tw-theme/src/themes/{root,rootColors,light,dark}.ts` |
| ¿Cómo se inyecta un tema? | `packages/tw-theme/src/plugin.ts`, `src/theme.ts` |
| ¿Qué clases genera el plugin? | `packages/tw-theme/src/utilities/colors.ts` |
| ¿Qué prop → qué clase? | `packages/tw-theme/src/variants/*.ts` |
| ¿Cómo se escribe CSS de componente? | `packages/tw-theme/src/css/button.css` + `.github/instructions/components-css.instructions.md` |
| ¿Cómo se escribe un componente? | `packages/ui/src/Button/src/useButton.tsx` + `.github/instructions/components-react.instructions.md` |
| ¿Cómo se hace un compound? | `packages/ui/src/Dropdown/src/{Dropdown.tsx,DropdownContext.tsx}` |
| ¿Cómo se testea el plugin de verdad? | `packages/tw-theme/e2e/` |
| ¿Las 3 formas de configurar el plugin? | `packages/storybook/.storybook/styles/tailwind.css` |
| ¿Qué construir y qué publicar? | `turbo.json`, `.github/workflows/release.yml` |
