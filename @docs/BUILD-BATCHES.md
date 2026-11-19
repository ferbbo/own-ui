# Own UI — Plan de construcción por lotes

> Documento operativo para trabajar de forma autónoma. Cada **lote** es una unidad de trabajo
> cerrada: entra con un objetivo, sale con criterios de aceptación verificables, un changeset
> y un PR. Contexto arquitectónico: **[`AGENTS.md`](../AGENTS.md)** (leer primero).
>
> Rama de trabajo: `claude/great-archimedes-5f008a` · Creado: 2026-11-17

---

## Cómo usar este documento

**Protocolo de lote (invariante):**

1. Leer `AGENTS.md` §4 (tokens), §5 (arquitectura React) y §8 (reglas).
2. Leer la ficha del lote: objetivo, archivos, criterios de aceptación.
3. Implementar **sólo** lo que está en el alcance del lote. Lo que descubras fuera de alcance
   va a §"Hallazgos" al final, no al diff.
4. Verificar con los comandos de la ficha. Si un criterio no se cumple, no cerrar el lote.
   **Si el lote toca empaquetado** (`package.json`, `exports`, `files`, build), la verificación
   no vale desde el monorepo: hay que instalar el tarball de `npm pack` en un proyecto limpio
   **fuera** del repo. Dentro del paquete, un `@import "@ownui/<pkg>/…"` resuelve por
   _self-reference_ de Node y da falso positivo — así se colaron en el lote 1 un `exports` a un
   directorio (que Node no resuelve) y un rango de peer que hacía fallar `npm install`.
5. `pnpm changeset` (si toca un paquete publicable) → commit conventional → PR.
6. Un lote = un PR. No mezclar lotes.

**Reglas de oro, en orden de prioridad:**

- **El contrato manda.** `variants/<name>.ts` ⇄ `css/<name>.css` ⇄ `<Name>.types.ts` deben
  decir exactamente lo mismo. Toda prop debe resolver a una clase que exista.
- **Ningún color literal fuera de `themes/*.ts`.**
- **CSS antes que React.** Un componente sin CSS publicado no está hecho.
- **Tests reales.** Nunca stubs de `console.log` (ver `Button.test.tsx` como antipatrón).
- **Cambio en el plugin ⇒ fixture e2e.**

**Secuenciación.** El lote **0 va primero y sin excepción**: `main` no es el estado más
avanzado del repo, y las ramas `components` (7 commits ahead, 0 behind) y `tw-theme/v1`
(4 ahead) contienen trabajo que se solapa con los lotes 1, 4 y 5. Abrir esos lotes sin
reconciliar antes significa reimplementar algo que ya existe, o pisarlo.
Después, los lotes 1–3 son **bloqueantes**: desbloquean la verificabilidad de todo lo demás.
No empieces un componente nuevo antes de cerrarlos.

```
FASE 0 — CIMIENTOS (secuencial, bloqueante)
  L0  Reconciliar las ramas sin mergear       ← PRIMERO: hay trabajo que se solapa
  L1  Publicar el CSS de componentes          ← bug raíz (ya prototipado en tw-theme/v1)
  L2  Arreglar la ejecución de tests
  L3  Arreglar build y release

FASE 1 — CERRAR LO EXISTENTE (L4–L7 paralelizables tras L1–L3)
  L4  Escala de superficies base-100/200/300
  L5  Button: contrato, loading, iconos
  L6  Dropdown: CSS de menu/trigger
  L7  Dropdown: a11y e higiene de props

FASE 2 — INFRAESTRUCTURA DE ESCALA
  L8  Generador de componentes + plantillas
  L9  App de ejemplo + verdad en la documentación

FASE 3 — COMPONENTES NUEVOS (paralelizables entre sí)
  L10 Input / Field         L11 Checkbox + Radio + Switch
  L12 Card + Badge + Avatar L13 Modal / Dialog
  L14 Tabs                  L15 Tooltip + Popover
  L16 Select                L17 Toast
  L18 Accordion             L19 Table

FASE 4 — MADUREZ
  L20 Tokens de tipografía y espaciado
  L21 Temas adicionales + constructor de temas
  L22 Auditoría de contraste WCAG AA
  L23 Visual regression + budgets de bundle
```

---

# FASE 0 — Cimientos

## L0 🔴 Reconciliar las ramas sin mergear

**Problema.** `main` está por detrás del trabajo real. Inventario completo en `AGENTS.md` §11;
lo que importa para el plan:

- **`components`** (7 ahead, **0 behind** — descendiente directo de `main`, 2026-02-27) trae un
  `button.css` rediseñado, 5 tokens globales de estado nuevos (`--hover-depth`, `--active-depth`,
  `--disabled-bg-opacity`, `--disabled-fg-opacity`, `--transition-duration`) y una paleta de
  marca. **Se solapa con los lotes 4 y 5.**
- **`tw-theme/v1`** (4 ahead, 9 behind) **ya resuelve el bug raíz del lote 1** con la opción (B):
  `exports["./css"]` + `cp -R ./src/css dist/` en el build. Y corrige el bug de
  `getThemeNameConfig`. **Se solapa con los lotes 1 y 21.**
- `copilot/update-tw-theme-readme` (5 ahead, 37 behind) aporta +375 ln de README documentando el
  sistema de componentes — material reutilizable para el lote 9.
- Siete ramas con **0 commits ahead** (`feat/tw-theme`, `feat/v1`, `copilot/fix-*`,
  `copilot/update-react-version-19-0-1`) no aportan nada: candidatas a borrar.

**El trabajo de este lote es decidir, no programar.** Para cada rama: rescatar (cherry-pick o
merge), reimplementar (tomar la idea, escribir el código de nuevo sobre `main`) o descartar
(y borrar la rama). La decisión se documenta en el PR.

**Alcance**

1. **`tw-theme/v1` → rescatar.** Es pequeña y resuelve el bug raíz. Opciones: mergearla (está 9
   behind, requiere resolver conflictos) o cherry-pick de los 2 commits útiles
   (`1457676` fix de `getThemeNameConfig` + el cambio de `package.json`), descartando los de
   versionado/release que Changesets regenerará. **Recomendado: cherry-pick**, y que el lote 1
   parta de ahí en vez de desde cero.
   Corregir al integrarlo: `"./css": "./dist/css"` apunta a un directorio y Node no lo resuelve
   → `"./css/*": "./dist/css/*"`.
   Decidir aparte el cambio de semántica que trae: elimina `:where(${root})` de la rama
   `--default`, con lo que un tema custom _default_ deja de pintar la raíz. **Es un cambio
   observable**: o se acepta con fixture e2e que lo fije, o se deja fuera del cherry-pick.
