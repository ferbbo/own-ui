# Lote 6 — Dropdown: CSS de menu y trigger

## 1. Meta

| Campo           | Valor                                                                           |
| --------------- | ------------------------------------------------------------------------------- |
| Lote            | **L6** — Dropdown: CSS de menu y trigger (`@docs/BUILD-BATCHES.md` §L6)         |
| Rama base       | `develop` (en `0afe779`, "Merge pull request #31 from ferbbo/claude/lote-4")     |
| Rama de trabajo | `claude/lote-6`                                                                 |
| Estado general  | EN CURSO                                                                        |
| Fecha           | 2026-11-21                                                                      |

> **Nota sobre el número de lote.** El prompt programado llegó de nuevo con el marcador
> `{{N}}` sin sustituir. Se resuelve a **N = 6**. Justificación en **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt (igual que en los lotes 0–5):

- **Slice** = unidad mínima verificable y testeable por sí sola, con criterios de aceptación
  propios.
- **Task** = agrupación de slices cohesivos (mismo módulo, archivos compartidos o criterios
  acoplados). **Una task = un commit.**

Reglas de oro de `@docs/BUILD-BATCHES.md` que condicionan este lote:

- **El contrato manda.** Toda clase que emitan los hooks de `useDropdown.tsx` tiene que existir
  como selector en `dropdown.css` **y** estar declarada en `variants/dropdown.ts`. Este lote
  convierte esa regla en un test automático (S10) en vez de en una revisión manual.
- **Ningún color literal fuera de `themes/*.ts`.** El CSS nuevo sólo usa `var(--color-*)`;
  los únicos literales son `#000` / `#0000` como operandos de `color-mix` (precedente ya
  establecido en `button.css`).
- **Cambio en el plugin ⇒ fixture e2e.** El criterio del menú posicionado y con elevación se
  mide sobre CSS compilado en Chromium (S11/S12), no leyendo el archivo.

### Criterios de aceptación del lote (del backlog)

| ID  | Criterio                                                                                      |
| --- | --------------------------------------------------------------------------------------------- |
| AC1 | Fixture e2e `dropdown/`: con el menú abierto, `position` computado = `absolute` y `box-shadow` ≠ `none` |
| AC2 | Ninguna clase emitida por los hooks carece de selector (script/test que cruce los literales de `useDropdown.tsx` contra `dropdown.css`) |
| AC3 | Las 8 variantes semánticas aplican color distinto                                             |
| AC4 | Con `prefers-reduced-motion: reduce` la transición se anula                                   |
| AC5 | Story `AllVariants` muestra las 8                                                             |

---

## 3. Tabla de SLICES

