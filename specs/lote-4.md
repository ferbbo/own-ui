# Lote 4 — Escala de superficies `base-100/200/300`

## 1. Meta

| Campo           | Valor                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| Lote            | **L4** — Escala de superficies `base-100/200/300` (`@docs/BUILD-BATCHES.md` §L4) |
| Rama base       | `develop` (en `11bf5a8`; integrado después con `f3526d3`, que trae el lote 3) |
| Rama de trabajo | `claude/lote-4`                                                              |
| Estado general  | **COMPLETO** — 5 tasks, 0 bloqueadas, 5/5 criterios cumplidos                |
| Fecha           | 2026-11-20                                                                   |

> **Nota sobre el número de lote.** El prompt programado llegó por **cuarta** vez con el
> marcador `{{N}}` sin sustituir. Se resuelve a **N = 4**. Registrado como **D-01**.

> **✅ Entregado.** El bloqueante crítico de entrega (**B-01**: la sesión que ejecutó el lote no
> tenía acceso de escritura) está **resuelto**: la rama se publicó y el PR es
> [#31 → `develop`](https://github.com/ferbbo/own-ui/pull/31), con **CI en verde**.
>
> El 2026-11-20 se integró `develop` en la rama (merge `6ae2b79`) después de que el lote 3 se
> mergeara: sin conflictos, aunque hubo que reconciliar dos pasajes de `AGENTS.md` que el merge
> dejó contradiciéndose. Detalle en §5, «Integración efectiva».
>
> ⚠️ Queda un **PR #30 de esta misma rama hacia `main`** que hay que cerrar sin mergear: el
> modelo de ramas lo prohíbe. Ver gap **G-07**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt (igual que en los lotes 0–3):

- **Slice** = unidad mínima verificable y testeable por sí sola, con criterios de aceptación
  propios.
- **Task** = agrupación de slices cohesivos (mismo módulo, archivos compartidos o criterios
  acoplados). **Una task = un commit.**

Reglas de oro de `@docs/BUILD-BATCHES.md` que condicionan este lote en particular:

- **El contrato manda.** Todo token `--color-base-*` que el CSS referencie tiene que existir
  en `light.ts` **y** en `dark.ts`. Este lote convierte esa regla en un test automático (S08).
- **Ningún color literal fuera de `themes/*.ts`.** Por eso **no** se añaden fallbacks hex en
  `dropdown.css` ni en `button.css`, aunque sería la vía rápida para que el fondo resuelva.
- **Cambio en el plugin ⇒ fixture e2e.** Las utilidades nuevas y la escala por tema se
  verifican sobre CSS compilado en Chromium (S09/S10), no leyendo archivos.

### Criterios de aceptación del lote (del backlog)

| ID  | Criterio                                                                                           |
| --- | -------------------------------------------------------------------------------------------------- |
| AC1 | `grep -rn "color-base-" packages/tw-theme/src/css/` — todo token referenciado existe en `light.ts` **y** `dark.ts` |
| AC2 | Fixture e2e: `.bg-base-100` resuelve a blanco en light y a oscuro con `data-theme="dark"`           |
| AC3 | Un `.dropdown` renderizado tiene `background-color` ≠ `rgba(0,0,0,0)`                              |
| AC4 | Un `.btn` sin variante es legible en ambos temas (fondo claro + texto oscuro en light)             |
| AC5 | Documentada la escala en `AGENTS.md` §4.2                                                          |

---

## 3. Tabla de SLICES

| ID  | Descripción                                                                                   | Criterios | Archivos afectados                                   | Depende de | Estado |
| --- | --------------------------------------------------------------------------------------------- | --------- | ---------------------------------------------------- | ---------- | ------ |
| S01 | `--color-base-100/200/300/-content` en el tema light, con los valores de la ficha             | AC1, AC2, AC4 | `src/themes/light.ts`                            | —          | HECHO |
| S02 | Los mismos cuatro tokens en el tema dark                                                      | AC1, AC2, AC4 | `src/themes/dark.ts`                             | —          | HECHO |
| S03 | `rootColors.ts` retirado (ya no queda color invariante) y `themes/index.ts` simplificado       | AC1       | `src/themes/rootColors.ts` (borrado), `src/themes/index.ts` | S01, S02 | HECHO |
| S04 | Los comentarios de `button.css` dejan de afirmar que los `--color-base-*` viven en `rootColors.ts` | —     | `src/css/button.css`                                 | S03        | HECHO |
| S05 | Tipo `SurfaceColorName` / `SurfaceColorToken` en `types.ts`                                   | AC1       | `src/types.ts`                                       | —          | HECHO |
| S06 | `surfaceColorNames` + utilidades de superficie (`bg`/`text`/`border`/`divide`, sin `-content`/`-focus`) | AC2 | `src/utilities/colors.ts`                      | S05        | HECHO |
| S07 | Test unitario de las utilidades de superficie (y de que **no** emiten `-content`/`-focus`)    | AC2       | `src/utilities/__tests__/colors.test.ts` (nuevo)     | S06        | HECHO |
| S08 | Test unitario de contrato: todo `--color-base-*` referenciado en `src/css/` existe en light y dark, y el par superficie/`-content` pasa WCAG AA | AC1, AC4 | `src/__tests__/surfaces.test.ts` (nuevo) | S03 | HECHO |
| S09 | Fixture e2e `base-surfaces/` (superficies, `.dropdown`, `.btn` sin variante, light y dark)    | AC2, AC3, AC4 | `e2e/fixtures/base-surfaces/*`                   | S03, S06   | HECHO |
| S10 | Spec e2e que mide los estilos computados del fixture en Chromium                              | AC2, AC3, AC4 | `e2e/tests/base-surfaces.spec.ts`                | S09        | HECHO |
| S11 | `AGENTS.md` §4.2 reescrita + §4.3/§4.4/§4.5 y §9.6 al día                                     | AC5       | `AGENTS.md`                                          | S03, S06   | HECHO |
| S12 | Changeset con el impacto de versión y el cambio observable                                    | —         | `.changeset/lote-4-*.md`                             | S01–S11    | HECHO |

---

## 4. Tabla de TASKS

| ID  | Slices           | Predecesora | Modo + justificación                                                                                                                                                   | Commit | Estado |
| --- | ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| T1  | S01, S02, S03, S04 | —         | **SECUENCIAL** (es la base del lote). Los cuatro slices comparten el contrato de tokens y `themes/index.ts`: separarlos dejaría commits intermedios con el token definido en dos sitios a la vez. | `3e29c85` | HECHO |
| T2  | S05, S06         | T1          | **SECUENCIAL.** No comparte archivos con T1, pero sí dependencia semántica: una utilidad `.bg-base-100` que apunte a un token aún inexistente es exactamente el bug que el lote arregla. Ante dependencia o duda, secuencial. | `8ffd63e` | HECHO |
| T3  | S07, S08         | T1, T2      | **SECUENCIAL.** Los tests leen el resultado de T1 y T2; no tiene sentido escribirlos contra un estado que todavía no existe.                                            | `8481876` | HECHO |
| T4  | S09, S10         | T1, T2      | **SECUENCIAL por decisión** (ver **D-08**). Es la única task del lote que **podría** ir en PARALELO con T3: no comparte ningún archivo con ella y ambas dependen sólo de T1+T2. | `fffd088` | HECHO |
| T5  | S11, S12         | T1–T4       | **SECUENCIAL.** La documentación y el changeset describen el resultado verificado, así que van al final por definición.                                                  | `d404f79` | HECHO |

### Mapa de dependencias

```
T1 (tokens por tema)  ──┬──> T2 (utilidades) ──┬──> T3 (tests unitarios) ──┐
                        │                      │                          ├──> T5 (docs + changeset)
                        └──────────────────────┴──> T4 (fixture + spec e2e)┘
```

Dependencias por archivo (ninguna pareja de tasks comparte archivo salvo T1 consigo misma):

- `themes/light.ts`, `themes/dark.ts`, `themes/rootColors.ts`, `themes/index.ts`, `css/button.css` → sólo T1
- `types.ts`, `utilities/colors.ts` → sólo T2
- `src/**/__tests__/*` → sólo T3
- `e2e/**` → sólo T4
- `AGENTS.md`, `.changeset/*` → sólo T5

Dependencias semánticas (las que fuerzan el orden aunque no haya archivo común): T2 referencia
tokens que crea T1; T3 y T4 afirman sobre lo que producen T1 y T2; T5 documenta lo verificado.

---

## 5. Checklist de criterios de aceptación

Todos verificados contra evidencia real (ejecución, no lectura de archivos).

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| AC1 | ✅ **CUMPLIDO** | `grep -rhoE "\-\-color-base-[a-z0-9]+" packages/tw-theme/src/css/` devuelve `base-100`, `base-200`, `base-content`; los tres (y además `base-300`) están en `light.ts` y `dark.ts`. Fijado como gate automático en `src/__tests__/surfaces.test.ts`, que **extrae** las referencias del CSS en vez de comparar contra una lista a mano. Commits `3e29c85` + `8481876`. **Verificado por mutación:** sustituyendo `--color-base-100` por `--color-base-999` en `dropdown.css`, la suite falla nombrando el archivo (`--color-base-999 (usado en [ 'dropdown.css' ])`). |
| AC2 | ✅ **CUMPLIDO** | Fixture `e2e/fixtures/base-surfaces/` + `e2e/tests/base-surfaces.spec.ts`. `.bg-base-100` computa `rgb(255, 255, 255)` en light y `rgb(29, 35, 42)` bajo `data-theme="dark"`; se comprueban igual `200`, `300`, `text-base-content`, `border-base-300` y `divide-base-300`. Commits `8ffd63e` (utilidades) + `fffd088` (fixture). CSS compilado comprobado: `grep "--color-base-" e2e/dist/base-surfaces/output.css` lista los 4 tokens por duplicado, un juego por tema. |
| AC3 | ✅ **CUMPLIDO** | `base-surfaces.spec.ts` › AC-3: el `#dropdown` computa `background-color: rgb(255, 255, 255)` (antes `rgba(0, 0, 0, 0)`), y `rgb(29, 35, 42)` en dark. Incluye el `.dropdown-item` y su contraste. Commits `3e29c85` + `fffd088`. |
| AC4 | ✅ **CUMPLIDO** | Doble evidencia. (1) e2e: un `.btn` **sin variante** computa `rgb(242, 242, 242)` de fondo y `rgb(31, 41, 55)` de texto en light (fondo claro + texto oscuro, el criterio literal), y lo inverso en dark; más una aserción explícita de que ya no es `rgb(0, 0, 0)`. (2) unitario: contraste WCAG 2.1 AA ≥ 4.5:1 de las 3 superficies contra `base-content` en los dos temas. Commits `8481876` + `fffd088`. |
| AC5 | ✅ **CUMPLIDO** | `AGENTS.md` §4.2 reescrita como «Escala de superficies — `src/themes/light.ts` y `dark.ts`» con la tabla de los 4 tokens × 2 temas, los 3 consumidores, la explicación del fallo (IACVT) y la consecuencia de `themes: false`. Al día también §3, §4.4, §4.5 (120 → 136 utilidades), §9.6 (deuda cerrada), §10 y §11.3. Commit `d404f79`. |

### Verificación final de la rama (tras rebase sobre `develop`)

| Verificación | Partida (`develop` = `11bf5a8`) | Final (`d404f79`) | Veredicto |
| --- | --- | --- | --- |
| `pnpm test` | 8 suites / 89 tests ✅ | **10 suites / 122 tests ✅** | +2 suites, +33 tests |
| `pnpm test:tw-theme` | 35 tests | **68 tests** | +33 |
| `npx tsc --noEmit` (tw-theme) | limpio | **limpio** | ✅ |
| `pnpm build` | ok | **ok** (1 task, tsup + DTS) | ✅ |
| `pnpm e2e` (Chromium) | 98 passed ✅ | **116 passed ✅** | +18 |
| `pnpm lint` | ❌ 288 problemas (5 errores, 283 warnings) | ❌ **288 problemas (5 errores, 283 warnings)** | **idéntico: el lote no añade ni uno** (B-02) |
| `eslint` sobre los 11 archivos del lote | — | **exit 0, limpio** | ✅ |

> El único criterio que no pasa a nivel repo es `pnpm lint`, y falla **exactamente igual que
> antes del lote**: los 5 errores son de `jest.setup.js` y de stories de componentes, archivos
> que este lote no toca. Ver **B-02** y **G-01**.

### Integración con `develop` y con el lote 3

- `git rebase origin/develop` → «Current branch is up to date»: `develop` no se movió
  (`11bf5a8`), 0 behind / 5 ahead. **Sin conflictos que resolver.**
- Comprobado además contra el lote 3, que entonces seguía pendiente de merge:
  `git merge-tree --write-tree origin/claude/lote-3 HEAD` → **0 conflictos**. El único archivo
  que las dos ramas tocan es `AGENTS.md`, y en secciones distintas (L3 en §6/§9.3, L4 en
  §4.2/§4.5/§9.6). Corrige lo que decía **D-02**: la intersección de archivos no es vacía, es
  `AGENTS.md`, pero se mezcla limpiamente.

#### Integración efectiva (2026-11-20, tras mergearse el lote 3)

El lote 3 se mergeó en `develop` (PR #29 → `f3526d3`) mientras este PR estaba abierto, dejando
la rama **11 commits por detrás**. Se integró con `git merge origin/develop` —no rebase, para
no reescribir la historia de una rama ya publicada— en el commit de merge `6ae2b79`.

- **Sin conflictos.** `AGENTS.md` se auto-fusionó, como predecía la comprobación previa.
- **Pero el merge limpio dejó el documento contradiciéndose**, que es lo que un `merge-tree`
  no puede ver: el lote 4 había documentado el bug de CI (*«`ci.yml` se dispara sólo en PRs
  hacia `main`», «las PRs de lote no ejecutan CI»*) y el *«queda pendiente la parte de CI»* de
  §9.2, y el lote 3 **ya los había arreglado**. Se reconcilian los dos bloques y se actualizan
  las cifras de la suite (§6.1 y §9.2: 8 suites/89 tests → **10/122**; e2e ~88 → **116**).
- **Las cifras de lint cambian a mejor**: el baseline de `develop` pasó de 5 errores a **4**,
  porque el lote 3 arregló el de `jest.setup.js`. Los 4 que quedan siguen siendo los de
  `Dropdown.stories.tsx` (alcance del lote 6), ninguno de este lote. **B-02 sigue en pie.**
- **Los changesets de los dos lotes conviven bien.** `changeset status` sobre el merge:
  `@ownui/tw-theme` **minor** (1.0.1 → **1.1.0**, con la 1.0.1 que el lote 3 adoptó del
  registro como base) y los otros cinco **patch** → 1.0.1, su primera publicación. **0 major**,
  que era el riesgo que el lote 3 cerró al retirar el changeset rancio.

**Suite completa sobre el merge** (`6ae2b79`), en limpio:

| | Resultado |
|---|---|
| `pnpm build` | **6/6 paquetes** |
| `pnpm test` | **10 suites / 122 tests** |
| `pnpm e2e` (Chromium) | **116 passed** |
| `pnpm lint` | 4 errores / 283 warnings — baseline de `develop`, sin aportar ninguno |
| **CI en el PR #31** | **verde**, los 12 pasos ejecutados (run 44732736065) |

---

## 6. Decisiones tomadas

### D-01 — El lote es el 4

- **Contexto.** El prompt programado llegó con `{{N}}` literal, sin sustituir, por cuarta vez
  consecutiva (los lotes 1, 2 y 3 registraron la misma incidencia).
- **Opciones.** (a) Abortar y preguntar — descartada: el prompt prohíbe preguntar. (b) Inferir
  el lote del estado del repo.
- **Decisión.** N = 4. `specs/lote-0.md`, `-1` y `-2` están en `develop`; `claude/lote-3` está
  **completo** (4 commits, spec cerrada, 5/5 criterios) y pendiente de merge. El siguiente lote
  del backlog es **L4**.
- **Razón.** Es la única lectura compatible con el backlog y con lo ya entregado.
- **Reversibilidad.** Total: la rama y la spec se renombran si el dueño quería otro lote.

### D-02 — Base `develop`, aunque `claude/lote-3` no esté mergeado

- **Contexto.** El modelo de ramas obliga a partir de la última `develop`. Pero `develop` no
  incluye todavía el lote 3, y `@docs/BUILD-BATCHES.md` dice que la FASE 1 (L4–L7) se abre
  **tras** cerrar L1–L3.
- **Opciones.** (a) Partir de `claude/lote-3` para tener la FASE 0 completa — viola el modelo de
  ramas y encadena este PR al de L3. (b) Partir de `develop` y comprobar que no hay solape.
- **Decisión.** (b). L3 toca exclusivamente el grafo de build, manifiestos y release
  (`turbo.json`, `package.json`, `.releaserc`, `.gitignore`); L4 toca temas, utilidades, CSS,
  tests y `AGENTS.md`. **Intersección de archivos: `packages/tw-theme/package.json` (L3) vs.
  ninguno de L4 ⇒ vacía.**
- **Razón.** Respeta el modelo de ramas y mantiene los dos PRs revisables por separado.
- **Reversibilidad.** Alta: si L3 se mergea antes, un rebase de este lote no debería dar
  conflicto (verificado en la fase final).

### D-03 — `rootColors.ts` se borra en vez de quedarse vacío

- **Contexto.** La ficha permite «dejar sólo lo verdaderamente invariante (o vaciarlo y
  simplificar `themes/index.ts`)». Tras mover los 4 tokens a los temas, no queda **ningún**
  color invariante: la geometría ya vive en `root.ts`.
- **Opciones.** (a) Dejar el archivo con un objeto vacío y un comentario. (b) Borrarlo y
  simplificar `themes/index.ts` a `root: { ...rootTheme }`.
- **Decisión.** (b).
- **Razón.** Un archivo que exporta `{}` es deuda: invita a volver a meter colores globales, que
  es justo el defecto que este lote corrige. No está exportado en `index.ts` del paquete, así
  que no es API pública: nadie fuera del paquete puede importarlo.
- **Reversibilidad.** Total (git).

### D-04 — Las utilidades de superficie emiten 4 prefijos, no 5

- **Contexto.** Los colores semánticos generan 5 prefijos (`bg`/`text`/`border`/`ring`/`divide`).
  La ficha de L4 pide para las superficies «sólo `bg`/`text`/`border`/`divide`».
- **Opciones.** (a) Seguir la ficha (4 prefijos). (b) Añadir también `ring-base-*` por simetría.
- **Decisión.** (a), literal.
- **Razón.** La ficha es la fuente de verdad del alcance y un anillo de foco del color de la
  superficie es, de hecho, un antipatrón de a11y (el foco debe contrastar con la superficie, no
  igualarla). Queda como pregunta abierta **P-01** por si el dueño quiere la simetría.
- **Reversibilidad.** Total: añadir `ring` es una línea.

### D-05 — `base-content` entra en la lista de superficies

- **Contexto.** `--color-base-content` no es una superficie, es el texto **sobre** la superficie,
  pero la tabla de la ficha lo lista con los otros tres.
- **Opciones.** (a) Lista única de 4 tokens. (b) Dos listas (3 superficies + 1 token de texto)
  para no emitir `.bg-base-content`.
- **Decisión.** (a).
- **Razón.** Coste/beneficio: (b) añade una segunda lista y una segunda rama en el generador
  para evitar **una** clase rara pero inofensiva (`.bg-base-content`, que además es legítima
  para invertir una superficie). `.text-base-content` es la utilidad más usada de las cuatro y
  tiene que existir.
- **Reversibilidad.** Alta.

### D-06 — Sin fallbacks hex en el CSS de componente

- **Contexto.** `dropdown.css` resuelve a `transparent` porque `--color-base-100` no existe. El
  arreglo rápido sería `var(--color-base-100, #fff)`.
- **Decisión.** No se añade ningún literal. Se arregla el token, no el consumidor.
- **Razón.** Regla de oro: «Ningún color literal fuera de `themes/*.ts`». Un fallback hex
  además enmascararía el mismo bug la próxima vez.
- **Reversibilidad.** N/A.

### D-07 — Las superficies son dependientes del tema, con una consecuencia asumida

- **Contexto.** Al moverse de `:root` (siempre inyectado) a los temas, los tokens de superficie
  **desaparecen** cuando el consumidor usa `@plugin "@ownui/tw-theme" { themes: false }`.
  Antes, `base-200` y `base-content` existían siempre.
- **Opciones.** (a) Duplicar las superficies en `root.ts` como red de seguridad — reintroduce el
  bug de colores fijos negro/blanco y gana en especificidad a `:where(:root)`. (b) Aceptar que
  con `themes: false` el consumidor define sus propias superficies en su tema custom.
- **Decisión.** (b), documentada en `AGENTS.md` §4.2 y en el changeset.
- **Razón.** Es el contrato que ya rige para los 8 colores semánticos: con `themes: false` no
  hay `--color-primary` tampoco. Hacer una excepción con las superficies es la incoherencia que
  produjo el bug. (a) es además técnicamente peor: `:root` (0,1,0) vence a `:where(:root)` (0,0,0),
  así que el "fallback" ganaría al tema.
- **Reversibilidad.** Alta.
- **Verificado.** El spec `no-default-themes.spec.ts` no afirma nada sobre `--color-base-*` (su
  test de "rootColors" mide `--radius-field`, que viene de `root.ts` y sigue en `:root`), así
  que esta decisión no rompe la suite existente.

### D-08 — T4 se ejecuta SECUENCIAL aunque podría ir en paralelo

- **Contexto.** T3 (tests unitarios) y T4 (fixture + spec e2e) no comparten archivos y ambas
  dependen sólo de T1+T2: cumplen la condición de PARALELO del prompt.
- **Opciones.** (a) Paralelizar con subagentes/worktrees. (b) Secuencial.
- **Decisión.** (b).
- **Razón.** Coste/beneficio negativo: son dos tasks de ~1 archivo y medio cada una, y un
  subagente necesitaría que le trasladara el contrato completo de tokens para no inventarse
  valores. El riesgo de integración (dos definiciones distintas de los mismos valores
  esperados) supera el ahorro de minutos. El paralelismo se reserva para lotes con componentes
  independientes de verdad (FASE 3).
- **Reversibilidad.** N/A (decisión de proceso).

### D-09 — El contraste se verifica en el test unitario, no extendiendo `check-contrast.mjs`

- **Contexto.** AC4 pide legibilidad. `scripts/check-contrast.mjs` (entregable del lote 22 que
  ya existe) audita las 8 familias semánticas, pero **no** las superficies.
- **Opciones.** (a) Extender el script con una sección de superficies. (b) Calcular el ratio en
  el test unitario del lote.
- **Decisión.** (b).
- **Razón.** El script es el entregable del lote 22 y la regla dura es no salirse del alcance.
  (b) además deja el criterio como gate permanente en `pnpm test`, no en un script que hay que
  acordarse de correr. Coste: ~15 líneas de matemática WCAG duplicadas → anotado en **G-02**
  para que el lote 22 las consolide.
- **Reversibilidad.** Total.

### D-10 — Navegador de Playwright: symlink local, sin tocar el repo

- **Contexto.** El `@playwright/test` del repo pide el build `chromium_headless_shell-1200`; el
  contenedor trae el `-1243` preinstalado. Los 98 tests e2e fallaban con «Executable doesn't
  exist».
- **Opciones.** (a) `npx playwright install` — descarga 150 MB y no arregla nada en el repo.
  (b) Fijar `executablePath` en `e2e/playwright.config.ts` — mete una ruta del contenedor en el
  repo y rompe la máquina del dueño. (c) Symlink `chromium_headless_shell-1200 → -1243` en el
  contenedor.
- **Decisión.** (c). **Cero cambios en el repositorio.**
- **Razón.** Es un desajuste del entorno, no del proyecto. En la máquina del dueño y en CI
  `pnpm e2e` funciona sin esto.
- **Advertencia honesta.** La evidencia e2e de este lote se obtuvo con Chromium build **1243**,
  no 1200. Para aserciones de `getComputedStyle` sobre colores y tamaños la diferencia es
  irrelevante, pero queda dicho.

---

## 7. Bloqueantes

### ✅ B-01 — RESUELTO: sin acceso de escritura al repositorio (no hubo push ni PR)

> **Cerrado el 2026-11-20.** La rama se publicó y el PR existe: **#31 → `develop`**
> (https://github.com/ferbbo/own-ui/pull/31), con CI en verde. El bloqueante era del entorno de
> aquella sesión, no del lote. Lo que sigue describe el síntoma tal como se vivió.
>
> ⚠️ Quedó además un **PR #30 de la misma rama hacia `main`**, que el modelo de ramas prohíbe
> (`main` es sólo release). Hay que cerrarlo: ver «Gaps».

- **Síntoma.** Cualquier `git push` (incluido `--dry-run`) devuelve:
  `remote: access denied by the git proxy: ferbbo/own-ui is not in this session's authorized`
  `repository set, so the proxy will not inject a credential for it.` → HTTP 403.
  La API REST de GitHub responde: `GitHub access to this repository is not enabled for this`
  `session. Use add_repo to request access.`
- **Alcance.** `git clone` y `git fetch` anónimos **sí** funcionan (repo público), así que el
  lote se pudo ejecutar y verificar entero. Lo que **no** se puede hacer es publicar la rama ni
  abrir el PR, que es el gate humano del lote.
- **Intentos.** (1) `git push --dry-run` a dos ramas distintas → 403 las dos veces.
  (2) `gh repo view`, `gh pr list`, `gh api repos/.../pulls` → 403.
  (3) Búsqueda de la herramienta `add_repo` que sugiere el error → **no está disponible en
  esta sesión**; es una acción del entorno, no del agente.
- **Causa.** Configuración del entorno cloud: el repositorio no está en el conjunto de
  *sources* autorizadas de la sesión. No es algo que el agente pueda cambiar.
- **Qué hace falta (acción del dueño).** Añadir `ferbbo/own-ui` a los *sources* del entorno de
  Claude Code (con acceso de escritura) y volver a lanzar el lote; o aplicar el parche a mano.
- **Entrega alternativa.** La rama `claude/lote-4` queda commiteada en local y se entrega como
  **parche `git format-patch`** aplicable con `git am`.

### 🟠 B-02 — `pnpm lint` ya falla en `develop` (preexistente, fuera de alcance)

- **Síntoma.** 288 problemas: **5 errores** y 283 warnings de `prettier/prettier`.
- **Detalle.** Los 5 errores son ajenos a este lote: 1 `no-require-imports` en `jest.setup.js`
  (raíz) y 4 `react-hooks/rules-of-hooks` en stories de componentes.
- **Decisión.** No se tocan: la regla dura dice no salirse del alcance, y el lote 3 **ya
  arregla** el de `jest.setup.js` (su slice S11). Lo que sí se exige es que **los archivos que
  este lote toca queden limpios**, verificado con `eslint` sobre esa lista concreta.
- **Consecuencia.** El criterio «lint pasa» no puede cumplirse a nivel repo en este lote sin
  invadir otro. Ver **G-01**.

---

## 8. Preguntas abiertas, objeciones y gaps

### Preguntas abiertas

- **P-01.** ¿Las superficies deben generar también `.ring-base-*` por simetría con los colores
  semánticos (D-04)? Mi recomendación: **no**, un anillo de foco del color de la superficie no
  contrasta con la superficie.
- **P-02.** Los valores de la escala (`#f2f2f2` / `#e5e6e6` en light, `#1d232a` / `#191e24` /
  `#15191e` en dark) vienen de la ficha del backlog, que los toma del patrón daisyUI-like. Son
  una **decisión de producto** no ratificada. Cuando entre la paleta de marca (lote 21, P-02 del
  lote 0) habrá que decidir si la escala de superficies también se rediseña.
- **P-03.** `--color-base-content` sirve hoy de texto para las 3 superficies. Con `base-100`
  (`#ffffff`) y `base-300` (`#e5e6e6`) el mismo `#1f2937` pasa AA de sobra, pero si algún día
  `base-300` se oscurece hará falta un `-content` por superficie o un token de texto secundario.

### Objeciones al alcance tal como venía

- **O-01.** La ficha dice «Añadir `base-100/200/300` a `semanticColorNames`… **no**» y propone
  una lista separada. Coincido, y conviene dejar escrito el motivo real: `semanticColorNames` se
  multiplica por `semanticColorVariants`, así que meter las superficies ahí generaría 15 clases
  inexistentes (`.bg-base-100-content`, `.bg-base-100-focus`…) apuntando a tokens que nadie
  define — el mismo defecto que la rama `components` introdujo con los `-focus` (lote 0).

### Gaps (fuera de alcance, para el backlog)

- **G-01.** *(actualizado tras el merge del lote 3)* `pnpm lint` falla en `develop` con
  **4 errores** y 283 warnings de formato. El lote 3 arregló el quinto (`jest.setup.js`) y
  **metió `lint` en CI**, pero con `continue-on-error`: los 4 que quedan son el
  `rules-of-hooks` de `Dropdown.stories.tsx`, alcance del lote 6. Al cerrarlos hay que quitar
  ese flag del workflow para que lint sea puerta de verdad.
- **G-07.** **Hay un PR #30 de `claude/lote-4` hacia `main`**, además del #31 hacia `develop`.
  El modelo de ramas de `AGENTS.md` §6.5 lo prohíbe: `main` es sólo release y nada se mergea
  ahí directamente. Mergearlo metería el lote 4 en `main` **saltándose `develop`** y dejaría a
  las dos ramas divergiendo. Hay que cerrarlo sin mergear — es una acción del dueño, no se hizo
  desde la sesión. (Su CI además falló con el workflow antiguo, antes de que el lote 3 fijara
  el runner.)
- **G-02.** La matemática de contraste WCAG queda duplicada en `scripts/check-contrast.mjs` y en
  `src/__tests__/surfaces.test.ts` (D-09). El lote 22 debería extraerla a un módulo compartido y
  auditar también las superficies.
- **G-03.** `src/plugin.ts` tiene una **clave duplicada** en el objeto `baseStyles`:
  ```ts
  let baseStyles = {
    [root]: { "color-scheme": colorScheme },   // ← se pierde
    [root]: { ...builtInThemes.root },         // ← sobrescribe la anterior
  };
  ```
  La segunda sobrescribe la primera, así que **`color-scheme` nunca se emite** y la opción
  `colorScheme` del plugin no tiene efecto alguno. Es un bug real, ajeno a este lote (no toca
  `--color-base-*`); lo detecté al leer cómo se inyectan los temas. Arreglarlo es una línea,
  pero cambia el CSS emitido y merece su propio test y su propio PR.
- **G-04.** Los tests unitarios de `generateThemeProperties` usan en sus fixtures una escala de
  superficies (`base-100: #ffffff`, `base-200: #f1f5f9`, `base-300: #e2e8f0`) **distinta** de la
  que este lote hace oficial. No es un fallo (son datos de prueba arbitrarios), pero induce a
  error a quien lea los tests buscando los valores reales.

- **G-05.** `npx tsc --noEmit -p packages/tw-theme/tsconfig.test.json` falla con `TS6059`:
  `jest.setup.js` está en su `include` pero fuera del `rootDir` (`./src`). Preexistente y ajeno
  al lote; el typecheck canónico (`tsconfig.json`) está limpio. Arreglo: sacar `jest.setup.js`
  del `include` o subir el `rootDir`.

- **G-06.** `packages/tw-theme/README.md` ya listaba `bg-base-100/200/300/-content` entre las
  utilidades generadas cuando **no existían** (parte de §9.9, «documentación que miente»). Este
  lote las hace reales, así que esa parte del README pasa a ser cierta sin tocarla. Lo que sigue
  desalineado son los valores de ejemplo de sus temas custom (`#f1f5f9`, `#e2e8f0`), distintos
  de la escala oficial: material para el lote 9.

---

## 9. Impacto de versión

**`@ownui/tw-theme`: `minor`.** Changeset en `.changeset/lote-4-superficies.md`.

Razonamiento: el lote **añade** API (4 tokens de superficie completos, 16 utilidades nuevas,
los tipos `SurfaceColorName` y `ColorToken`, `generateSurfaceUtilities()`), que es un `minor`
de libro. Hay tres cambios observables que podrían argumentarse como `major`:

1. `--color-base-200` y `--color-base-content` cambian de valor y de selector.
2. Con `themes: false` desaparecen los tokens de superficie.
3. `src/themes/rootColors.ts` se elimina.

Se clasifican como `minor` y no `major` porque (1) y (2) son la **corrección de un defecto**:
el estado anterior no era un contrato utilizable, era un botón negro en tema claro y un
dropdown sin fondo. Y (3) no era API pública (`rootColors.ts` nunca se exportó desde
`src/index.ts`). Los tres quedan documentados en el changeset bajo «Cambios de comportamiento»
para que el consumidor los lea antes de actualizar.

**No se ejecutó** `npm publish`, ni se crearon tags o releases, ni se tocó la versión a mano.

### Cómo verificarlo en local

```bash
git am < lote-4.patch          # o: git checkout claude/lote-4
pnpm install
pnpm test                      # 10 suites, 122 tests
pnpm build
cd packages/tw-theme && pnpm e2e   # 116 tests en Chromium
```

---

## 10. Log cronológico

| Momento | Hecho |
| ------- | ----- |
| 1 | Entorno: repo clonado por HTTPS anónimo. `git push` y API REST → **403** (B-01). Buscada la herramienta `add_repo`: no existe en esta sesión. |
| 2 | `{{N}}` sin sustituir por 4ª vez → resuelto a N=4 (D-01). `CLAUDE.md` ya existe en `develop` y apunta a `AGENTS.md`: no hace falta crearlo. |
| 3 | Rama `claude/lote-4` creada desde `origin/develop` (`11bf5a8`) (D-02). |
| 4 | Estado de partida medido: test 89/89 ✅, tsc ✅, e2e 98/98 ✅, lint ❌ preexistente (B-02). |
| 5 | Playwright: build 1200 ausente en el contenedor → symlink al 1243 (D-10). |
| 6 | Fase 0 cerrada: 12 slices, 5 tasks, dependencias mapeadas. |
| 7 | **T1** (`3e29c85`): escala a `light.ts`/`dark.ts`, `rootColors.ts` borrado, `themes/index.ts` simplificado, comentarios al día. tsc ✅, 89 tests ✅, AC1 por grep ✅. |
| 8 | **T2** (`8ffd63e`): `surfaceColorNames` + `generateSurfaceUtilities()`, 16 clases. Comprobado en caliente que emite `.bg-base-100` → `var(--color-base-100)`. |
| 9 | **T3** (`8481876`): 33 tests unitarios. Primer intento falló: `import.meta` no funciona en el proyecto `tw-theme` de Jest (declara preset ESM pero ts-jest emite CJS) → la ruta del CSS se resuelve desde `process.cwd()` con dos candidatas. Validado por mutación. |
| 10 | **T4** (`fffd088`): fixture `base-surfaces/` + 18 tests e2e. Primer intento falló 1 test: asumí que `getPropertyValue("--tw-divide-color")` devolvía el texto `var(...)`; al no estar registrada con `@property`, devuelve el token ya sustituido. Corregido comparando contra el token. |
| 11 | **T5** (`d404f79`): `AGENTS.md` §4.2 reescrita, §4.5 a 136 utilidades, §9.6 cerrada, §3/§4.4/§10/§11.3 al día, y changeset `minor`. |
| 12 | Fase final: rebase sobre `develop` (sin cambios, 0 conflictos) y `merge-tree` contra `claude/lote-3` (0 conflictos). Suite completa: 122 unit ✅, tsc ✅, build ✅, 116 e2e ✅, lint idéntico al de partida. |
| 13 | Mensaje de `8481876` enmendado: decía «20 tests nuevos» cuando son 33 (20 + 13). La rama no estaba publicada, así que se corrigió con `rebase --onto` en vez de dejar un dato falso en el historial. |
| 14 | `git push` reintentado: **403** (B-01). Sin push no hay PR. El lote se empaqueta con `git format-patch` y se entrega como adjunto. |
