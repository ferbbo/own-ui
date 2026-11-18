# Lote 2 — Arreglar la ejecución de tests

## 1. Meta

| Campo           | Valor                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| Lote            | **L2** — Arreglar la ejecución de tests (`@docs/BUILD-BATCHES.md` §L2) |
| Rama base       | `develop` (en `6aa40a1`)                                               |
| Rama de trabajo | `claude/lote-2`                                                        |
| Estado general  | EN CURSO                                                               |
| Fecha           | 2026-11-18                                                             |

> **Nota sobre el número de lote.** El prompt programado llegó otra vez con el marcador
> `{{N}}` sin sustituir. Se resolvió a **N = 2**: el lote 0 está mergeado en `develop`
> (PR #25) y el lote 1 está entregado y en revisión (PR #26, `claude/lote-1`, 5 commits
> ahead de `develop`). El siguiente lote pendiente del backlog es L2. Registrado como
> decisión **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt:

- **Slice** = unidad mínima verificable y testeable por sí sola, con criterios de
  aceptación propios.
- **Task** = agrupación de slices cohesivos: mismo módulo, archivos compartidos o
  criterios acoplados. **Una task = un commit.**

Se respetan las reglas de `AGENTS.md` §8 y las reglas de oro de `@docs/BUILD-BATCHES.md`,
en particular la regla **"tests reales o nada"**: `Button.test.tsx` (el antipatrón del
repo, que redefine `describe`/`test`/`expect`/`render` con `console.log`) se reescribe
completo con React Testing Library, no se parchea.

---

## 3. Tabla de SLICES

| ID  | Descripción                                                                         | Criterios (IDs) | Archivos afectados                                     | Depende de | Estado   |
| --- | ----------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------ | ---------- | -------- |
| S01 | `testMatch` del proyecto `components` apunta a `packages/ui/**` (ruta real)          | AC1             | `jest.config.js`                                       | —          | EN CURSO |
| S02 | `collectCoverageFrom` apunta a `packages/ui/**` y `packages/utils/**`                | AC3             | `jest.config.js`                                       | S01        | EN CURSO |
| S03 | Resolución de los paquetes `@ownui/*` a su fuente (runtime y tipos) sin build previo | AC1             | `jest.config.js`, `tsconfig.jest.json`                 | S01        | EN CURSO |
| S04 | `collectCoverage` deja de ser global: sólo en `pnpm test:coverage`                   | AC4             | `jest.config.js`                                       | S01        | EN CURSO |
| S05 | `Button.test.tsx` reescrito con RTL real (render, theme, size, disabled, click)      | AC1, AC2, AC3   | `packages/ui/src/Button/__test__/Button.test.tsx`       | S01, S03   | PENDIENTE |
| S06 | Tests de Button para polimorfismo `as="a"`, forwarding de ref y `loading`            | AC2, AC3        | `packages/ui/src/Button/__test__/Button.test.tsx`       | S05        | PENDIENTE |
| S07 | Suite de Dropdown ejecutándose en verde (expectativas corregidas o hallazgo abierto) | AC1             | `packages/ui/src/Dropdown/__test__/Dropdown.test.tsx`   | S01, S03   | PENDIENTE |
| S08 | Suite de Loader ejecutándose en verde                                               | AC1             | — (verificación)                                       | S01, S03   | PENDIENTE |
| S09 | Tests de `useDOMRef` (`@ownui/dom-utils`): nodo expuesto, ref callback y `null`      | AC1             | `packages/utils/dom-utils/__test__/dom.test.tsx`        | S01, S03   | PENDIENTE |
| S10 | Spec cerrada, changeset y actualización de `AGENTS.md` §6.3/§9.2                     | —               | `specs/lote-2.md`, `AGENTS.md`, `.changeset/*`         | S05–S09    | PENDIENTE |

---

## 4. Tabla de TASKS

| ID  | Slices          | Predecesora(s) | Modo + justificación | Commit | Estado   |
| --- | --------------- | -------------- | -------------------- | ------ | -------- |
| T1  | S01–S04         | —              | SECUENCIAL — es el habilitador de todo el lote: sin `testMatch` corregido no hay ninguna suite que ejecutar | — | EN CURSO |
| T2  | S05, S06        | T1             | SECUENCIAL — necesita la config de T1 para poder ejecutar lo que escribe | — | PENDIENTE |
| T3  | S07, S08        | T1             | SECUENCIAL por elección — no comparte archivos con T2 (`Dropdown.test.tsx` vs `Button.test.tsx`), luego sería paralelizable; se ejecuta en serie porque orquestar worktrees/subagentes cuesta más que el beneficio en dos archivos de test | — | PENDIENTE |
| T4  | S09             | T1             | SECUENCIAL por elección — igual que T3: archivos disjuntos (`packages/utils/**`), paralelizable en teoría, serie por coste | — | PENDIENTE |
| T5  | S10             | T2, T3, T4     | SECUENCIAL — consolida evidencia de las tasks anteriores | — | PENDIENTE |

---

## 5. Checklist de criterios de aceptación