| ID  | Descripción                                                                                   | Criterios | Archivos afectados | Depende de | Estado |
| --- | --------------------------------------------------------------------------------------------- | --------- | ------------------ | ---------- | ------ |
| S01 | `.dropdown` pasa a ser wrapper de posicionamiento (sin superficie propia) y declara los tokens del componente | AC1, AC2 | `src/css/dropdown.css` | — | PENDIENTE |
| S02 | `.dropdown-trigger` + `.dropdown-trigger-active` con cascada de custom properties y `:focus-visible` | AC2 | `src/css/dropdown.css` | S01 | PENDIENTE |
| S03 | `.dropdown-menu`: panel absoluto, `z-index`, `min-width`, elevación, radio y superficie       | AC1, AC2 | `src/css/dropdown.css` | S01 | PENDIENTE |
| S04 | `.dropdown-menu-open` / `-closed` + `prefers-reduced-motion`                                  | AC2, AC4 | `src/css/dropdown.css` | S03 | PENDIENTE |
| S05 | Las 8 variantes semánticas en los dos niveles (`.dropdown-*` y `.dropdown-menu-*`)            | AC2, AC3 | `src/css/dropdown.css` | S01 | PENDIENTE |
| S06 | Variantes de tamaño en los dos niveles + tamaño de texto del item por token                   | AC2 | `src/css/dropdown.css` | S01 | PENDIENTE |
| S07 | Variantes de estilo (`ghost`/`bordered`/`compact`) en los dos niveles, aplicadas al panel      | AC2 | `src/css/dropdown.css` | S03 | PENDIENTE |
| S08 | `.dropdown-open` con significado real (contexto de apilamiento mientras está abierto)         | AC2 | `src/css/dropdown.css` | S01 | PENDIENTE |
| S09 | `variants/dropdown.ts` alineado con el contrato real                                          | AC2 | `src/variants/dropdown.ts` | S01–S08 | PENDIENTE |
| S10 | Test de contrato: literales de `useDropdown.tsx` ⇄ `dropdown.css` ⇄ `variants/dropdown.ts`    | AC2 | `src/css/__tests__/dropdown-contract.test.ts` (nuevo) | S09 | PENDIENTE |
| S11 | Fixture e2e `dropdown/`                                                                       | AC1, AC3, AC4 | `e2e/fixtures/dropdown/*` | S01–S08 | PENDIENTE |
| S12 | Spec e2e sobre estilos computados en Chromium                                                 | AC1, AC3, AC4 | `e2e/tests/dropdown.spec.ts` | S11 | PENDIENTE |
| S13 | Adaptar el fixture `base-surfaces` a la nueva semántica de `.dropdown`                        | AC1 | `e2e/fixtures/base-surfaces/index.html`, `e2e/tests/base-surfaces.spec.ts` | S01 | PENDIENTE |
| S14 | Stories: `AllVariants` con las 8, `AllSizes` con las 5, nueva `StyleVariants`                  | AC5 | `Dropdown.stories.tsx` | S05–S07 | PENDIENTE |
| S15 | `AGENTS.md` al día (§4.8 y §9.7)                                                              | — | `AGENTS.md` | S01–S13 | PENDIENTE |
| S16 | Changeset con el impacto de versión                                                           | — | `.changeset/lote-6-*.md` | S01–S15 | PENDIENTE |

---

## 4. Tabla de TASKS

| ID  | Slices             | Predecesora | Modo + justificación | Commit | Estado |
| --- | ------------------ | ----------- | -------------------- | ------ | ------ |
| T1  | S01–S08            | —           | SECUENCIAL — es la base: todo lo demás verifica este archivo | — | PENDIENTE |
| T2  | S09, S10           | T1          | SECUENCIAL — el test cruza los selectores que T1 escribe | — | PENDIENTE |
| T3  | S11, S12, S13      | T1          | PARALELO posible con T2 (no comparten archivos: T2 toca `src/`, T3 toca `e2e/`); se ejecuta en serie para mantener un commit por task | — | PENDIENTE |
| T4  | S14                | T1          | PARALELO posible con T2/T3 (único archivo en `packages/ui/`) | — | PENDIENTE |
| T5  | S15, S16           | T1–T4       | SECUENCIAL — documenta y versiona el resultado de todas | — | PENDIENTE |

---

## 5. Checklist de criterios de aceptación

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| AC1 | PENDIENTE | — |
| AC2 | PENDIENTE | — |
| AC3 | PENDIENTE | — |
| AC4 | PENDIENTE | — |
| AC5 | PENDIENTE | — |

---

## 6. Decisiones tomadas

### D-01 — El lote es el 6

- **Contexto.** El prompt programado llegó con `{{N}}` literal, sin sustituir (como en los
  lotes 1–5).
- **Opciones.** (a) Terminar pidiendo el número — prohibido por el propio prompt («no me hagas
  preguntas»). (b) Repetir un lote ya hecho. (c) Resolver al siguiente lote pendiente del
  backlog.