2. **`components` → rescatar parcialmente, con tres arreglos previos.** El `button.css` y los
   tokens de estado son una mejora clara del sistema; la paleta es una decisión de producto que
   no me toca tomar. Pero la rama **no es mergeable tal cual**:

   | #   | Regresión                                                                                                                                                                                                                                                                                                       | Arreglo                                                                                                                                   |
   | --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
   | 1   | Elimina los 8 `--color-*-focus`, pero su propio `button.css` hace `--btn-focus-color: var(--color-primary-focus)`. Un `var()` a token inexistente da valor _guaranteed-invalid_: `--btn-focus-color` queda definido-pero-inválido y el fallback **no se dispara** (IACVT) ⇒ hover y `outline` roto en silencio. | O se reponen los `-focus`, o `button.css` deja de depender de ellos y deriva el color de interacción con `color-mix` sobre `--btn-color`. |
   | 2   | `utilities/colors.ts` sigue con `semanticColorVariants = ["", "-content", "-focus"]` ⇒ **40 utilidades `*-focus` apuntando a tokens inexistentes.**                                                                                                                                                             | Coherente con la decisión de (1): o se quita `-focus` de la lista, o se reponen los tokens.                                               |
   | 3   | `--color-accent-content: #4E46B4` es **idéntico** a `--color-accent` en light ⇒ texto invisible (contraste 1:1).                                                                                                                                                                                                | Corregir el `-content`.                                                                                                                   |

   Y ojo: **el bug de `Button.variant` (§9.4) no está arreglado ahí.** El diff de `useButton.tsx`
   es sólo reformateo de Prettier; `button.theme[variant]` sigue intacto. El lote 5 sigue en pie.

3. **`copilot/update-tw-theme-readme` → extraer contenido, descartar rama.** Está 37 behind; no
   vale mergearla. Guardar el README como insumo del lote 9. Corrobora dos cosas de §9:
   que `menu.css` no está implementado y que `ghost` está duplicado en `theme` y `variant`.
4. **Ramas con 0 ahead → borrar** tras confirmar que su trabajo está en `main`.
5. **`changeset-release/main`** se regenera sola; dejarla en paz o borrarla.
6. Decidir si `main` adopta React 19.0.3 (viene en `components` y en dos ramas copilot).
7. **Actualizar `AGENTS.md` §4.1/§4.3** con los tokens y la paleta que finalmente queden. El
   documento describe hoy `main`; si entra `components`, esas dos tablas cambian.

**Criterios de aceptación**

- [ ] Cada una de las 14 ramas tiene una decisión escrita: rescatar / reimplementar / descartar.
- [ ] `tw-theme/v1` integrado o su contenido explícitamente trasladado al lote 1.
- [ ] Si entra `components`: ninguna clase ni token referencia un `--color-*-focus` inexistente.
      Verificar con `grep -rn "focus" packages/tw-theme/src/` cruzado contra `themes/*.ts`.
- [ ] Si entra `components`: ningún par `-content` igual a su color base.
- [ ] `git ls-remote --heads origin` sin ramas muertas (0 ahead).
- [ ] `AGENTS.md` §4 y §11 reflejan el estado posterior a la reconciliación.

**Comandos**

```bash
git fetch origin
for b in $(git ls-remote --heads origin | awk '{print $2}' | sed 's|refs/heads/||'); do
  [ "$b" = main ] && continue
  echo "$(git rev-list --left-right --count origin/main...origin/$b)  $b"
done
```

```bash
git diff origin/main...origin/components -- packages/tw-theme/src/
```

**Resultado (ejecutado).** Ver [`specs/lote-0.md`](../specs/lote-0.md) para el inventario
completo, la decisión por rama y las 11 decisiones registradas. Resumen:

- **Rescatado de `tw-theme/v1`:** el fix de `getThemeNameConfig` (con tests). El mecanismo de
  publicación de CSS se traslada al lote 1 (ver abajo); el cambio de semántica `:where(root)`
  queda fuera, pendiente de decisión y de fixture e2e.
- **Rescatado de `components`:** los 5 tokens globales de estado y el `button.css` rediseñado.
  **La paleta de marca NO se adopta** (decisión de producto, no técnica). Esa elección disuelve
  las tres regresiones de §11.1 en lugar de parchearlas: los 8 `--color-*-focus` siguen
  existiendo, así que ni el CSS ni las 40 utilidades de `colors.ts` quedan huérfanas, y ningún
  `-content` colisiona con su base.
- **Rescatado a `@docs/salvage/`:** el README del sistema de componentes (insumo del lote 9) y
  un fixture React + Vite que no existía en `develop` (insumo del lote 1).
- **React 19.0.3 NO se adopta:** la línea publicada va por 19.3.1 y hoy los tests de
  componentes no se ejecutan (§9.2). Merece lote propio.
- **Borrado de ramas:** NO ejecutado. Es destructivo y no revisable en una PR, así que se
  entrega como `scripts/cleanup-dead-branches.sh` (dry-run por defecto) para ejecución manual
  tras aprobar la PR. `components` y `tw-theme/v1` se conservan a propósito: aún guardan la
  paleta y el cambio de semántica, pendientes de decisión.

---

## L1 🔴 Publicar el CSS de componentes

**Problema.** `packages/tw-theme/src/css/*.css` no se importa en ningún lugar del repo
(`grep`: 0 referencias). El plugin sólo inyecta tokens y utilidades de color. Quien instale la
librería recibe `class="btn btn-primary btn-md"` sin ninguna regla que las defina. **Hoy la
librería no renderiza estilada fuera de Storybook.**

**Decisión de diseño (tomarla explícitamente y documentarla en el PR).** Dos caminos:

- **(A) Pipeline CSS→JS, inyección vía `addComponents()`** — el camino que la documentación
  histórica describe (`build:components` → `src/build/components.js` → `{component}Styles`).
  Requiere PostCSS + `postcss-nesting` + `postcss-js` + `postcss-apply` (ya están en
  devDependencies, señal de que era el plan). Ventaja: un único `@plugin` y el usuario no
  importa CSS. Coste: pipeline de build propio, y `@apply` dentro de objetos JS es frágil.
- **(B) CSS plano publicado + `@import`** — enviar los `.css` en `files` y exponerlos como
  subpath exports (`@ownui/tw-theme/css/button.css`), más un `css/index.css` agregador.
  El usuario añade un `@import` o `@source`. Ventaja: simple, depurable, nativo a Tailwind v4.
  Coste: un paso manual en la instalación.

