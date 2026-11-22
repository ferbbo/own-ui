# Lote 8 — Generador de componentes y plantillas

## 1. Meta

| Campo           | Valor                                                                                 |
| --------------- | ------------------------------------------------------------------------------------- |
| Lote            | **L8** — Generador de componentes y plantillas (`@docs/BUILD-BATCHES.md` §L8)          |
| Rama base       | `develop` (en `368b3fe`, merge del PR #33 / lote 6)                                    |
| Rama de trabajo | `claude/lote-8`                                                                        |
| Estado general  | EN CURSO                                                                               |
| Fecha           | 2026-11-22                                                                             |
| PR              | pendiente                                                                              |

> **Nota sobre el número de lote.** El prompt programado llegó otra vez con el marcador
> `{{N}}` sin sustituir. Se resuelve a **N = 8**. Justificación en **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt (igual que en los lotes 0–7):

- **Slice** = unidad mínima verificable y testeable por sí sola, con criterios de aceptación
  propios.
- **Task** = agrupación de slices cohesivos (mismo módulo, archivos compartidos o criterios
  acoplados). **Una task = un commit.**

Reglas de oro de `@docs/BUILD-BATCHES.md` que condicionan este lote:

- **El contrato manda.** Este lote construye justamente la herramienta que lo verifica
  (`pnpm check:contract`), así que la regla deja de depender de que alguien se acuerde.
- **CSS antes que React.** El generador emite el CSS y el contrato *antes* del paquete de
  React, y registra el `@import` en `css/index.css`: un componente generado no puede nacer sin
  estilos publicados (el bug raíz del lote 1).
- **Tests reales.** La plantilla de test es RTL de verdad, nunca stubs de `console.log`.

### Criterios de aceptación del lote (del backlog)

| ID  | Criterio                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------ |
| AC1 | `pnpm create-component Demo` produce un paquete que compila, pasa lint, tiene un test que pasa y una story que renderiza — sin edición manual |
| AC2 | `pnpm check:contract` detecta los desajustes conocidos de L5 y L6 si se reintroducen (probarlo revirtiendo un cambio en una rama scratch) |
| AC3 | `check:contract` corre en CI y falla el build cuando debe                                                     |

---

## 3. Tabla de SLICES

| ID  | Descripción | Criterios | Archivos afectados | Depende de | Estado |
| --- | ----------- | --------- | ------------------ | ---------- | ------ |
| S01 | Descubrimiento automático de componentes (paquete React ⇄ `variants/<name>.ts` ⇄ `css/<name>.css`) sin registro manual | AC2 | `scripts/check-contract.mjs` | — | PENDIENTE |
| S02 | Extracción de las clases que emiten los hooks: literales y plantillas `` `x-${variant}` `` expandidas con las uniones de `<Name>.types.ts` | AC2 | `scripts/check-contract.mjs` | S01 | PENDIENTE |
| S03 | Regla C1: toda clase emitida existe como selector en el CSS del componente (o en el de un contrato importado, p. ej. el trigger `.btn`) | AC2 | `scripts/check-contract.mjs` | S02 | PENDIENTE |
| S04 | Regla C2: toda clase del contrato existe en el CSS (el desajuste de L5: `variant.solid`) | AC2 | `scripts/check-contract.mjs` | S01 | PENDIENTE |
| S05 | Regla C3: todo valor de unión de tipos tiene entrada en el contrato o clase emitida | AC2 | `scripts/check-contract.mjs` | S02 | PENDIENTE |
| S06 | Regla C4: el CSS de todo componente con contrato está importado en `css/index.css` | AC2 | `scripts/check-contract.mjs` | S01 | PENDIENTE |
| S07 | CLI del checker: `--root`, `--component`, `--json`, `--strict`, `--help` y código de salida 1 | AC2, AC3 | `scripts/check-contract.mjs` | S03–S06 | PENDIENTE |
| S08 | Script raíz `pnpm check:contract` | AC2, AC3 | `package.json` | S07 | PENDIENTE |
| S09 | Tests del checker: verde en el repo real y rojo al reintroducir los desajustes de L5 y L6 sobre un árbol temporal | AC2 | `scripts/__tests__/check-contract.test.ts`, `jest.config.js` | S07 | PENDIENTE |
| S10 | Generador: paquete React completo del patrón A (composición) | AC1 | `scripts/create-component.mjs` | — | PENDIENTE |
| S11 | Generador: CSS esqueleto con la cascada de `AGENTS.md` §4.8 + contrato `variants/<name>.ts` | AC1 | `scripts/create-component.mjs` | S10 | PENDIENTE |
| S12 | Generador: registro automático en `variants/index.ts`, `css/index.css` y `packages/ui/src/index.ts` | AC1 | `scripts/create-component.mjs` | S11 | PENDIENTE |
| S13 | Generador: `--compound` (patrón B, Provider + subcomponentes) | AC1 | `scripts/create-component.mjs` | S10 | PENDIENTE |
| S14 | Generador: plantillas de test RTL real y de stories (`Default`, `AllVariants`, `AllSizes`, `Disabled`) | AC1 | `scripts/create-component.mjs` | S10 | PENDIENTE |
| S15 | CLI del generador: `--prefix`, `--dry-run`, `--force`, `--help` y mensajes de próximos pasos | AC1 | `scripts/create-component.mjs` | S10–S14 | PENDIENTE |
| S16 | Script raíz `pnpm create-component` | AC1 | `package.json` | S15 | PENDIENTE |
| S17 | Tests del generador: genera sobre un árbol temporal y el resultado pasa `check:contract` | AC1 | `scripts/__tests__/create-component.test.ts` | S09, S15 | PENDIENTE |
| S18 | Verificación end-to-end de AC1: generar `Demo` en el repo, typecheck + lint + test + story, y borrarlo | AC1 | — (evidencia en esta spec) | S16 | PENDIENTE |
| S19 | `check:contract` como paso de CI | AC3 | `.github/workflows/ci.yml` | S08 | PENDIENTE |
| S20 | `AGENTS.md`: §7 pasa a apoyarse en el generador y en el checker; §6.1 lista los scripts nuevos | — | `AGENTS.md` | S16, S19 | PENDIENTE |
| S21 | Changeset con el impacto de versión | — | `.changeset/` | S20 | PENDIENTE |

---

## 4. Tabla de TASKS

| ID  | Slices | Predecesora | Modo + justificación | Commit | Estado |
| --- | ------ | ----------- | -------------------- | ------ | ------ |
| T1 | S01–S09 | — | SECUENCIAL. Es la primera. | — | PENDIENTE |
| T2 | S10–S17 | T1 | SECUENCIAL: lo que genera T2 tiene que pasar el checker de T1, y sus tests lo invocan. Archivos compartidos: `package.json` raíz, `scripts/__tests__/`. | — | PENDIENTE |
| T3 | S18–S21 | T2 | SECUENCIAL: la verificación end-to-end y la documentación describen lo que T1 y T2 dejan en el árbol. | — | PENDIENTE |

Ninguna task es paralelizable en este lote: las tres tocan `package.json` raíz y las dos
primeras comparten el directorio de tests. Registrado como decisión **D-02**.

---

## 5. Checklist de criterios de aceptación

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| AC1 | PENDIENTE | — |
| AC2 | PENDIENTE | — |
| AC3 | PENDIENTE | — |

---

## 6. Decisiones tomadas

### D-01 — El lote es el 8

| Campo | Valor |
| --- | --- |
| Contexto | El prompt programado llegó con `{{N}}` sin sustituir, así que el número de lote no viene dado. |
| Opciones | (a) Terminar pidiendo el número — prohibido por el prompt. (b) Repetir un lote ya hecho. (c) Deducirlo del estado del repo. |
| Decisión | **(c)**. `origin/develop` tiene mergeados los lotes 0–6 (último merge: PR #33), `specs/` contiene `lote-0.md`…`lote-6.md`, y `origin/claude/lote-7` existe con 3 commits propios y una spec `lote-7.md` esperando revisión humana. El siguiente lote sin empezar es **L8**. |
| Razón | Es el único número que no duplica trabajo ni salta el orden del backlog. L8 abre la FASE 2 y el backlog lo declara paralelizable respecto a L7, así que no depende de que el PR del lote 7 se mergee. |
| Reversibilidad | Alta: la rama y la spec se renombran si el gate humano quería otro número. |

### D-02 — Las tres tasks van en secuencial

| Campo | Valor |
| --- | --- |
| Contexto | El prompt permite ejecutar tasks en paralelo si no comparten archivos ni dependencias. |
| Opciones | (a) Paralelizar T1 y T2 en worktrees. (b) Secuencial. |
| Decisión | **(b)**. |
| Razón | T2 genera código que tiene que pasar el checker de T1 y sus tests lo invocan; y las tres tasks escriben en `package.json` raíz. El coste de integrar dos worktrees supera el ahorro en un lote de tres commits. |
| Reversibilidad | Total: no deja rastro en el código. |

---

## 7. Bloqueantes

Ninguno hasta ahora.

---

## 8. Preguntas abiertas, objeciones y gaps

(se completa durante la ejecución)

---

## 9. Log cronológico

| Momento | Evento |
| --- | --- |
| Fase 0 | `git fetch` + inventario de ramas. `develop` existe (`368b3fe`) y tiene los lotes 0–6. Rama `claude/lote-8` creada desde ahí. |
| Fase 0 | Spec inicial con slices, tasks y dependencias. |
