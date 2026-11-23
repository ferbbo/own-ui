# Lote 9 — App de ejemplo y verdad en la documentación

## 1. Meta

| Campo           | Valor                                                                               |
| --------------- | ----------------------------------------------------------------------------------- |
| Lote            | **L9** — App de ejemplo y verdad en la documentación (`@docs/BUILD-BATCHES.md` §L9)  |
| Rama base       | `develop` (en `4db53f1`, merge del PR #35 / lote 8). No se movió durante el lote.    |
| Rama de trabajo | `claude/lote-9`                                                                      |
| Estado general  | **COMPLETO** — 4 tasks, 0 bloqueadas, 5/5 criterios cumplidos                        |
| Fecha           | 2026-11-23                                                                           |
| PR              | [#36 → `develop`](https://github.com/ferbbo/own-ui/pull/36) — listo para revisión    |

> **Nota sobre el número de lote.** El prompt programado llegó por tercera vez con el marcador
> `{{N}}` sin sustituir. Se resuelve a **N = 9**. Justificación en **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt (igual que en los lotes 0–8):

- **Slice** = unidad mínima verificable y testeable por sí sola, con criterios de aceptación
  propios.
- **Task** = agrupación de slices cohesivos (mismo módulo, archivos compartidos o criterios
  acoplados). **Una task = un commit.**

Reglas de oro de `@docs/BUILD-BATCHES.md` que condicionaron este lote:

- **El contrato manda.** La app de ejemplo no inventa clases: usa las props públicas y las
  utilidades que genera el plugin. `pnpm check:contract` sigue en verde.
- **Ningún color literal fuera de `themes/*.ts`.** El chrome de la app se pinta con las
  utilidades de superficie del lote 4 (`bg-base-100/200/300`, `text-base-content`,
  `border-base-300`). Los únicos hex del diff están dentro del bloque
  `@plugin "@ownui/tw-theme/theme"` de `styles.css`, que **es** una declaración de tokens.
- **La verificación de empaquetado no vale desde el monorepo** (protocolo §4). La app resuelve
  a `dist/` por el symlink de pnpm: detecta regresiones tipo L1 pero **no** sustituye al
  `npm pack` de un consumidor externo. Ver **G-01**.

### Criterios de aceptación del lote (del backlog)

| ID  | Criterio                                                                              |
| --- | ------------------------------------------------------------------------------------- |
| AC1 | `pnpm example` arranca y la app renderiza los 3 componentes estilados                  |
| AC2 | El toggle de tema cambia los colores en vivo                                           |
| AC3 | Todo comando del README fue ejecutado y funciona (listarlos en el PR)                  |
| AC4 | `grep -rn "packages/components/" .github/ README.md` → sin resultados                  |
| AC5 | Ningún enlace relativo roto en los `.md` (verificar con un script o a mano, y decirlo) |

---

## 3. Tabla de SLICES

| ID  | Descripción | Criterios | Archivos afectados | Depende de | Estado |
| --- | ----------- | --------- | ------------------ | ---------- | ------ |
| S01 | Paquete `apps/example-app`: `package.json` (privado, deps `workspace:*`), `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx` | AC1 | `apps/example-app/*` | — | HECHO |
| S02 | CSS de entrada de consumo real: `@import "tailwindcss"` + `@plugin "@ownui/tw-theme"` + `@import "@ownui/tw-theme/css"` + tema custom `ownui-dusk` | AC1, AC2 | `apps/example-app/src/styles.css` | S01 | HECHO |
| S03 | Selector de tema (`light` / `dark` / `ownui-dusk`) escribiendo `data-theme` en `<html>` | AC2 | `apps/example-app/src/ThemeSwitcher.tsx` | S02 | HECHO |
| S04 | Showcase de Button: 10 roles × 4 tratamientos, 5 tamaños, `shape`, `width`, `active`, `disabled`, `loading`, iconos, `as="a"` | AC1 | `src/sections/ButtonSection.tsx` | S01 | HECHO |
| S05 | Showcase de Dropdown: 8 variantes, 5 tamaños, 3 `styleVariant`, controlado y no controlado | AC1 | `src/sections/DropdownSection.tsx` | S01 | HECHO |
| S06 | Showcase de Loader: 9 colores, 5 tamaños, `current` dentro de un botón | AC1 | `src/sections/LoaderSection.tsx` | S01 | HECHO |
| S07 | Scripts raíz `example`, `example:build`, `dev`; se retira `example:install` | AC1, AC3 | `package.json` | S01 | HECHO |
| S08 | Verificación real: `example:build` compila y Chromium mide los colores computados en los 3 temas | AC1, AC2 | — (evidencia abajo) | S02–S07 | HECHO |
| S09 | Script `scripts/check-docs-links.mjs` con código de salida 1 | AC5 | `scripts/check-docs-links.mjs` | — | HECHO |
| S10 | Script raíz `pnpm check:docs` + 12 tests sobre árboles temporales | AC5 | `package.json`, `scripts/__tests__/check-docs-links.test.ts` | S09 | HECHO |
| S11 | `.github/copilot-instructions.md` pasa a ser un puntero a `AGENTS.md` | AC4 | `.github/copilot-instructions.md` | — | HECHO |
| S12 | `applyTo` y rutas de `.github/instructions/*` apuntan a `packages/ui/src/`; se sustituye el pipeline `build:components` inexistente por el real | AC4 | `.github/instructions/*.instructions.md` | — | HECHO |
| S13 | `packages/tw-theme/e2e/README.md` sin los 7 enlaces muertos y con cifras medidas | AC5 | `packages/tw-theme/e2e/README.md` | S09 | HECHO |
| S14 | `@docs/my-project-structure.md` archivado en `@docs/salvage/` con advertencia | AC5 | `@docs/salvage/` | S09 | HECHO |
| S15 | `TESTING.md`: `testMatch` real, tercer proyecto de Jest y cifras verificadas | AC3, AC4 | `TESTING.md` | — | HECHO |
| S16 | README comando a comando, reescrito | AC3 | `README.md` | S07, S08 | HECHO |
| S17 | `pnpm format` deja de ser un no-op | AC3 | `package.json` | S07 | HECHO |
| S18 | `AGENTS.md` al día: `apps/` existe, scripts nuevos en §6.1, §9.9 cerrada, regla 8 reescrita | — | `AGENTS.md` | S16 | HECHO |
| S19 | Changeset con el impacto de versión | — | `.changeset/lote-9-example-app-y-docs.md` | S18 | HECHO |
| S20 | **(añadido)** Storybook importa el CSS de componentes publicado | AC3 | `packages/storybook/.storybook/styles/tailwind.css` | S16 | HECHO |
| S21 | **(añadido)** `pnpm storybook` arranca en un entorno sin navegador | AC3 | `packages/storybook/package.json` | S16 | HECHO |

S20 y S21 no estaban en el plan de la Fase 0: salieron de ejecutar `pnpm storybook` durante la
revisión comando a comando del README (S16). Justificación de incluirlos en el lote en **D-05**.

---

## 4. Tabla de TASKS

| ID  | Slices | Predecesora | Modo + justificación | Commit | Estado |
| --- | ------ | ----------- | -------------------- | ------ | ------ |
| T1 | S01–S08 | — | SECUENCIAL. Es la primera. | `e3e8f2a` | HECHO |
| T2 | S09, S10 | T1 | SECUENCIAL: comparte `package.json` raíz con S07 (T1). | `05035e0` | HECHO |
| T3 | S11–S15 | T2 | SECUENCIAL: su verificación es el checker que construye T2, y el test de regresión sobre el árbol real sólo puede pasar una vez arreglados los enlaces. | `2b55d32` | HECHO |
| T4 | S16–S21 | T3 | SECUENCIAL: el README y `AGENTS.md` describen el resultado de T1 y T3. | `2f5b517` | HECHO |

**Análisis de paralelismo (exigido por el prompt).** T1 (`apps/**`, `package.json`) y T3
(`.github/**`, `@docs/**`, `TESTING.md`) son **disjuntas en archivos**: era el único par
paralelizable del lote. Se ejecutaron en secuencial; razón en **D-02**.

---

## 5. Checklist de criterios de aceptación

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| **AC1** — `pnpm example` arranca y la app renderiza los 3 componentes estilados | **CUMPLIDO** | Commit `e3e8f2a`. `pnpm example` → `turbo build` de las 6 dependencias (FULL TURBO) + `VITE v5.4.19 ready in 348 ms` en `http://localhost:5173/` (HTTP 200). Medido en Chromium sobre el servidor de desarrollo: **86 `.btn`, 18 `.dropdown`, 18 `.dropdown-trigger` y 19 `.loader`** en el DOM, y **estilados**: `.btn-primary` con `background-color: rgb(59,130,246)` (= `--color-primary` `#3b82f6`), `color: rgb(255,255,255)`, `height: 40px` (= `--size-field × 10`), `border-radius: 6px`. **0 errores de consola.** `pnpm example:build` → `tsc --noEmit` limpio + `vite build` con `index.css` de 26.03 kB que contiene `.btn{`, `.btn-primary`, `.dropdown-menu`, `.loader`, `.bg-base-200` y `.border-base-300`. `pnpm dev` (alias) → HTTP 200. Teclado del Dropdown verificado de paso: `Enter` abre (`aria-expanded="true"`, menú `visibility: visible`, `position: absolute`, sombra en `oklab`), `ArrowDown` enfoca el primer `role="menuitem"` ("Manzana") y `Esc` cierra devolviendo el foco al trigger. |
| **AC2** — El toggle de tema cambia los colores en vivo | **CUMPLIDO** | Commit `e3e8f2a`. Clic real sobre el botón "dark" del selector, no manipulación por JS: `body` pasa de `rgb(255,255,255)` a `rgb(29,35,42)` y `<html data-theme>` queda en `"dark"`. Los tres temas dan tres paletas distintas medidas con `getComputedStyle`: light `btn-primary` `rgb(59,130,246)` sobre `rgb(255,255,255)`; dark `rgb(96,165,250)` sobre `rgb(29,35,42)`; `ownui-dusk` (tema propio declarado en CSS) `rgb(124,156,255)` sobre `rgb(27,31,42)`. El CSS compilado contiene los tres selectores `[data-theme=light|dark|ownui-dusk]`. Capturas de los tres temas tomadas a página completa. |
| **AC3** — Todo comando del README fue ejecutado y funciona | **CUMPLIDO** | Commit `2f5b517`. Tabla comando a comando en §5.1. 19 comandos ejecutados con código 0; 2 no ejecutables aquí y marcados como tales en el propio README (`pnpm changeset` es interactivo, `pnpm version`/`pnpm release` los ejecuta el workflow de release y el prompt prohíbe publicar). `pnpm check:contrast` sale con 1 **a propósito** y el README lo dice. Dos comandos documentados **no funcionaban** y se arreglaron: `pnpm format` (glob `src/**` que no casaba con ningún archivo) y `pnpm storybook` (`spawn xdg-open ENOENT` fatal sin navegador). |
| **AC4** — `grep -rn "packages/components/" .github/ README.md` → sin resultados | **CUMPLIDO** | Commits `2b55d32` y `2f5b517`. El grep del criterio sale vacío; también sale vacío ampliado a `TESTING.md`. Se evitó la trampa de dejar la ruta en una frase explicativa: donde hay que nombrar el error, se describe ("un directorio `components/` colgando de `packages/`") en vez de escribir el literal. |
| **AC5** — Ningún enlace relativo roto en los `.md` | **CUMPLIDO** | Commits `05035e0` (script) y `2b55d32` (arreglos). **Verificado con un script**, no a mano: `pnpm check:docs` → `25 archivos .md · 25 enlaces relativos comprobados · ✓ ningún enlace relativo roto`. Partía de **10 rotos** (los 7 de `e2e/README.md` que documentaba §9.9, más `CONTRIBUTING.md` desde el README de `tw-theme` y dos más). 12 tests del checker, incluido uno que fija el árbol real para que no vuelvan. Exclusión documentada: `@docs/salvage/`, archivo histórico transcrito verbatim (ver **D-04**). |

### 5.1 Comandos del README, uno a uno

| Comando | Resultado |
| --- | --- |
| `pnpm install` | ✅ exit 0 · 9 proyectos del workspace |
| `pnpm build` | ✅ exit 0 · 6/6 paquetes, orden topológico |
| `pnpm test` | ✅ exit 0 · **15 suites / 271 tests** |
| `pnpm test:components` | ✅ exit 0 |
| `pnpm test:tw-theme` | ✅ exit 0 |
| `pnpm test:scripts` | ✅ exit 0 |
| `pnpm test:coverage` | ✅ exit 0 |
| `pnpm --filter @ownui/tw-theme e2e` | ✅ exit 0 · **150 passed (19.7 s)** en 9 fixtures |
| `pnpm lint` | ✅ exit 0 · 0 errores, 100 avisos preexistentes de Prettier (**G-02**) |
| `pnpm lint:fix` | ✅ verificado con `eslint . --fix-dry-run`: dejaría 11 avisos de 100. No se ejecutó en escritura porque tocaría 106 archivos fuera del alcance (**G-02**) |
| `pnpm format` | ✅ glob arreglado. El anterior (`src/**`) devolvía "No files matching the pattern"; el nuevo encuentra 106 archivos. Verificado con `--list-different`, sin escribir (**G-02**) |
| `pnpm check:contract` | ✅ exit 0 · las tres capas coinciden en los 3 componentes |
| `pnpm check:docs` | ✅ exit 0 · 25 enlaces, 0 rotos |
| `pnpm check:contrast` | ⚠️ exit **1 a propósito**: 15 pares por debajo de 4.5:1, que son el alcance del lote 22. Documentado así en el README |
| `pnpm create-component <Name>` | ✅ `--help` exit 0; el generador lo cubren los 13 tests del lote 8 |
| `pnpm storybook` | ✅ exit 0 **tras arreglarlo** · HTTP 200 en :6006 en 4 s |
| `pnpm build-storybook` | ✅ exit 0 · `storybook-static/` con el CSS de componentes dentro |
| `pnpm example` | ✅ exit 0 · HTTP 200 en :5173 |
| `pnpm example:build` | ✅ exit 0 · typecheck + build |
| `pnpm dev` | ✅ exit 0 · alias de `example`, HTTP 200 |
| `pnpm changeset` | ⏸️ interactivo: no se puede ejecutar sin TTY. `changeset --help` → exit 0. El changeset del lote se escribió como archivo, que es la forma no interactiva soportada |
| `pnpm version` / `pnpm release` | ⏸️ **no ejecutados a propósito**: versionan y publican. El prompt lo prohíbe y el README ya dice que los ejecuta el workflow |
| `pnpm --filter "@ownui/ui..." build` | ✅ exit 0 |
| `git clone https://github.com/ferbbo/own-ui.git` | ✅ URL corregida (decía `yourusername/own-ui`) |

---

## 6. Decisiones tomadas

### D-01 — El lote es el 9

| Campo | Valor |
| --- | --- |
| Contexto | El prompt programado llegó con `{{N}}` sin sustituir, así que el número de lote no viene dado. |
| Opciones | (a) Terminar pidiendo el número — prohibido por el prompt. (b) Repetir un lote hecho. (c) Deducirlo del estado del repo. |
| Decisión | **(c)**. `origin/develop` tiene mergeados los lotes 0–8 (último merge: PR #35, `4db53f1`), `specs/` contiene `lote-0.md`…`lote-8.md` y no existe rama `claude/lote-9`. El siguiente lote sin empezar es **L9**, que cierra la FASE 2. |
| Razón | Único número que no duplica trabajo ni salta el orden del backlog. |
| Reversibilidad | Alta: rama y spec se renombran si el gate humano quería otro número. |

### D-02 — Las cuatro tasks van en secuencial

| Campo | Valor |
| --- | --- |
| Contexto | El prompt permite paralelizar tasks sin dependencias ni archivos comunes. T1 y T3 cumplían la condición. |
| Opciones | (a) T1 y T3 en worktrees o subagentes paralelos. (b) Todo secuencial. |
| Decisión | **(b)**. |
| Razón | T4 tiene que describir el resultado de T1 **y** de T3 a la vez, y T3 se verifica con el checker de T2: la cadena T2→T3→T4 es real. Delegar la limpieza de documentación a otro contexto cuando el README final la reescribe de forma coherente arriesga dos descripciones distintas del mismo repo, que es justo el defecto que este lote existe para arreglar. |
| Reversibilidad | Total: no deja rastro en el código. |

### D-03 — El build de la app de ejemplo se llama `build:app`, no `build`

| Campo | Valor |
| --- | --- |
| Contexto | `pnpm build` es `turbo build`, que corre el script `build` de **todos** los paquetes del workspace. `release.yml` invoca ese mismo `pnpm build` antes de publicar. |
| Opciones | (a) Llamarlo `build`: la demo entra en CI y en el release. (b) Llamarlo `build:app` y exponerlo por `pnpm example:build`. (c) Filtrar la app en el script raíz. |
| Decisión | **(b)**. |
| Razón | Con (a), que una demo no compile bloquearía la publicación de la librería: acoplamiento caro y sin contrapartida. (c) reintroduciría un `turbo build --filter=...` en el script raíz, que es exactamente el bug que cerró el lote 3. (b) cuesta una línea. El precio es que CI no compila la app; se registra como **G-03**. |
| Reversibilidad | Total: renombrar el script. |

### D-04 — `@docs/salvage/` queda fuera del checker de enlaces

| Campo | Valor |
| --- | --- |
| Contexto | 4 de los 14 enlaces rotos iniciales estaban en `@docs/salvage/tw-theme-README-componentes.md`, material rescatado en el lote 0 y transcrito **verbatim** de una rama descartada. |
| Opciones | (a) Arreglarle los enlaces. (b) Excluir el directorio en el checker, documentando por qué. (c) Borrar el material. |
| Decisión | **(b)**. |
| Razón | (a) convierte un archivo histórico en una copia editada, que es lo único que un archivo histórico no puede ser; su propio README ya avisa de que no es documentación vigente. (c) tira información que el backlog todavía cita como insumo. La exclusión es una constante con comentario en el script, visible y de una línea. |
| Reversibilidad | Alta: quitar la entrada de `SKIP_PATHS`. |

### D-05 — Storybook se arregla dentro de este lote

| Campo | Valor |
| --- | --- |
| Contexto | Ejecutar `pnpm storybook` (comando del README, AC3) reveló dos cosas: que crasheaba sin navegador y que, una vez arrancado, renderizaba **todos** los componentes sin un solo estilo (medido: `.btn` con background transparente, padding 0, radio 0). |
| Opciones | (a) Anotarlo como gap y dejarlo roto. (b) Arreglar sólo el crash. (c) Arreglar las dos cosas. |
| Decisión | **(c)**, acotado a dos archivos de `packages/storybook/`. |
| Razón | El lote es "verdad en la documentación" y el README presenta Storybook como el escaparate visual del repo. Dejarlo roto mientras se escribe esa frase es publicar otra mentira, justo la clase que el lote existe para cerrar. Las dos causas son de configuración, no de diseño: faltaba `@import "@ownui/tw-theme/css"` —el cableado que el lote 1 hizo para el consumidor publicado y nunca aquí— y corría la "opción 2" (`themes: false`) con el único tema registrado bajo `--prefersdark`, así que en claro no había ningún tema activo. El coste es de dos líneas efectivas; el beneficio, que el escaparate muestre algo. |
| Reversibilidad | Total: las tres formas de configurar el plugin siguen en el archivo, la 2 comentada; revertir es descomentar. |

### D-06 — `pnpm format` se arregla, pero no se ejecuta sobre el repo

| Campo | Valor |
| --- | --- |
| Contexto | El glob del script (`src/**`) no casa con ningún archivo de este monorepo: el comando salía en verde sin formatear nada. Con el glob correcto, 106 archivos difieren del estilo de Prettier. |
| Opciones | (a) Dejar el glob roto. (b) Arreglarlo y ejecutarlo. (c) Arreglarlo y no ejecutarlo. |
| Decisión | **(c)**. |
| Razón | (a) mantiene la mentira. (b) produce un diff de 106 archivos de puro formato, mezclado con un lote de documentación, y toca componentes terminados —lo que el prompt prohíbe salvo que un test lo exija—. (c) deja el comando honesto y el formateo masivo como un PR propio, que es donde se revisa bien. Registrado como **G-02** con el comando exacto. |
| Reversibilidad | Total. |

---

## 7. Bloqueantes

**Ninguno.** Ninguna task quedó bloqueada; los 5 criterios se cumplen.

Una fricción de entorno, resuelta y sin huella en el repo: el Chromium preinstalado del
contenedor es la build 1243 y el Playwright del repo esperaba la 1200, así que la suite e2e no
arrancaba. Se resolvió con dos symlinks **en el contenedor** (`/opt/pw-browsers/`), no tocando
la configuración de Playwright: en CI los navegadores los instala
`playwright install --with-deps chromium` y el problema no existe.

---

## 8. Preguntas abiertas, objeciones y gaps

### G-01 — La app de ejemplo no sustituye a un `npm pack`

La app consume los paquetes por `workspace:*`, que pnpm resuelve con un symlink al directorio
del paquete. Eso **sí** respeta `exports` (por eso detecta un `./css` que no se publica), pero
**no** reproduce el `files` del tarball: un archivo que exista en el repo y no se publique
seguiría resolviendo. La verificación de empaquetado sigue siendo la del protocolo de lote:
`npm pack` + instalación en un proyecto limpio fuera del monorepo. Documentado en el README de
la app y en `AGENTS.md` §3.

### G-02 — 100 avisos de Prettier preexistentes

`pnpm lint` sale con 0 errores y 100 avisos, 89 de ellos de `prettier/prettier`, casi todos en
`packages/utils/dom-utils/`. Fuera del alcance (ver **D-06**). Se cierra con un PR de una línea:

```bash
pnpm format && pnpm lint   # dejaría 11 avisos de 100
```

### G-03 — CI no construye la app de ejemplo

Por **D-03**, `turbo build` no incluye `apps/example-app`, así que su valor como prueba de humo
sólo se cobra en local. Añadir un paso `pnpm example:build` a `ci.yml` lo cerraría, pero tocar
workflows está fuera del alcance de este lote (regla dura del prompt). Lo mismo vale para
`pnpm check:docs`, que es puerta y no corre en CI. **Los dos son candidatos inmediatos a un
lote de CI**, junto con quitar el `continue-on-error: true` del paso de lint, que un comentario
del propio `ci.yml` marca como pendiente desde que cerró el lote 6.

### G-04 — El plugin no tiene flag para "tema sólo por `data-theme`"

`getThemeNameConfig` acepta `--default` (aplica en `:where(:root)` **y** en `[data-theme]`) y
`--prefersdark` (añade el media query). No hay forma de registrar un tema que **sólo** se
aplique con `[data-theme="x"]`, que es lo que quiere un selector de temas. La app de ejemplo lo
rodea escribiendo siempre `data-theme` en `<html>`, porque `[data-theme]` (0,1,0) gana a
`:where(:root)` (0,0,0). Candidato a un flag `--opt-in` en el lote 21.

### G-05 — No hay archivo `LICENSE`

Los 8 `package.json` declaran MIT y el README cerraba con "see the LICENSE file for details",
pero ese archivo no existe. No se crea aquí porque hace falta decidir la línea de copyright
(titular y año), que es una decisión del dueño del repo, no del lote. El README ahora lo dice
explícitamente.

### G-06 — El `dark` por `prefers-color-scheme` y los temas custom compiten

Con un tema custom registrado como `--default`, en un sistema en oscuro el `dark` built-in
—que aplica en `:root` (0,1,0) dentro del media query— gana al tema custom (`:where(:root)`,
0,0,0). No es un bug, pero sí una interacción que nadie documenta y que sorprende. Encaja en el
lote 21.

### Objeción al alcance del lote

El backlog pedía "reescribir las rutas de `copilot-instructions.md` **o** reemplazarlo por un
puntero a `AGENTS.md` (preferible: una sola fuente de verdad)". Se eligió el puntero. La
objeción: `.github/instructions/*.instructions.md` siguen siendo una tercera descripción
parcial de la arquitectura, con su propio riesgo de desincronizarse. No se fusionaron en
`AGENTS.md` porque Copilot las consume por su `applyTo`, que es una función que `AGENTS.md` no
cumple. Queda señalado, no resuelto.

---

## 9. Log cronológico

- **Fase 0** — `origin/develop` verificado en `4db53f1`; rama `claude/lote-9` creada desde ella.
  `pnpm install --frozen-lockfile`. Línea base: `pnpm build` 6/6, `pnpm lint` 0 errores /
  100 avisos, `pnpm test` 14 suites / 259 tests. Spec inicial con 19 slices y 4 tasks.
- **T1** (`e3e8f2a`) — `apps/example-app` creada. Primer `tsc` rojo por un `*/` dentro de un
  comentario de bloque (`packages/*/src` cerraba el comentario): corregido. Verificación en
  Chromium contra el servidor de desarrollo y contra el build de producción; se añadió un
  favicon vacío para dejar la consola en 0 errores.
- **T2** (`05035e0`) — `check-docs-links.mjs` + `pnpm check:docs` + 11 tests. Primera pasada
  sobre el repo: 14 enlaces rotos; tras excluir `@docs/salvage/` (**D-04**), 10 reales.
- **T3** (`2b55d32`) — Saneado de `copilot-instructions.md`, las dos guías de
  `.github/instructions/`, `e2e/README.md` (cifras medidas corriendo la suite: 9 fixtures,
  150 tests), `TESTING.md` y el README de `tw-theme`; `my-project-structure.md` archivado.
  12.º test: el árbol real no tiene enlaces rotos.
- **T4** (`2f5b517`) — Ejecución comando a comando del README (§5.1). Dos comandos rotos
  encontrados y arreglados (`pnpm format`, `pnpm storybook`) y Storybook sin estilos
  (**D-05**). README y `AGENTS.md` reescritos en lo que mentían; changeset.
- **Cierre** — `origin/develop` sin movimiento (0 detrás), así que no hubo rebase ni conflictos.
  Suite completa en verde: `lint` 0 errores · `typecheck` 4/4 paquetes · `test` 15 suites /
  271 tests · `build` 6/6 · `check:contract` ✓ · `check:docs` 25/25 ✓ · `example:build` ✓ ·
  `e2e` 150 passed.

---

## 10. Impacto de versión

**patch** para `@ownui/tw-theme` (changeset `lote-9-example-app-y-docs.md`). El lote no cambia
ninguna API ni ningún token: añade documentación ejecutable y verificación. El resto de
paquetes no se tocan, y `@ownui/example-app` es privado, así que no se publica.