| ID  | Criterio (de `@docs/BUILD-BATCHES.md` §L2)                                  | Estado   | Evidencia |
| --- | --------------------------------------------------------------------------- | -------- | --------- |
| AC1 | `pnpm test:components` ejecuta **>0 suites** y las tres pasan               | PENDIENTE | — |
| AC2 | `grep -rn "const describe\|const expect\|const render" packages/ui` → vacío | PENDIENTE | — |
| AC3 | Cobertura de `packages/ui/src/**` reportada (no 0%); Button ≥90% líneas     | PENDIENTE | — |
| AC4 | `pnpm test` verde en limpio                                                 | PENDIENTE | — |

---

## 6. Decisiones tomadas

### D-01 — Resolución de `{{N}}` a lote 2

- **Contexto.** El scheduler entregó el prompt con `{{N}}` literal, sin sustituir.
- **Opciones.** (a) Terminar pidiendo el número — prohibido por el prompt ("sin hacerme
  ninguna pregunta"). (b) Repetir el último lote. (c) Deducir el siguiente pendiente del
  estado real del repo.
- **Decisión.** (c): L2. `specs/lote-0.md` está en `develop` y su PR #25 está mergeada;
  `claude/lote-1` existe con PR #26 abierta. L2 es el siguiente del backlog y además
  `@docs/BUILD-BATCHES.md` lo marca bloqueante de Fase 0.
- **Razón.** Es la única lectura que avanza el plan sin rehacer trabajo ya entregado.
- **Reversibilidad.** Total: el trabajo vive en su propia rama y PR.

### D-02 — L2 parte de `develop`, no de `claude/lote-1`

- **Contexto.** El lote 1 no está mergeado (PR #26 en revisión). Sus cambios tocan
  `packages/tw-theme` (CSS publicado), no la ejecución de tests.
- **Opciones.** (a) Ramificar de `claude/lote-1` para evitar conflictos futuros.
  (b) Ramificar de `develop` como manda el prompt.
- **Decisión.** (b). Los archivos de L2 (`jest.config.js`, tests de `packages/ui`,
  `packages/utils`) son disjuntos de los de L1 (`packages/tw-theme/**`, `README.md`),
  así que el merge posterior no debería conflictuar.
- **Razón.** El modelo de ramas del prompt es explícito: trabajo desde la última `develop`.
- **Reversibilidad.** Total.

### D-03 — Los paquetes `@ownui/*` se resuelven a `src/`, no a `dist/`

- **Contexto.** `useButton.tsx` importa `@ownui/tw-theme/variants` y `@ownui/dom-utils`;
  `Button.tsx` importa `@ownui/loader`. Los `exports` de esos paquetes apuntan a `dist/`,
  que **no existe** hasta construir (y `pnpm build` sólo construye el plugin — eso es L3).
  Sin mapeo, las suites fallan con `Cannot find module`.
- **Opciones.** (a) Exigir `pnpm build` antes de los tests: acopla los tests unitarios al
  build roto que arregla L3 y atribuye la cobertura al bundle. (b) Mapear a `src/` con
  `moduleNameMapper` (runtime) + `paths` de TypeScript (tipos).
- **Decisión.** (b), en `jest.config.js` y en un `tsconfig.jest.json` nuevo.
- **Razón.** Los tests unitarios deben correr en un clon limpio sin build previo, y la
  cobertura debe medirse sobre el fuente. Es también lo que hace Storybook vía Vite.
- **Reversibilidad.** Alta: son dos bloques de configuración contiguos y comentados como
  pareja ("deben moverse juntos").

### D-04 — El rojo intermedio de T1 es el resultado esperado, no una regresión

- **Contexto.** Al corregir `testMatch`, las tres suites se ejecutan por primera vez: una
  falla por ser falsa (`Button.test.tsx`) y dos tests de Dropdown fallan por expectativas
  equivocadas. Son fallos **preexistentes que la config ocultaba**.
- **Opciones.** (a) Meter todo en un único commit gigante para que ningún commit quede en
  rojo. (b) Commitear T1 (config) con el rojo visible y arreglarlo en T2–T4.
- **Decisión.** (b).
- **Razón.** El valor de L2 es precisamente dejar de tener falsa señal verde; un commit
  que muestra el rojo real documenta el bug mejor que un commit monolítico, y `main` nunca
  ve estados intermedios (el gate es la PR).
- **Reversibilidad.** Total.

---

## 7. Bloqueantes

_Ninguno por ahora._ Acceso de escritura al repo verificado al inicio con un `push` de la
rama vacía (el lote 0 se quedó sin publicar por un 403 del proxy: ver `specs/lote-0.md`
B-03; esta sesión sí tiene permiso).

---

## 8. Preguntas abiertas, objeciones y gaps

_Se completa al cierre._

---

## 9. Log cronológico

- **T+0** — Estado del repo leído: `develop` en `6aa40a1` (L0 mergeado), `claude/lote-1`
  con PR #26 abierta. `{{N}}` resuelto a 2 (D-01).
- **T+1** — Rama `claude/lote-2` creada desde `origin/develop` y empujada para verificar
  acceso de escritura: OK.
- **T+2** — T1: `jest.config.js` reescrito (testMatch, coverage, mapeo de workspace) y
  `tsconfig.jest.json` nuevo. Primera ejecución real: **17 tests en 3 suites**
  (antes: 0). Loader en verde; Dropdown con 2 fallos de expectativa; Button falla por ser
  un test falso.