**Recomendación: (B) primero** — desbloquea la librería en un lote y es reversible; (A) puede
venir después como azúcar. Si eliges (A), elimina del repo la alternativa para no dejar dos
sistemas declarados (el error que ya ocurrió con Changesets vs semantic-release).

> **La rama `tw-theme/v1` ya implementa (B)**: `exports["./css"]` + `cp -R ./src/css dist/` en el
> script de build, con `files: ["dist"]` ya en su sitio. **Parte de ahí, no de cero** (lote 0).
> Le falta corregir `"./css": "./dist/css"` → `"./css/*": "./dist/css/*"`, porque Node no
> resuelve un export que apunta a un directorio.
> La rama `components` tomó otro camino — `@import` de los 4 `.css` en el `tailwind.css` de
> Storybook, apuntando a `node_modules/@ownui/tw-theme/src/css/…`. Eso arregla Storybook y **no**
> el paquete publicado (`src/` no se publica): sirve como confirmación del bug, no como solución.

> **Trasladado del lote 0 (AC2).** `tw-theme/v1` se descartó como rama, pero su aporte a este
> lote queda aquí literal, ya corregido. En `packages/tw-theme/package.json`:
>
> ```json
> "files": ["dist"],
> "exports": {
>   "./css/*": "./dist/css/*",
>   "./css": "./dist/css/index.css"
> },
> "scripts": {
>   "build": "rimraf dist && npm run build:lib && cp -R ./src/css dist/"
> }
> ```
>
> Dos avisos sobre ese snippet:
>
> 1. El original escribía `"./css": "./dist/css"`, que apunta a un **directorio**: Node no lo
>    resuelve. De ahí `"./css/*"` y que `"./css"` apunte al agregador `index.css` — que hay que
>    crear en este lote, o el export queda roto.
> 2. `cp -R` no está en Windows. Si importa, usar `cpy-cli`/`shx` o un plugin de tsup.
>
> Lo que **no** se trasladó: la rama también eliminaba `:where(${root})` de la rama `--default`,
> de modo que un tema custom _default_ deja de pintar la raíz. Es un cambio de comportamiento
> observable y una decisión de producto (¿"mi tema es el tema del sitio" o "mi tema existe pero
> hay que activarlo"?). El lote 0 lo dejó fuera a propósito y lo registró como pregunta abierta
> P-01. Si se adopta aquí, va con fixture e2e que lo fije.
>
> **Insumo disponible:** `@docs/salvage/e2e-fixture-react-components.md` trae un fixture React +
> Vite que monta `@ownui/button` con un tema custom y un conmutador de temas. Es el punto de
> partida del fixture `component-styles/` que piden los criterios de aceptación de abajo.
>
> **Ojo con el `@apply`:** el `button.css` que dejó el lote 0 **ya no usa `@apply`** (el rescate
> de `components` lo sustituyó por custom properties puras). `loader.css` y `dropdown.css` sí
> siguen usándolo, así que la verificación del pipeline de `@apply` sigue en pie para ellos.

**Alcance**

- Crear `packages/tw-theme/src/css/index.css` que importe los 4 componentes.
- Escribir `menu.css` (hoy 0 líneas) o eliminarlo del repo y del agregador. No dejarlo vacío.
- `package.json`: añadir `"src/css"` (o `"dist/css"`) a `files`; añadir exports
  `"./css/*": "./dist/css/*"` y `"./css": "./dist/css/index.css"`.
- Que el build copie los `.css` a `dist/` (script de copia o plugin de tsup).
- Verificar el pipeline de `@apply`: `button.css` y `loader.css` usan `@apply` y anidamiento
  nativo. En Tailwind v4 el `@apply` del consumidor funciona si el CSS pasa por su build —
  **probarlo en un fixture, no asumirlo.**
- Documentar la instalación real en `README.md` y `packages/tw-theme/README.md`.

**Criterios de aceptación**

- [ ] Nuevo fixture e2e `component-styles/` con un `<button class="btn btn-primary btn-md">`.
- [ ] El spec verifica, sobre CSS compilado en Chromium: `background-color` resuelto al valor
      de `--color-primary` (no `transparent`), `height` ≈ `2.5rem`, `border-radius` ≠ `0px`.
- [ ] Un segundo caso con `data-theme="dark"` cambia el `background-color` computado.
- [ ] `pnpm --filter @ownui/tw-theme build && ls dist/css/` lista los `.css`.
- [ ] `npm pack --dry-run` en `packages/tw-theme` incluye el CSS.
- [ ] README muestra los pasos de instalación **ejecutados y verificados**, no inventados.

**Comandos**

```bash
pnpm --filter @ownui/tw-theme build
pnpm --filter @ownui/tw-theme e2e
cd packages/tw-theme && npm pack --dry-run
```

---

## L2 🔴 Arreglar la ejecución de tests

**Problema.** `jest.config.js`, proyecto `components`:
`testMatch: ["<rootDir>/packages/components/**/__test__/**/*.{test,spec}.{ts,tsx}"]`.
Esa ruta **no existe**; la real es `packages/ui/src/*/__test__/`. Los tests de Dropdown (161 ln)
y Loader (63 ln) son reales y nunca se han ejecutado. `pnpm test` global sale **en verde**
porque el proyecto `tw-theme` sí encuentra tests, y en `ci.yml` el paso por paquete es
`pnpm test:$pkg || echo "No tests for $pkg"`, que **se traga el fallo** ⇒ falsa señal verde.

Además `packages/ui/src/Button/__test__/Button.test.tsx` **no es un test**: redefine
`describe`, `test`, `expect` y `render` con funciones que hacen `console.log` y no asertan nada.
Hay que reescribirlo completo con RTL.

**Alcance**

- Corregir `testMatch` y `collectCoverageFrom` a `packages/ui/src/**`.
- Reescribir `Button.test.tsx` con `@testing-library/react` real: render por defecto, clases de
  `theme`, clases de `size`, estado `disabled`, click (con `userEvent`), polimorfismo `as="a"`
  (+ `href`), forwarding de ref, `loading`.
- Ejecutar Dropdown y Loader; corregir lo que falle **en los tests** si la expectativa está
  mal, o abrir hallazgo si el fallo revela un bug de producto (probable: §9.4 y §9.7 de AGENTS).
- Añadir un test a `@ownui/dom-utils` (`useDOMRef`: expone el nodo, soporta ref callback y
  `null`).
- Hacer `collectCoverage` opcional: dejarlo sólo en `test:coverage`.
- Añadir un paso `pnpm test` incondicional en `ci.yml` (hoy depende de la detección de cambios,
  que puede saltárselo).

**Criterios de aceptación**

- [ ] `pnpm test:components` ejecuta **>0 suites** y las tres pasan.
- [ ] `grep -rn "const describe\|const expect\|const render" packages/ui` → sin resultados.
- [ ] Cobertura de `packages/ui/src/**` reportada (no 0%); Button ≥90% de líneas.
- [ ] `pnpm test` verde en limpio.

---

## L3 🔴 Arreglar build y release

**Problema.** `"build": "turbo build --filter='@ownui/tw-theme'"` construye **sólo el plugin**.
`release.yml` llama a ese mismo `pnpm build` antes de publicar, y `pnpm release` publica
únicamente `@ownui/tw-theme`, mientras el README anuncia 6 paquetes. `@ownui/ui` importa
`@ownui/loader` y `@ownui/dom-utils` (vía `Button`) sin declararlos en sus `dependencies`.

**Alcance**

- `"build": "turbo build"` y declarar `"dependsOn": ["^build"]` en la tarea `build` de
  `turbo.json` para respetar el orden topológico (dom-utils → loader → button → ui).
- Añadir `@ownui/button`, `@ownui/dropdown`, `@ownui/loader`, `@ownui/dom-utils` como
  `workspace:*` en las `dependencies` de `@ownui/ui`.
- Corregir `"main": ".src/index.ts"` → `"dist/index.js"` en `@ownui/dropdown`.
- Alinear el peer de Tailwind: `">=4.1.0 <5"` (el plugin usa features de v4; el rango actual
  `>=3.4.17 <4.1.1` excluye las versiones realmente usadas: 4.1.7 y 4.1.1).
- Decidir el alcance del release: o `pnpm release` → `changeset publish` (todos los paquetes con
  changeset), o dejar el filtro y **corregir el README**. No dejar la discrepancia.
- Borrar `.releaserc` (semantic-release huérfano, ningún workflow lo invoca) o documentar por
  qué se conserva.
- `.gitignore`: añadir `packages/*/test-results/` (hoy versionado).
- Añadir script raíz `"storybook": "pnpm --filter @ownui/storybook storybook"`.

**Criterios de aceptación**

- [ ] `pnpm build` en limpio produce `dist/` en los 5 paquetes publicables.
- [ ] `node -e "require('./packages/ui/dist/index.js')"` no lanza módulo no encontrado.
- [ ] `pnpm --filter @ownui/ui build` funciona tras `rm -rf packages/*/dist`.
- [ ] `pnpm release --dry-run` (o `changeset publish --dry-run`) lista exactamente los paquetes
      que el README promete.
- [ ] `git status --short` limpio tras `pnpm --filter @ownui/tw-theme e2e`.

---

# FASE 1 — Cerrar lo existente

## L4 🟠 Escala de superficies `base-100/200/300`

**Problema.** `rootColors.ts` define sólo `--color-base-200: #000000` y
`--color-base-content: #ffffff`. `dropdown.css` usa `--color-base-100` 3 veces: el token está
**indefinido**, por lo que el fallback de `var()` no se dispara y el fondo no resuelve. Y los
colores base son fijos (negro/blanco) — no cambian entre light y dark, lo que hace que
`.btn` sin variante sea negro en tema claro.

**Alcance**

- Mover la escala de superficies de `rootColors.ts` a `light.ts` y `dark.ts` (son
  dependientes del tema, no globales):

  | Token                  | Light     | Dark      | Rol                        |
  | ---------------------- | --------- | --------- | -------------------------- |
  | `--color-base-100`     | `#ffffff` | `#1d232a` | superficie principal       |
  | `--color-base-200`     | `#f2f2f2` | `#191e24` | superficie elevada/alterna |
  | `--color-base-300`     | `#e5e6e6` | `#15191e` | bordes y separadores       |
  | `--color-base-content` | `#1f2937` | `#e5e7eb` | texto sobre superficies    |

- Dejar en `rootColors.ts` sólo lo verdaderamente invariante (o vaciarlo y simplificar
  `themes/index.ts`).
- Añadir `base-100/200/300` a `semanticColorNames`… **no**: ojo, generaría
  `.bg-base-100-content`, que no existe. En su lugar, extender `generateColorUtilities` con una
  lista separada de tokens de superficie que sólo emita `bg`/`text`/`border`/`divide` sin
  variantes `-content`/`-focus`. Añadir el tipo correspondiente en `types.ts`.
- Revisar `button.css` (usa `base-200` como color por defecto) y `dropdown.css`.

**Criterios de aceptación**

- [ ] `grep -rn "color-base-" packages/tw-theme/src/css/` — todo token referenciado existe en
      `light.ts` **y** `dark.ts`.
- [ ] Fixture e2e: `.bg-base-100` resuelve a blanco en light y a oscuro con `data-theme="dark"`.
- [ ] Un `.dropdown` renderizado tiene `background-color` ≠ `rgba(0,0,0,0)`.
- [ ] Un `.btn` sin variante es legible en ambos temas (fondo claro + texto oscuro en light).
- [ ] Documentada la escala en `AGENTS.md` §4.2.

---

## L5 🟠 Button: contrato, loading e iconos

**Problemas (tres, relacionados).**

1. **`variant` no aplica clase.** `useButton.tsx`:
   `const variantCls = button.theme[variant] || ""` — consulta el mapa de **themes** con una
   clave de **variant**. Y `variants/button.ts` declara `variant: {outline, solid, ghost}`
   mientras `ButtonVariant = "outline" | "dash" | "soft"` y el CSS tiene
   `.btn-outline`/`.btn-dash`/`.btn-soft` (no existe `.btn-solid`). Las tres fuentes discrepan.
2. **`loading` descarta children.** `{loading ? <Loader /> : <>{children}</>}` sustituye el
   label; el `<Loader />` no hereda `size` ni `color`, así que siempre es `primary`/`md` —
   invisible en `btn-primary` (azul sobre azul).
3. **`icon`/`startIcon`/`endIcon`** están en `ButtonBaseProps` y **no se usan en el render**.
   Además `startIcon`/`endIcon` están tipados `boolean`, lo que no permite pasar un nodo.

**Alcance**

- Alinear el contrato en las 3 capas: `variants/button.ts` → `variant: {outline, dash, soft}`;
  `useButton` → `button.variant[variant]`; `ButtonVariant` sin `solid` (solid = ausencia de
  variante, como ya asume el CSS y las stories).
- `loading`: renderizar spinner **junto** al contenido, con `aria-busy="true"` en el botón y el
  botón deshabilitado para interacción. El Loader hereda tamaño (mapa `ButtonSize → LoaderSize`)
  y usa el color de contenido del tema (vía `currentColor` o `--btn-fg`; valorar añadir
  `.loader-current` en `loader.css` en lugar de forzar un `color` semántico).
- Iconos: retipar `startIcon?: React.ReactNode`, `endIcon?: React.ReactNode`; eliminar `icon`
  (redundante) o definirlo como botón icon-only con `aria-label` obligatorio y `.btn-square`.
  Renderizarlos con clases de gap del CSS de botón.
- Exponer en `variants/button.ts` los modificadores de layout que el CSS ya tiene y React
  ignora: `.btn-square`, `.btn-circle`, `.btn-wide`, `.btn-block`, `.btn-active`.
- Actualizar stories y tests para cubrir cada variante y cada combinación icono/loading.

**Criterios de aceptación**

- [ ] Test: para cada `variant ∈ {outline, dash, soft}`, el nodo tiene la clase `btn-<variant>`.
- [ ] Test: para los 10 `theme`, clase `btn-<theme>`.
- [ ] Test: `loading` ⇒ children siguen en el DOM **y** existe `[role="status"]` **y**
      `aria-busy="true"`.
- [ ] Test: `startIcon`/`endIcon` renderizan el nodo en el orden correcto.
- [ ] Test: `as="a"` + `href` renderiza `<a href>`; `disabled` no es aceptado por TS en `as="a"`
      (test de tipos con `@ts-expect-error`).
- [ ] `grep -n "button.theme\[variant\]" packages/ui` → sin resultados.
- [ ] Stories: `AllVariants` muestra diferencia visual real de las 3 variantes.

---

## L6 🟠 Dropdown: CSS de menu y trigger

**Problema.** Los hooks generan `dropdown-trigger`, `dropdown-trigger-active`, `dropdown-open`,
`dropdown-menu`, `dropdown-menu-{variant}`, `dropdown-menu-{size}`, `dropdown-menu-{styleVariant}`,
`dropdown-menu-open`, `dropdown-menu-closed`. En `dropdown.css` **no existe ningún selector
`.dropdown-menu*` ni `.dropdown-trigger*`**: el menú aparece en el flujo del documento, sin
posicionamiento, elevación ni transición. Los semánticos sólo cubren 4 de las 8 variantes que
`DropdownVariant` permite.

**Alcance**

- `.dropdown-trigger` + `.dropdown-trigger-active`: siguiendo la cascada de custom properties
  (`--dropdown-trigger-bg`, `-fg`, `-border`), estados por `color-mix`, `:focus-visible` con
  `outline` de 2px.
- `.dropdown-menu`: `position: absolute`, `inset-inline-start: 0`, `top: 100%`, `z-index`,
  `min-width`, `--dropdown-menu-shadow`, `border-radius: var(--radius-field)`,
  superficie `--color-base-100`.
- `.dropdown-menu-open` / `-closed`: transición de `opacity`/`translate`/`visibility`.
  **Respetar `prefers-reduced-motion`** (el `loader.css` ya establece ese precedente).
- Completar `.dropdown-{info,success,warning,error}` y las variantes de menú por tamaño.
- Decidir qué hacer con `.dropdown-menu-{variant}`: o se implementan los 8, o el hook deja de
  emitirlas. **No dejar clases emitidas sin CSS** — ésa es la causa de este lote.
- Revisar la semántica de `.dropdown`: hoy el contenedor raíz tiene fondo, padding y sombra
  propios (parece pensado como panel, no como wrapper de posicionamiento). Definir cuál es y
  ajustar; probablemente el wrapper debe ser `position: relative` sin estilo visual y el panel
  debe ser `.dropdown-menu`.

**Criterios de aceptación**

- [ ] Fixture e2e `dropdown/`: con el menú abierto, `position` computado = `absolute` y
      `box-shadow` ≠ `none`.
- [ ] Ninguna clase emitida por los hooks carece de selector:
      verificar con un script que cruce los literales de `useDropdown.tsx` contra `dropdown.css`.
- [ ] Las 8 variantes semánticas aplican color distinto.
- [ ] Con `prefers-reduced-motion: reduce` la transición se anula.
- [ ] Story `AllVariants` muestra las 8.

---

## L7 🟠 Dropdown: accesibilidad e higiene de props

**Problemas.** `DropdownContainer` hace `{...restProps}` sobre un `<div>` incluyendo `variant`,
`size`, `styleVariant`, `defaultOpen`, `open`, `onOpenChange` ⇒ warnings de React y atributos
inválidos en el HTML servido. Y la a11y está a medias: hay `aria-expanded`, `aria-haspopup`,
`role="menu"`, `role="menuitem"`, `tabIndex`, pero **no hay** navegación por flechas, cierre con
`Esc`, cierre por click-outside, retorno de foco al trigger, ni `aria-controls`/`id` enlazando
trigger y menú. Un `role="menu"` sin navegación por teclado es _peor_ que un div: miente al
lector de pantalla.

**Alcance**

- `DropdownRoot` debe consumir las props de configuración y pasar al `<div>` **sólo** los
  atributos DOM válidos. Patrón: separar `contextProps` de `domProps` explícitamente, no con
  rest spread del objeto completo.
- Teclado: `ArrowDown`/`ArrowUp` mueven el foco entre items (saltando `disabled`),
  `Home`/`End`, `Enter`/`Space` seleccionan, `Esc` cierra y devuelve el foco al trigger,
  `Tab` cierra.
- Click-outside con listener en `document` registrado sólo cuando `open` (y limpiado).
- `id` generado (`useId`) para el menú + `aria-controls` en el trigger.
- Evaluar migrar a `@react-aria/menu` + `@react-stately/menu` en lugar de reimplementar.
  **Decidirlo en el PR con argumentos**: coste de dependencia vs corrección. La regla §8.5 de
  AGENTS.md empuja hacia React Aria.
- `useDropdownItem` devuelve `itemProps` con `className` dentro — inconsistente con los demás
  hooks, que devuelven `classes` aparte. Unificar.

**Criterios de aceptación**

- [ ] `render` del Dropdown no emite warnings de React (test que falle si `console.error`
      recibe algo).
- [ ] El HTML del contenedor no contiene atributos `variant`, `size`, `defaultOpen`, etc.
- [ ] Tests de teclado: flechas mueven foco, `Esc` cierra y el foco vuelve al trigger,
      `Enter` selecciona, los `disabled` se saltan.
- [ ] Test de click-outside.
- [ ] `aria-controls` del trigger = `id` del menú.
- [ ] Listener removido al desmontar (test con spy en `removeEventListener`).

---

# FASE 2 — Infraestructura de escala

## L8 Generador de componentes y plantillas

**Objetivo.** Hacer que crear un componente sea mecánico y que sea **imposible** olvidar una
capa del contrato. La receta de 12 pasos de `AGENTS.md` §7 tiene demasiados puntos de fallo
manual; los lotes L5 y L6 existen justamente porque alguien saltó un paso.

**Alcance**

- Script `scripts/create-component.mjs` (expuesto como `pnpm create-component <Name>`) que
  genere: carpeta del paquete (package.json, tsconfig, tsup.config), `<Name>.types.ts`,
  `use<Name>.tsx`, `<Name>.tsx`, `index.ts`, `__test__`, `.stories.tsx`,
  `css/<name>.css` (esqueleto con la cascada), `variants/<name>.ts`, y que registre el export
  en `packages/ui/src/index.ts` y en `variants/index.ts`.
- Flag `--compound` para el patrón Provider (genera `<Name>Context.tsx` y los subcomponentes).
- Script `scripts/check-contract.mjs`: cruza, para cada componente, los literales de clase de
  los hooks contra los selectores de su `.css` y contra las claves de `variants/`. Falla si hay
  clase emitida sin CSS, o entrada de `variants` sin selector, o valor de tipo sin entrada.
- Integrar `check-contract` en `ci.yml` y como script `pnpm check:contract`.

**Criterios de aceptación**

- [ ] `pnpm create-component Demo` produce un paquete que compila, pasa lint, tiene un test que
      pasa y una story que renderiza — sin edición manual.
- [ ] `pnpm check:contract` detecta los desajustes conocidos de L5 y L6 si se reintroducen
      (probarlo revirtiendo un cambio en una rama scratch).
- [ ] `check:contract` corre en CI y falla el build cuando debe.

---

## L9 App de ejemplo y verdad en la documentación

**Problema.** El README documenta `apps/example-app`, `pnpm example`, `pnpm dev` y
`pnpm storybook` en la raíz. **`apps/` no existe** y esos scripts no están en el `package.json`
raíz. `e2e/README.md` enlaza 7 documentos inexistentes.
`copilot-instructions.md` usa rutas de una estructura anterior (`packages/components/`,
`packages/utils/dom.ts`, imports `../../../utils/dom`).
`@docs/my-project-structure.md` describe un proyecto de un solo paquete con Emotion.

La documentación que miente es peor que la ausente: un agente la sigue y produce código roto.

**Alcance**

- Crear `apps/example-app` real (Vite + React + TS) que consuma los paquetes por
  `workspace:*`, con cambio de tema (`data-theme`), todas las variantes de cada componente y un
  tema custom vía `@plugin "@ownui/tw-theme/theme"`. Sirve además como **prueba de humo de
  consumo real**: es lo que detectaría regresiones tipo L1.
- Scripts raíz: `example`, `example:build`, `storybook`, `dev`.
- Reescribir las rutas de `copilot-instructions.md` o reemplazarlo por un puntero a `AGENTS.md`
  (preferible: una sola fuente de verdad).
- `e2e/README.md`: eliminar los enlaces muertos o escribir los documentos.
- Mover `@docs/my-project-structure.md` a histórico o borrarlo.
- Pasar el README por una revisión de "¿esto se ejecuta?" comando a comando.

**Criterios de aceptación**

- [ ] `pnpm example` arranca y la app renderiza los 3 componentes estilados.
- [ ] El toggle de tema cambia los colores en vivo.
- [ ] Todo comando del README fue ejecutado y funciona (listarlos en el PR).
- [ ] `grep -rn "packages/components/" .github/ README.md` → sin resultados.
- [ ] Ningún enlace relativo roto en los `.md` (verificar con un script o a mano, y decirlo).

---

# FASE 3 — Componentes nuevos

**Plantilla de lote de componente.** Todo lote de L10 a L19 comparte este alcance y estos
criterios; la ficha de cada uno sólo añade lo específico.

**Alcance estándar (en este orden):**

1. `packages/tw-theme/src/css/<name>.css` con la cascada de §4.8 de AGENTS.md: base define
   todas las props → variantes sólo redefinen `--{c}-color` → estados vía `color-mix` en oklab →
   tamaños vía `--size-field` → `:focus-visible` con outline de 2px → estado disabled.
2. `packages/tw-theme/src/variants/<name>.ts` + registro en `variants/index.ts`.
3. Fixture e2e si introduce tokens o utilidades nuevas.
4. Paquete `packages/ui/src/<Name>/` (usar `pnpm create-component` tras L8).
5. Tipos con unión discriminada sobre `as` y `never` para props inválidas.
6. Hook con los 5 pasos de §5.2; Provider si 3+ subcomponentes.
7. Componente `forwardRef` + `React.memo`.
8. Export en `packages/ui/src/index.ts`.
9. Tests RTL reales, incluido teclado.
10. Stories: `Default`, `AllVariants`, `AllSizes`, `Disabled` (+ `AsLink` si polimórfico).
11. Changeset.

**Criterios de aceptación estándar:**

- [ ] `pnpm check:contract` en verde (ninguna clase emitida sin CSS, ningún valor de tipo sin
      entrada en `variants/`).
- [ ] Cada valor de cada prop de variante/tamaño aplica una clase que existe en el CSS.
- [ ] 8 variantes semánticas (si el componente es semántico) y legibles en light y dark.
- [ ] Hook de `@react-aria/*` apropiado; teclado completo; ARIA derivado del estado real.
- [ ] `React.memo` + `useMemo` en clases + `forwardRef` que expone el nodo DOM.
- [ ] Cobertura ≥90% de líneas del paquete.
- [ ] Build con banner `"use client"`; `sideEffects: false`.
- [ ] Contraste AA verificado para las 8 variantes en ambos temas.
- [ ] Ningún color literal fuera de `themes/*.ts`.

---

### L10 Input / Field

`@ownui/input`. Tokens nuevos probables: `--input-bg`, `-fg`, `-border`, `-placeholder`.
React Aria: `useTextField`. Props: `theme`, `size`, `variant` (`outline`/`ghost`/`bordered`),
`disabled`, `readOnly`, `invalid`, `startIcon`, `endIcon`, `label`, `description`, `errorMessage`.
Específico: estados `:invalid`/`aria-invalid`; relación `label`↔`input`↔`description`↔`error` con
`useId`; soporte `type` (text/email/password/number/search). Decidir si `Field` (label +
descripción + error) es un compound aparte — recomendado, para no inflar `Input`.

### L11 Checkbox + Radio + Switch

`@ownui/checkbox`, `@ownui/radio`, `@ownui/switch`. React Aria: `useCheckbox`,
`useCheckboxGroup`, `useRadio`, `useRadioGroup`, `useSwitch` (+ `@react-stately/*`).
Específico: estado indeterminado del checkbox; `RadioGroup` como Provider con roving tabindex;
el Switch comparte tokens con Checkbox pero no su geometría. Ir en un solo lote porque los tres
comparten el patrón de control marcable y los mismos tokens de `--control-*`.

### L12 Card + Badge + Avatar

`@ownui/card`, `@ownui/badge`, `@ownui/avatar`. Sin estado, sin React Aria (salvo `img` alt y
fallback de Avatar). Es el lote que **consume** la escala de superficies de L4 — buen test de
que `base-100/200/300` quedó bien. Card compound (`Card.Header`/`Body`/`Footer`); Badge con 8
variantes + `outline`/`soft` + tamaños; Avatar con imagen, iniciales, fallback y grupo.

### L13 Modal / Dialog

`@ownui/modal`. Provider. React Aria: `useDialog`, `useModalOverlay`, `useOverlayTrigger`,
`FocusScope`, `useId`. Específico: portal a `document.body`; focus trap y retorno de foco;
`Esc`; scroll lock; `aria-modal`, `aria-labelledby`, `aria-describedby`;
`prefers-reduced-motion`. Primer componente que necesita portal — documentar el patrón en
AGENTS.md, porque Popover/Tooltip/Select lo reutilizarán.

### L14 Tabs

`@ownui/tabs`. Provider + compound (`Tabs.List`/`Tab`/`Panels`/`Panel`).
React Aria: `useTabList`, `useTab`, `useTabPanel`. Específico: orientación horizontal/vertical;
controlado/no controlado; `activationMode` manual vs automática; indicador animado;
`aria-controls`/`aria-labelledby` cruzados.

### L15 Tooltip + Popover

`@ownui/tooltip`, `@ownui/popover`. React Aria: `useTooltip`/`useTooltipTrigger`,
`usePopover`/`useOverlayTrigger`. Específico: posicionamiento con _flip_ y _shift_ — decidir si
se usa `@react-aria/overlays` (incluye el posicionamiento) o `@floating-ui/react`;
**no escribir posicionamiento a mano**. Delays de apertura/cierre en tooltip; Popover con foco,
Tooltip sin él.

### L16 Select

`@ownui/select`. Provider. React Aria: `useSelect` + `@react-stately/select` + `useListBox`.
Específico: typeahead; opciones agrupadas; `multiple` (decidir si entra en este lote o en uno
posterior); colección virtualizada si >100 items (probablemente fuera de alcance, anotarlo).
Reutiliza los tokens de Dropdown y de Input — verificar que no se dupliquen.

### L17 Toast

`@ownui/toast`. Provider global + imperativo (`toast.success(...)`). React Aria: `useToast`,
`useToastRegion`. Específico: cola con límite, auto-dismiss con pausa al hover/focus,
`role="status"`/`"alert"` según severidad, posición configurable, portal, apilado. Es el primer
componente con API imperativa: documentar el patrón.

### L18 Accordion

`@ownui/accordion`. Provider + compound. React Aria: `useAccordion`/`useAccordionItem`
(o `useDisclosure`). Específico: `single`/`multiple`, animación de altura sin layout thrash
(`grid-template-rows: 0fr→1fr` o `interpolate-size`), `aria-expanded`/`aria-controls`.

### L19 Table

`@ownui/table`. Compound. React Aria: `useTable` + `@react-stately/table`.
Específico: `<caption>` y `scope`; ordenación con `aria-sort`; selección; sticky header;
responsive (scroll horizontal con sombras de borde); zebra con `base-200`.
**El de mayor coste del plan** — considerar partirlo en "tabla estática" y "tabla interactiva".

---

# FASE 4 — Madurez

## L20 Tokens de tipografía y espaciado

Hoy el sistema de diseño es **sólo color + geometría de control**. Faltan escalas de tipografía
(familia, pesos, tamaños, line-height, letter-spacing) y de espaciado. `--fontsize` y
`--paragraph` son tokens de control, no una escala.
Alcance: definir `--font-{sans,mono}`, escala `--text-{xs..4xl}` con line-height asociado,
pesos, y una escala de espaciado derivada de `--size-field`. Decidir si son tokens del plugin
(inyectados en `:root`) o extensión del `theme` de Tailwind — **documentar la decisión**, porque
determina si `text-lg` del usuario y el del sistema colisionan. Añadir fixture e2e.

## L21 Temas adicionales y constructor de temas

Hoy hay 2 temas built-in. `builtInThemes` es un `Record<string, ThemeColors>` y `plugin.ts` ya
tiene la rama para `othersSelectors`, pero no hay temas adicionales que la ejerciten.
Alcance: 3–5 temas (p. ej. `midnight`, `solar`, `forest`); habilitar `themes: "midnight,solar"`
en las opciones del plugin con fixture e2e que lo pruebe; función `defineTheme()` tipada que
valide que un tema custom aporta las 24 claves semánticas + superficies, con error claro si
falta alguna. Arreglar `formatAndCleanPluginConfig`, que hoy corrompe en silencio nombres con
mayúsculas o dígitos: debe **fallar con mensaje**, no sanear.

**Decidido (aprobado por el dueño, 2026-11-19) — entra en el alcance de este lote:**

1. **Flag `--opt-in`** (P-05 del lote 1). Hoy un tema custom sin flag y uno con `--default` se
   comportan igual, así que `--default` es decorativo y el caso "mi tema existe pero hay que
   activarlo con `[data-theme]`" **no tiene forma de expresarse**. Se añade como flag **nuevo
   y aditivo**: un valor en el enum `Flags` (`types.ts`), una rama en `theme.ts` y un fixture
   e2e. No se cambia la semántica de `--default`, que **sigue pintando la raíz** (P-01 del lote
   0, cerrada en `specs/lote-1.md` D-20 y ya fijada por `custom-theme.spec.ts:15`). Eso deja la
   propuesta de la rama `tw-theme/v1` resuelta sin romper a nadie: su mitad útil entra como
   flag, su cambio _breaking_ se descarta.
2. **La paleta de marca se publica como tema con nombre, no como tema por defecto** (P-02 de
   los lotes 0 y 1). El light/dark built-in se queda con la paleta neutra actual: una librería
   cuyo tema por defecto es la marca de su autor obliga a cada consumidor a sobreescribir 24
   tokens antes de usarla. La marca se registra con
   `@plugin "@ownui/tw-theme/theme" { name: "ownui --default"; … }`, que el plugin ya soporta.
   Antes de publicarla hacen falta los hex definitivos del dueño y tres correcciones sobre la
   paleta de la rama `components`: `--color-accent` ≠ `--color-primary`,
   `--color-accent-content` ≠ `--color-accent` (hoy contraste 1:1, texto invisible) y los 8
   `-focus` (o derivarlos con `color-mix`). Mientras no lleguen esos valores, la rama
   `components` se conserva como referencia y **no se borra**.

## L22 Auditoría de contraste WCAG AA

Ningún par `--color-{name}` / `--color-{name}-content` ha sido verificado, y los ratios
calculados sobre el tema light son malos: **ninguno de los tres medidos alcanza AA para texto
normal (4.5:1)**.

| Par (tema light)              | Ratio    | AA texto normal | AA componente (3:1) |
| ----------------------------- | -------- | --------------- | ------------------- |
| `warning #f59e0b` / `#ffffff` | **2.15** | ❌              | ❌                  |
| `success #22c55e` / `#ffffff` | **2.28** | ❌              | ❌                  |
| `primary #3b82f6` / `#ffffff` | **3.68** | ❌              | ✅                  |

El patrón `-content: #ffffff` aplicado uniformemente a las 8 familias es la causa: los rellenos
claros (warning, success) necesitan `-content` oscuro. Hay que recalcular los 8 pares en ambos
temas, no parchear uno.
Alcance: script `scripts/check-contrast.mjs` que calcule el ratio de cada par en cada tema y
falle bajo 4.5:1 (texto normal) / 3:1 (texto grande y componentes); corregir los `-content` que
no pasen; integrar en CI.

**Decidido (aprobado por el dueño, 2026-11-19):** esta corrección y la paleta de marca de L21
se hacen **en el mismo movimiento**. Recalcular los `-content` del tema neutro y, por separado,
estrenar una paleta de marca que tampoco se ha verificado, significaría auditar el contraste
dos veces. El `check-contrast.mjs` debe correr sobre **todos** los temas registrados, built-in
y de marca, no sólo sobre light/dark. Es un lote de **corrección de tokens**, y por eso va después de que
los componentes existan: cambiar un `-content` afecta a todo.

## L23 Visual regression y budgets de bundle

Alcance: Chromatic o Playwright screenshots sobre las stories (el repo ya tiene
`@chromatic-com/storybook` y `@storybook/experimental-addon-test` instalados pero sin usar);
`size-limit` por paquete con presupuesto declarado; `publint` + `@arethetypeswrong/cli` para
validar los exports y los `.d.ts` publicados (hay ya un typo de `main` detectado en L3 que esto
habría cazado). Integrar los tres en `ci.yml`.

---

## Resumen de prioridad

| Lote                 | Impacto    | Esfuerzo                  | Bloquea           |
| -------------------- | ---------- | ------------------------- | ----------------- |
| L0 Reconciliar ramas | 🔴 crítico | S (decidir, no programar) | L1, L4, L5, L21   |
| L1 CSS publicado     | 🔴 crítico | M                         | todo lo visual    |
| L2 Tests             | 🔴 crítico | S                         | toda verificación |
| L3 Build/release     | 🔴 crítico | S                         | toda publicación  |
| L4 Superficies       | 🟠 alto    | S                         | L6, L12           |
| L5 Button            | 🟠 alto    | M                         | —                 |
| L6 Dropdown CSS      | 🟠 alto    | M                         | —                 |
| L7 Dropdown a11y     | 🟠 alto    | M                         | L16               |
| L8 Generador         | 🟡 medio   | M                         | fase 3 (acelera)  |
| L9 Example + docs    | 🟡 medio   | M                         | —                 |
| L10–L19              | 🟢 feature | L cada uno                | —                 |
| L20–L23              | 🟡 medio   | M–L                       | —                 |

---

## Hallazgos (bitácora)

Registrar aquí lo que se descubra fuera del alcance de un lote, en vez de ampliar el diff.
Formato: `fecha · lote · hallazgo · ¿nuevo lote?`

- `2026-11-17` · análisis inicial · `generateThemeProperties` está duplicado: en `functions/`
  (exportado y con tests) y reimplementado literalmente dentro de `plugin.ts`. Unificar.
  → candidato a limpieza en L1.
- `2026-11-17` · análisis inicial · `splitStyles.ts` tiene tests pero **ningún consumidor**;
  es un resto del pipeline PostCSS que L1 opción (A) retomaría. Si se elige (B), borrarlo.
- `2026-11-17` · análisis inicial · `Loader.variants.ts` existe y está vacío (0 bytes).
  → borrar en L5 o L2.
- `2026-11-17` · análisis inicial · `@ownui/dom-utils` declara `license: ISC` mientras todo el
  resto es MIT. → alinear en L3.
- `2026-11-17` · análisis inicial · `menu.css` existe con 0 líneas; no hay componente Menu.
  → resolver en L1 (escribirlo o borrarlo).
- `2026-11-17` · L0 · `variants/button.ts` declara `ghost` **dos veces**: en `theme` (ln 11) y
  en `variant` (ln 17). Explica por qué `variant="ghost"` parece funcionar pese al bug de §9.4:
  el lookup erróneo cae en `theme` y encuentra la clave por coincidencia. → arreglar en L5.
- `2026-11-17` · L0 · `getThemeNameConfig` compara `flag !== "string"` contra el literal
  `"string"` donde se quería `typeof flag !== "string"` ⇒ `--prefersdark` se ignora y todo tema
  custom se registra como `--default`. Ya corregido en `tw-theme/v1`. → rescatar en L0.
- `2026-11-17` · análisis inicial · el bloque comentado en `generateColorUtilities` intentaba
  derivar utilidades de tokens arbitrarios (p. ej. `--color-brand` de la story `onion`).
  Hoy un token custom se inyecta pero no genera utilidades. → decidir en L21.
