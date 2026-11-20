# Lote 5 — Button: contrato, loading e iconos

## 1. Meta

| Campo           | Valor                                                                              |
| --------------- | ---------------------------------------------------------------------------------- |
| Lote            | **L5** — Button: contrato, loading e iconos (`@docs/BUILD-BATCHES.md` §L5)         |
| Rama base       | `develop` (en `0afe779`, que ya integra los lotes 0–4)                             |
| Rama de trabajo | `claude/lote-5`                                                                    |
| Estado general  | EN CURSO                                                                           |
| Fecha           | 2026-11-20                                                                         |

> **Nota sobre el número de lote.** El prompt programado llegó por **quinta** vez con el
> marcador `{{N}}` sin sustituir. `develop` ya contiene los lotes 0–4 (el último merge es
> el PR #31, del lote 4) y no existe rama `claude/lote-5`, así que el marcador se resuelve a
> **N = 5**, el siguiente lote del backlog. Registrado como **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt (igual que en los lotes 0–4):

- **Slice** = unidad mínima verificable y testeable por sí sola (un componente, o una
  variante/estado/comportamiento suyo), con criterios de aceptación propios.
- **Task** = agrupación de slices cohesivos (mismo componente o módulo, archivos compartidos o
  criterios acoplados). **Una task = un commit.**

Reglas de oro de `@docs/BUILD-BATCHES.md` que condicionan este lote:

- **El contrato manda.** `variants/button.ts` ⇄ `css/button.css` ⇄ `Button.types.ts` deben decir
  lo mismo. Este lote es, literalmente, el lote de reconciliar esas tres capas; se convierte la
  regla en un **test automático** que cruza el contrato contra el CSS (S05).
- **CSS antes que React.** Por eso el plugin (`variants/*`, `css/*`) se toca primero (T1–T3) y
  el componente después (T4–T6).
- **Cambio en el plugin ⇒ fixture e2e.** La clase nueva `.loader-current` se verifica sobre CSS
  compilado en Chromium (T3), no leyendo el archivo.
- **Tests reales.** Ningún stub; cada criterio se cubre con RTL o Playwright.

### Criterios de aceptación del lote (del backlog §L5)

| ID  | Criterio                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------- |
| AC1 | Test: para cada `variant ∈ {outline, dash, soft}`, el nodo tiene la clase `btn-<variant>`                  |
| AC2 | Test: para los 10 `theme`, clase `btn-<theme>`                                                            |
| AC3 | Test: `loading` ⇒ children siguen en el DOM **y** existe `[role="status"]` **y** `aria-busy="true"`        |
| AC4 | Test: `startIcon`/`endIcon` renderizan el nodo en el orden correcto                                       |
| AC5 | Test: `as="a"` + `href` renderiza `<a href>`; `disabled` no es aceptado por TS en `as="a"` (`@ts-expect-error`) |
| AC6 | `grep -n "button.theme\[variant\]" packages/ui` → sin resultados                                          |
| AC7 | Stories: `AllVariants` muestra diferencia visual real de las 3 variantes                                  |

Criterios adicionales que el lote arrastra por gaps abiertos en lotes previos (ver §5):

| ID  | Criterio                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------- |
| AC8 | **G-03**: ninguna prop de configuración del botón (`loading`, `variant`, `theme`, iconos…) llega al DOM    |
| AC9 | **G-02**: `as="a"` + `href` expone el rol `link`, no `button`                                             |
| AC10 | **G-05**: `useButton` sigue devolviendo `domRef` y el forwarding de ref sigue cubierto por test           |
| AC11 | El spinner del botón hereda tamaño y color del botón (no es siempre `primary`/`md`)                       |

---

## 3. Tabla de SLICES

| ID  | Descripción | Criterios | Archivos afectados | Depende de | Estado |
| --- | ----------- | --------- | ------------------ | ---------- | ------ |
| S01 | `variants/button.ts`: `variant: {outline, dash, soft}` (fuera `solid`, que no existe en CSS, y fuera el `ghost` duplicado) | AC1, AC6 | `packages/tw-theme/src/variants/button.ts` | — | PENDIENTE |
| S02 | `variants/button.ts`: exponer los modificadores de layout que el CSS ya tiene (`btn-square`, `btn-circle`, `btn-wide`, `btn-block`, `btn-active`) | AC1 | `packages/tw-theme/src/variants/button.ts` | S01 | PENDIENTE |
| S03 | Test unitario que cruza **cada clase del contrato** contra `css/button.css` (y el de loader contra `loader.css`) | AC1, AC6 | `packages/tw-theme/src/variants/__tests__/contract.test.ts` (nuevo) | S01, S02 | PENDIENTE |
| S04 | `.loader-current` en `loader.css` (`--loader-color: currentColor`) + entrada `current` en `variants/loader.ts` + tipo `LoaderColor` | AC11 | `packages/tw-theme/src/css/loader.css`, `src/variants/loader.ts`, `packages/ui/src/Loader/src/Loader.types.ts` | — | PENDIENTE |
| S05 | Test de `Loader` con `color="current"` | AC11 | `packages/ui/src/Loader/__test__/Loader.test.tsx` | S04 | PENDIENTE |
| S06 | Fixture e2e de `.loader-current`: el spinner toma el color del contenedor (y dentro de un `.btn-primary` toma `--btn-fg`) | AC11 | `packages/tw-theme/e2e/fixtures/component-styles/index.html`, `e2e/tests/component-styles.spec.ts` | S04 | PENDIENTE |
| S07 | `ButtonVariant` sin `solid`; `startIcon`/`endIcon` retipados a `ReactNode`; `icon` como botón icon-only con `aria-label` obligatorio; props `shape`/`width`/`active` | AC1, AC4 | `packages/ui/src/Button/src/Button.types.ts` | S01, S02 | PENDIENTE |
| S08 | `useButton`: `button.variant[variant]` (no `button.theme[variant]`), modificadores de layout, y **ninguna prop de configuración al DOM** | AC1, AC6, AC8, AC10 | `packages/ui/src/Button/src/useButton.tsx` | S07 | PENDIENTE |
| S09 | `as="a"` expone el rol `link`: se retira el `role="button"` que React Aria fuerza sobre el ancla | AC5, AC9 | `packages/ui/src/Button/src/useButton.tsx` | S08 | PENDIENTE |
| S10 | `loading`: `aria-busy="true"`, interacción bloqueada, spinner **junto** al contenido | AC3 | `packages/ui/src/Button/src/useButton.tsx`, `Button.tsx` | S08 | PENDIENTE |
| S11 | El spinner hereda tamaño (mapa `ButtonSize → LoaderSize`) y color (`color="current"`) | AC11 | `packages/ui/src/Button/src/useButton.tsx`, `Button.tsx` | S04, S10 | PENDIENTE |
| S12 | Render de `startIcon`/`endIcon` en orden, y de `icon` como único contenido con `.btn-square` | AC4 | `packages/ui/src/Button/src/Button.tsx`, `useButton.tsx` | S07, S10 | PENDIENTE |
| S13 | Tests de Button: variantes, themes, loading, iconos, modificadores, fuga de props, rol del ancla | AC1–AC6, AC8–AC11 | `packages/ui/src/Button/__test__/Button.test.tsx` | S08–S12 | PENDIENTE |
| S14 | Stories: `AllVariants`, `AllSizes`, `WithIcons`, `IconOnly`, `Modifiers`, `Loading`; + limpieza de los ~40 warnings de Prettier preexistentes (**G-07**) | AC7 | `packages/ui/src/Button/src/Button.stories.tsx` | S07–S12 | PENDIENTE |
| S15 | Documentación: `AGENTS.md` §4.7, §5.6, §9.4, §9.5 y §9.10 al día + changesets | — | `AGENTS.md`, `.changeset/*` | S01–S14 | PENDIENTE |

---

## 4. Tabla de TASKS

| ID  | Slices | Predecesora(s) | Modo + justificación | Commit | Estado |
| --- | ------ | -------------- | -------------------- | ------ | ------ |
| T1 | S01, S02, S03 | — | **SECUENCIAL** (primera). Toca el contrato del plugin, del que depende todo lo demás. | — | PENDIENTE |
| T2 | S04, S05 | — | **PARALELO posible** con T1: archivos disjuntos (`loader.css`/`variants/loader.ts`/tipos de Loader vs `variants/button.ts`). Se ejecuta después por orden de commit, no por dependencia. | — | PENDIENTE |
| T3 | S06 | T2 | **SECUENCIAL**: el fixture e2e verifica el CSS que T2 añade. | — | PENDIENTE |
| T4 | S07, S08, S09 | T1 | **SECUENCIAL**: consume el contrato de T1 y toca `useButton`/`Button.types`, archivos de las tasks siguientes. | — | PENDIENTE |
| T5 | S10, S11 | T2, T4 | **SECUENCIAL**: mismos archivos que T4 y depende del `color="current"` de T2. | — | PENDIENTE |
| T6 | S12, S13 | T5 | **SECUENCIAL**: mismos archivos. | — | PENDIENTE |
| T7 | S14 | T6 | **SECUENCIAL**: las stories consumen la API final. | — | PENDIENTE |
| T8 | S15 | T7 | **SECUENCIAL**: cierre documental con la evidencia de todo lo anterior. | — | PENDIENTE |

---

## 5. Checklist de criterios de aceptación

Se completa con evidencia (hash + test) al cerrar cada task.

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| AC1 | PENDIENTE | |
| AC2 | PENDIENTE | |
| AC3 | PENDIENTE | |
| AC4 | PENDIENTE | |
| AC5 | PENDIENTE | |
| AC6 | PENDIENTE | |
| AC7 | PENDIENTE | |
| AC8 | PENDIENTE | |
| AC9 | PENDIENTE | |
| AC10 | PENDIENTE | |
| AC11 | PENDIENTE | |

---

## 6. Decisiones tomadas

| ID | Contexto | Opciones | Decisión | Razón | Reversibilidad |
| -- | -------- | -------- | -------- | ----- | -------------- |
| D-01 | El prompt llega con `{{N}}` sin sustituir. | (a) Terminar pidiendo el número; (b) inferirlo del estado del repo. | **(b) N = 5.** | El prompt prohíbe preguntar. `develop` ya integra L0–L4 y no hay rama `claude/lote-5`; L5 es el siguiente del backlog. | Trivial. |

---

## 7. Bloqueantes

Ninguno por ahora.

---

## 8. Preguntas abiertas, objeciones y gaps

Se completa durante la ejecución.

---

## 9. Log cronológico

- **2026-11-20** · Fase 0. `develop` confirmada en `0afe779` (contiene L0–L4). Creada
  `claude/lote-5` desde ella. `pnpm install --frozen-lockfile` OK. Baseline de tests:
  54 passed en el proyecto `components` (incluye 3 `test.failing` que este lote debe convertir
  en tests normales). Spec creada con 15 slices en 8 tasks.