- **Decisión.** (c) **N = 6**.
- **Razón.** Estado verificado del repo: `develop` está en el merge del PR #31 (lote 4) y
  contiene los lotes 0, 1, 2 y 3 (PRs #25, #26, #27, #28, #29). El lote 5 está entregado y
  esperando revisión en el **PR #32** (`claude/lote-5`, 8 commits ahead de `develop`), que es
  el gate humano y no me toca mergear. El primer lote sin empezar es el **L6**, y además es el
  siguiente en la secuencia del backlog (fase 1).
- **Reversibilidad.** Total: el trabajo vive en una rama propia y un PR aparte.

### D-02 — `.dropdown` es wrapper de posicionamiento; el panel es `.dropdown-menu`

- **Contexto.** El backlog (§L6) pide decidir la semántica de `.dropdown`: hoy el contenedor
  raíz tiene fondo, padding y sombra propios, es decir está escrito como si fuera el panel,
  mientras que en el árbol de React envuelve al trigger **y** al menú.
- **Opciones.** (a) Dejar `.dropdown` como panel y que `.dropdown-menu` sólo posicione: el
  panel envolvería también al trigger, que es justo el bug visual. (b) `.dropdown` como panel
  y `.dropdown-menu` como segundo panel: doble fondo y doble sombra. (c) `.dropdown` como
  wrapper sin superficie (`position: relative`) y `.dropdown-menu` como único panel.
- **Decisión.** (c), que es además la que el backlog apunta como probable.
- **Razón.** Es la única que casa con el árbol de React (`DropdownRoot` envuelve trigger y
  menú) y la única que permite que el menú flote sobre el contenido en vez de empujarlo.
- **Reversibilidad.** Alta, pero **es un cambio observable**: quien dependa hoy del fondo de
  `.dropdown` lo pierde. Va al changeset como `minor` (ver §Impacto de versión).

### D-03 — Los defaults de token viven en `.dropdown`; las variantes se declaran en los dos niveles

- **Contexto.** Los hooks emiten la variante **dos veces**: en el wrapper (`.dropdown-primary`)
  y en el menú (`.dropdown-menu-primary`). Una custom property declarada en el mismo elemento
  que la consume gana siempre a la heredada, así que si `.dropdown-menu` declarase sus propios
  defaults, una variante puesta en el wrapper no podría cambiarlos nunca (el fallo clásico de
  este patrón).
- **Opciones.** (a) Declarar defaults en cada elemento y duplicar cada variante con selectores
  descendentes (`.dropdown-primary .dropdown-menu`): multiplica los selectores y rompe si el
  menú se portaliza. (b) Declarar todos los defaults sólo en `.dropdown` y consumirlos en los
  elementos hijos con cadena de fallback, y declarar cada variante con lista de selectores
  (`.dropdown-primary, .dropdown-menu-primary`).
- **Decisión.** (b).
- **Razón.** Un único sitio por token, la variante funciona desde cualquiera de los dos
  niveles, y la cadena de fallback deja el menú utilizable incluso suelto (sin wrapper), que
  es lo que hará falta el día que se portalice (lote 7).
- **Reversibilidad.** Total, es organización interna del CSS.

### D-04 — Los defaults "compuestos" viven en el fallback del `var()` que los consume

- **Contexto.** `--dropdown-menu-shadow` y los `border-color` derivados con `color-mix` tienen
  que poder anularse desde el wrapper (`.dropdown-ghost`) y desde el propio menú
  (`.dropdown-menu-ghost`), y además resolver si no hay wrapper.
- **Decisión.** No se declaran como token en la base: el valor por defecto se escribe como
  fallback del `var()` en la propiedad final (`box-shadow: var(--dropdown-menu-shadow, …)`).
- **Razón.** Un solo sitio, sin duplicar el valor, y sin el conflicto declaración-propia vs
  heredada de D-03. `color-mix` se evalúa en el elemento que consume, así que el cálculo ve el
  `--dropdown-color` del nivel correcto.
- **Reversibilidad.** Total.

---

## 7. Bloqueantes

Ninguno por ahora.

---

## 8. Preguntas abiertas, objeciones y gaps

(Se completa durante la ejecución.)

---

## 9. Log cronológico

- **2026-11-21 ~18:45** — Fase 0. Verificado el estado del repo: `develop` existe en remoto con
  los lotes 0–4 mergeados; lote 5 en PR #32 abierto. Resuelto `{{N}}` → 6 (D-01).
  Rama `claude/lote-6` creada desde `origin/develop` (`0afe779`).
- **2026-11-21 ~18:50** — Línea base verde antes de tocar nada: `pnpm lint` sin errores y
  `pnpm test` con 122 tests en 10 suites, todo en verde.
