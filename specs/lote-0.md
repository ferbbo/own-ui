# Lote 0 — Reconciliar las ramas sin mergear

## 1. Meta

| Campo           | Valor                                                                     |
| --------------- | ------------------------------------------------------------------------- |
| Lote            | **L0** — Reconciliar las ramas sin mergear (`@docs/BUILD-BATCHES.md` §L0) |
| Rama base       | `develop` (en `70d1d22`)                                                  |
| Rama de trabajo | `claude/lote-0`                                                           |
| Estado general  | **TRABAJO COMPLETO, SIN PUBLICAR** — ver bloqueante B-03                  |
| Fecha           | 2026-11-18                                                                |

> **Nota sobre el número de lote.** El prompt programado llegó con el marcador `{{N}}`
> sin sustituir. Se resolvió a **N = 0** porque (a) no existe `specs/` en el repo, luego
> ningún lote ha pasado por este proceso, y (b) `@docs/BUILD-BATCHES.md` es explícito:
> _"el lote 0 va primero y sin excepción"_. Registrado como decisión **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt:

- **Slice** = unidad mínima verificable y testeable por sí sola (un componente, o una
  variante/estado/comportamiento suyo), con criterios de aceptación propios.
- **Task** = agrupación de slices cohesivos: mismo componente o módulo, archivos
  compartidos o criterios acoplados. **Una task = un commit.**

Sí se respetan las reglas de `AGENTS.md` §8 (contrato `variants ⇄ css ⇄ types`, ningún
color literal fuera de `themes/*.ts`, tests reales, fixture e2e ante cambios de plugin,
`pnpm`, conventional commits, comentarios en español) y las reglas de oro de
`@docs/BUILD-BATCHES.md`.

**Particularidad de este lote:** L0 es un lote de _decisión_, no de producto
("el trabajo de este lote es decidir, no programar"). Por eso la mayoría de los slices
producen decisiones documentadas y rescates quirúrgicos, no funcionalidad nueva.

---

## 3. Tabla de SLICES

| ID  | Descripción                                                                                  | Criterios (IDs) | Archivos afectados                              | Depende de  | Estado             |
| --- | -------------------------------------------------------------------------------------------- | --------------- | ----------------------------------------------- | ----------- | ------------------ |
| S01 | Inventario de las 14 ramas remotas con ahead/behind reales vs `develop`                      | AC1             | `specs/lote-0.md`                               | —           | HECHO              |
| S02 | Decisión escrita por rama: rescatar / reimplementar / descartar                              | AC1             | `specs/lote-0.md`, `AGENTS.md` §11              | S01         | HECHO              |
| S03 | Rescate del fix de `getThemeNameConfig` (comparación contra literal `"string"`)              | AC2             | `packages/tw-theme/src/theme.ts`                | S02         | HECHO              |
| S04 | Tests unitarios reales del parseo de nombre+flag de tema                                     | AC2             | `packages/tw-theme/src/__tests__/theme.test.ts` | S03         | HECHO              |
| S05 | Decisión sobre el cambio de semántica `:where(root)` de `tw-theme/v1`                        | AC2             | `specs/lote-0.md`, `@docs/BUILD-BATCHES.md`     | S02         | HECHO              |
| S06 | Traslado explícito del contenido de publicación de CSS de `tw-theme/v1` al lote 1            | AC2             | `@docs/BUILD-BATCHES.md` §L1                    | S05         | HECHO              |
| S07 | Rescate de los 5 tokens globales de estado de `components` en `root.ts`                      | AC6             | `packages/tw-theme/src/themes/root.ts`          | S02         | HECHO              |
| S08 | Rescate del `button.css` rediseñado de `components`, reconciliado con la paleta de `develop` | AC3             | `packages/tw-theme/src/css/button.css`          | S07         | HECHO              |
| S09 | Verificación: 0 referencias a `--color-*-focus` inexistentes                                 | AC3             | — (verificación)                                | S08         | HECHO              |
| S10 | Verificación: ningún `-content` idéntico a su color base                                     | AC4             | — (verificación)                                | S08         | HECHO              |
| S11 | Paleta de marca de `components` → NO adoptada (decisión de producto)                         | AC1             | `specs/lote-0.md`                               | S02         | HECHO              |
| S12 | Rescate del README y del fixture React como insumos de los lotes 1 y 9                       | AC1             | `@docs/salvage/**`                              | S02         | HECHO              |
| S13 | Decisión sobre adoptar React 19.0.3                                                          | AC1             | `specs/lote-0.md`                               | S02         | HECHO              |
| S14 | Script de limpieza de ramas muertas (ejecución bajo gate humano)                             | AC5             | `scripts/cleanup-dead-branches.sh`              | S02         | **PARCIAL** (D-09) |
| S15 | `AGENTS.md` §4.1/§4.3/§9/§11 reflejan el estado posterior a la reconciliación                | AC6             | `AGENTS.md`                                     | S03,S07,S08 | HECHO              |
| S16 | `CLAUDE.md` apuntando a `AGENTS.md`, sin duplicar contenido                                  | — (prompt)      | `CLAUDE.md`                                     | —           | HECHO              |

---

## 4. Tabla de TASKS

| ID  | Slices                  | Predecesora(s) | Modo + justificación                                                                                                                                                                                                                    | Commit    | Estado |
| --- | ----------------------- | -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ |
| T1  | S16, S01, S02           | —              | SECUENCIAL — primera task; crea el artefacto (`specs/lote-0.md`) que todas las demás actualizan                                                                                                                                         | `ae94ea4` | HECHO  |
| T2  | S03, S04, S05           | T1             | SECUENCIAL — depende de las decisiones D-04/D-05 registradas en T1                                                                                                                                                                      | `41796fd` | HECHO  |
| T3  | S07                     | T2             | SECUENCIAL por elección — no comparte archivos con T2 (`themes/root.ts` vs `theme.ts`), luego sería paralelizable; se ejecuta en serie porque el coste de orquestar worktrees/subagentes supera el beneficio en una edición de 9 líneas | `aecdf17` | HECHO  |
| T4  | S08, S09, S10           | T3             | SECUENCIAL **obligatorio** — `button.css` consume los tokens `--hover-depth`/`--active-depth`/`--disabled-*-opacity`/`--transition-duration` que introduce T3; sin ellos los fallbacks cambian de significado                           | `2f6e5fd` | HECHO  |
| T5  | S06, S11, S12, S13, S14 | T4             | SECUENCIAL por elección — sólo toca documentación y `scripts/`, sin solape con T2–T4; paralelizable en teoría, serie por el mismo motivo de coste que T3                                                                                | `e54ad83` | HECHO  |
| T6  | S15                     | T2, T3, T4     | SECUENCIAL **obligatorio** — `AGENTS.md` §4/§9/§11 describe el estado final del código, que sólo existe una vez commiteadas T2–T4                                                                                                       | `5317df7` | HECHO  |
| T7  | cierre                  | T6             | SECUENCIAL — spec final con hashes, evidencia y changeset                                                                                                                                                                               | `ddaaa15` | HECHO  |

Los commits se hacen siempre de uno en uno.

---

## 5. Checklist de criterios de aceptación

Criterios tomados literalmente de `@docs/BUILD-BATCHES.md` §L0. Cada evidencia es un comando
que se ejecutó, no una afirmación.

| ID  | Criterio                                                              | Veredicto                       | Evidencia                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| --- | --------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 | Cada una de las 14 ramas tiene una decisión escrita                   | ✅ **CUMPLIDO**                 | §6 de esta spec: 14 filas, 14 decisiones. Commit `ae94ea4`. Resumen también en `AGENTS.md` §11 (`5317df7`). Los ahead/behind se re-midieron con `git rev-list --left-right --count origin/develop...origin/<rama>`                                                                                                                                                                                                                                  |
| AC2 | `tw-theme/v1` integrado, o su contenido trasladado al lote 1          | ✅ **CUMPLIDO**                 | Integrado el fix de `getThemeNameConfig` en `41796fd` con 10 tests (`src/__tests__/theme.test.ts`); **5 de los 10 fallan contra el código sin arreglar**, comprobado haciendo `git stash` del fix. El mecanismo de publicación de CSS se trasladó literal y corregido a la ficha del lote 1 en `e54ad83`                                                                                                                                            |
| AC3 | Ninguna clase ni token referencia un `--color-*-focus` inexistente    | ✅ **CUMPLIDO**                 | `comm -23` entre los `-focus` referenciados en `src/css` + `src/variants` + `src/utilities` (8) y los definidos en `src/themes/*.ts` (8) → **conjunto vacío**. Además los 8 roles de `button.css` caen al color base si el tema omite el token, así que un tema de consumidor tampoco puede romperlo                                                                                                                                                |
| AC4 | Ningún par `-content` igual a su color base                           | ✅ **CUMPLIDO**                 | Script sobre `themes/light.ts` y `dark.ts`: 8 familias × 2 temas = 16 pares comprobados, 0 colisiones. Salida completa en §11. Se cumple porque **no** se adoptó la paleta de `components`, que sí colisionaba                                                                                                                                                                                                                                      |
| AC5 | `git ls-remote --heads origin` sin ramas muertas (0 ahead)            | ❌ **NO CUMPLIDO** (deliberado) | Las 14 ramas siguen en el remoto. Borrarlas es destructivo y ocurriría **antes** del único gate acordado, la revisión de la PR, sin poder revisarse en ella. Se entrega `scripts/cleanup-dead-branches.sh` (`e54ad83`), verificado en dry-run, que borra 11 ramas re-comprobando cada una. Ver D-09 y B-01 · **Actualización 2026-11-19:** P-03 aprobada, pero el borrado falla con 403 desde el proxy git de la sesión (B-04): queda para el dueño |
| AC6 | `AGENTS.md` §4 y §11 reflejan el estado posterior a la reconciliación | ✅ **CUMPLIDO**                 | `5317df7`: §4.1 (5 tokens de estado), §4.3 (paleta vigente + los `-focus` como contrato), §4.8 (`button.css` sin `@apply` + regla de orden en cascada), §6.5 (modelo de ramas + agujero de CI), §9.10 (bug corregido), §11 reescrita con tabla de decisión y notas en §11.1–§11.3                                                                                                                                                                   |

**5 de 6 cumplidos.** El no cumplido lo es por decisión registrada, no por omisión, y queda una
orden de distancia: `./scripts/cleanup-dead-branches.sh --execute`.

### Verificación global (fase final)

| Comprobación                        | Resultado                                                                                                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm test`                         | ✅ 4 suites, **35 tests**, todos en verde (eran 3 suites / 25 antes del lote)                                                                                                                                      |
| e2e sobre CSS compilado en Chromium | ✅ **80/80** (`pnpm e2e:build` + Playwright)                                                                                                                                                                       |
| `pnpm build`                        | ✅ `@ownui/tw-theme` construye. `dist/` **sigue sin `css/`**: es el bug §9.1, que resuelve el lote 1 — esperado, no regresión                                                                                      |
| `tsc --noEmit` de `@ownui/tw-theme` | ✅ limpio (`-p packages/tw-theme/tsconfig.json`)                                                                                                                                                                   |
| `pnpm lint`                         | ⚠️ falla, **exactamente igual que en `develop`**: 5 errores y 307 warnings, todos preexistentes y fuera de alcance (B-02/G-01). Verificado que el lote no añade ni uno: los archivos que toca pasan eslint limpios |
| `tsc` de Button/Dropdown            | ⚠️ errores `TS2307` preexistentes (§9.10). El lote **no toca `packages/ui/`**: `git diff --name-only origin/develop...HEAD \| grep '^packages/ui/'` → vacío                                                        |
| Rebase sobre `develop`              | ✅ sin conflictos: `develop` no avanzó durante el lote (sigue en `70d1d22`)                                                                                                                                        |

### Verificación extra: el CSS rescatado pinta de verdad

`button.css` no se publica ni se importa todavía (§9.1), así que ningún test del repo lo cubre.
Para no rescatarlo a ciegas se compiló con Tailwind v4 en un fixture temporal y se leyeron los
estilos **computados** en Chromium. El fixture no se commitea: construirlo en condiciones es el
criterio de aceptación del lote 1.

| Caso                        | `background-color`                                      | `height`        | `border-radius` | `outline-color`                            |
| --------------------------- | ------------------------------------------------------- | --------------- | --------------- | ------------------------------------------ |
| `.btn .btn-primary .btn-md` | `rgb(59,130,246)` = `--color-primary`                   | `40px` (2.5rem) | `6px`           | `rgb(37,99,235)` = `--color-primary-focus` |
| `+ .btn-outline`            | `rgba(0,0,0,0)` con texto `rgb(59,130,246)`             | `40px`          | `6px`           | idem                                       |
| `.btn-lg`                   | primary                                                 | `48px`          | `6px`           | idem                                       |
| `[data-theme="dark"]`       | `rgb(96,165,250)` = primary dark, texto `rgb(30,41,59)` | `40px`          | `6px`           | `rgb(59,130,246)`                          |
| `:disabled`                 | `oklab(0 0 0 / 0.6)` con texto al 35%                   | `40px`          | `6px`           | —                                          |

Lo relevante: `outline-color` resuelve al token `-focus`. **Ese es exactamente el valor que la
rama `components` rompía** al borrar la paleta, y es la prueba de que la reconciliación funciona.
La fila `:disabled` sólo pinta así tras mover el bloque al final de la cascada: antes de ese
arreglo el computed daba texto blanco opaco, porque `.btn-primary` le ganaba por orden.

## 6. Inventario de ramas y decisión por rama

Medido el 2026-11-18 con `git rev-list --left-right --count origin/develop...origin/<rama>`.
`main` y `develop` están en el mismo commit (`70d1d22`), así que ahead/behind son idénticos
frente a ambas. **Esto corrige a `AGENTS.md` §11**, que reportaba `components` con 0 behind y
`tw-theme/v1` con 9 behind: tras el merge de la PR #24 (docs) los contadores son 1 y 10.

| #   | Rama                                       | Ahead | Behind | Fecha      | Decisión                    | Detalle                                                                                                                                                                                                                                                                  |
| --- | ------------------------------------------ | ----- | ------ | ---------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `components`                               | 7     | 1      | 2026-02-27 | **RESCATAR PARCIAL**        | Entran: 5 tokens de estado de `root.ts` (T3) y el `button.css` rediseñado (T4). **No entra** la paleta de marca (D-07) ni el bump de React (D-08) ni el skill de React (fuera de alcance). Borrar sólo tras verificar el rescate.                                        |
| 2   | `tw-theme/v1`                              | 4     | 10     | 2026-02-27 | **RESCATAR PARCIAL**        | Entra el fix de `getThemeNameConfig` (T2). El mecanismo de publicación de CSS se **traslada al lote 1** (D-05). El cambio de semántica `:where(root)` se **descarta en L0** (D-04). Versionado/CHANGELOG descartados: los regenera Changesets.                           |
| 3   | `claude/great-archimedes-5f008a`           | 3     | 1      | 2026-11-18 | **DESCARTAR**               | Su contenido ya está en `develop` vía la PR #24 (squash `70d1d22`). Verificado: `git diff origin/develop origin/claude/great-archimedes-5f008a` es **vacío**. Rama redundante.                                                                                           |
| 4   | `copilot/update-tw-theme-readme`           | 5     | 38     | 2025-12-12 | **EXTRAER Y DESCARTAR**     | +375 ln de README del sistema de componentes. 38 behind: no vale mergear. Contenido guardado como insumo del lote 9 (T5).                                                                                                                                                |
| 5   | `copilot/update-react-to-19-0-3`           | 2     | 42     | 2025-12-12 | **EXTRAER Y DESCARTAR**     | El bump de React se descarta (D-08), pero la rama contiene un **fixture e2e `react-components/` que no existe en `develop`** (App.tsx + vite + tailwind + tema custom `brand`). Guardado como insumo de los lotes 1 y 9 (T5). Hallazgo no registrado en `AGENTS.md` §11. |
| 6   | `copilot/update-react-versions-to-19-0-3`  | 2     | 45     | 2025-12-12 | **DESCARTAR**               | Mismo bump de React, sin el fixture. Ya incluido en `components`. Nada que rescatar.                                                                                                                                                                                     |
| 7   | `changeset-release/main`                   | 1     | 0      | 2026-11-18 | **DESCARTAR (se regenera)** | Rama automática de Changesets (release de 6 paquetes). Se recrea sola en el siguiente ciclo. No tocar manualmente.                                                                                                                                                       |
| 8   | `copilot/delegate-to-cloud-agent`          | 1     | 42     | 2025-12-12 | **DESCARTAR**               | 1 commit "Initial plan" con **diff vacío**. Cero contenido.                                                                                                                                                                                                              |
| 9   | `copilot/update-copilot-instructions`      | 1     | 38     | 2025-12-12 | **DESCARTAR**               | 1 commit "Initial plan" con **diff vacío**. Cero contenido.                                                                                                                                                                                                              |
| 10  | `copilot/fix-release-workflow-error`       | 0     | 9      | 2025-12-15 | **DESCARTAR**               | 0 ahead: su trabajo ya está en `develop`.                                                                                                                                                                                                                                |
| 11  | `copilot/fix-uncommitted-changes-detected` | 0     | 39     | 2025-12-12 | **DESCARTAR**               | 0 ahead.                                                                                                                                                                                                                                                                 |
| 12  | `copilot/update-react-version-19-0-1`      | 0     | 50     | 2025-12-03 | **DESCARTAR**               | 0 ahead.                                                                                                                                                                                                                                                                 |
| 13  | `feat/tw-theme`                            | 0     | 37     | 2025-12-12 | **DESCARTAR**               | 0 ahead.                                                                                                                                                                                                                                                                 |
| 14  | `feat/v1`                                  | 0     | 34     | 2025-12-13 | **DESCARTAR**               | 0 ahead.                                                                                                                                                                                                                                                                 |

**Ejecución del borrado:** NO se ejecuta en este lote. Ver D-09 y el bloqueante B-01.
El borrado queda empaquetado en `scripts/cleanup-dead-branches.sh` (T5), para ejecutarse
tras aprobar la PR.

---

## 7. Decisiones tomadas

Formato: Contexto | Opciones | Decisión | Razón | Reversibilidad.

### D-01 — Resolución de `{{N}}` a lote 0

- **Contexto:** el prompt programado llegó con `{{N}}` literal, sin número de lote.
- **Opciones:** (a) abortar y preguntar; (b) asumir el primer lote pendiente; (c) elegir un lote arbitrario.
- **Decisión:** (b) → **N = 0**.
- **Razón:** no hay `specs/` en el repo (ningún lote ejecutado) y `@docs/BUILD-BATCHES.md` ordena que L0 vaya primero "sin excepción". Preguntar estaba descartado por el propio prompt.
- **Reversibilidad:** total — si el usuario quería otro lote, este trabajo sigue siendo prerrequisito suyo.

### D-02 — Base de la rama de trabajo

- **Contexto:** el modelo de ramas prohíbe tocar `main`; `main` y `develop` están en el mismo commit.
- **Opciones:** (a) partir de `develop`; (b) partir de `main`.
- **Decisión:** (a) `claude/lote-0` desde `origin/develop`.
- **Razón:** es la regla dura del prompt y la PR va contra `develop`.
- **Reversibilidad:** total.

### D-03 — Qué se rescata de `components`

- **Contexto:** la rama trae 4 cosas separables: tokens de estado, `button.css` rediseñado, paleta de marca y bump de React. Y arrastra 3 regresiones (`AGENTS.md` §11.1).
- **Opciones:** (a) mergear entera; (b) rescatar todo y arreglar las 3 regresiones; (c) rescatar sólo tokens de estado + `button.css` y dejar la paleta fuera.
- **Decisión:** **(c)**.
- **Razón:** es la que mejor relación costo/beneficio tiene, y **disuelve las tres regresiones en lugar de arreglarlas**: las regresiones 1 y 2 (`--color-*-focus` inexistentes, 40 utilidades huérfanas) y la 3 (`--color-accent-content` == `--color-accent`) **sólo existen porque la rama borra la paleta de `develop`**. Si la paleta no entra, los 8 tokens `-focus` siguen en su sitio, `utilities/colors.ts` queda coherente sin tocarlo y ningún `-content` colisiona. El `button.css` rescatado fue además _escrito_ contra una paleta con `-focus` (su propio comentario: "Solo los roles lo setean (via `--color-{name}-focus`)"), así que encaja mejor con la paleta de `develop` que con la de su propia rama. Mergear entera (a) exigía tres arreglos y una decisión de producto que no me corresponde.
- **Reversibilidad:** alta — adoptar la paleta después es un cambio aislado en `themes/light.ts` y `themes/dark.ts`.

### D-04 — El cambio de semántica `:where(root)` de `tw-theme/v1` no entra en L0

- **Contexto:** el commit `1457676` mezcla el fix de `getThemeNameConfig` con la eliminación de `:where(${root})` de la rama `--default`, lo que hace que un tema custom _default_ deje de pintar la raíz. `@docs/BUILD-BATCHES.md` lo marca como "cambio observable: o se acepta con fixture e2e que lo fije, o se deja fuera del cherry-pick".
- **Opciones:** (a) adoptar el cambio y escribir el fixture e2e en L0; (b) adoptar sin fixture; (c) rescatar sólo el fix de parseo y dejar la semántica para un lote con fixture.
- **Decisión:** **(c)**.
- **Razón:** (b) viola la regla "cambio en el plugin ⇒ fixture e2e". (a) mete trabajo de L1/L21 en L0 y amplía el alcance. (c) es lo más simple y deja el cambio documentado donde toca. Las dos hunks del commit son separables.
- **Reversibilidad:** total — queda anotado como pregunta abierta P-01.

### D-05 — El mecanismo de publicación de CSS se traslada al lote 1

- **Contexto:** AC2 admite dos salidas: integrar `tw-theme/v1` o trasladar su contenido al lote 1.
- **Opciones:** (a) integrar ya `exports["./css/*"]` + copia de `src/css` a `dist/`; (b) trasladar al lote 1 con el snippet corregido.
- **Decisión:** **(b)**.
- **Razón:** integrarlo ahora publicaría un `dist/css/` con `menu.css` **vacío**, sin `index.css` agregador y sin el fixture e2e que L1 exige — es decir, anunciaría una capacidad no verificada y rompería "un componente sin CSS publicado no está hecho" y "un lote = un PR". Trasladarlo no pierde nada: el snippet corregido (`"./css/*": "./dist/css/*"`, no `"./css": "./dist/css"`, que Node no resuelve por ser un directorio) queda escrito en la ficha de L1.
- **Reversibilidad:** total.

### D-06 — Los fallbacks hex literales de `button.css` se eliminan

- **Contexto:** el `button.css` de `components` usa `var(--color-base-200, #f3f4f6)` y `var(--color-base-content, #111827)`. `AGENTS.md` §8.2 prohíbe colores literales en el CSS de componente; `AGENTS.md` §11.1 los describe como mitigación de §9.6.
- **Opciones:** (a) conservarlos; (b) eliminarlos y dejar `var(--color-base-200)` a secas.
- **Decisión:** **(b)**.
- **Razón:** `--color-base-200` y `--color-base-content` **sí existen** en `rootColors.ts`, luego el fallback es código muerto que nunca se dispara y sólo introduce dos hex fuera de `themes/*.ts`, contra la regla §8.2. El token que de verdad falta es `--color-base-100` (§9.6), y `button.css` no lo usa: esa carencia es del lote 4. Se conservan `#000` y `#0000`, que no son paleta sino primitivas de `color-mix` (oscurecer / transparente), igual que en el `button.css` actual de `develop`.
- **Reversibilidad:** total.

### D-07 — La paleta de marca es una decisión de producto: no se adopta

- **Contexto:** `components` cambia los 8 colores semánticos a una paleta de marca (Piccolo, Hit, Jireh, Goku, Jiren, Beerus).
- **Opciones:** (a) adoptarla; (b) no adoptarla y escalarla.
- **Decisión:** **(b)**, y pasa a preguntas abiertas (P-02).
- **Razón:** `@docs/BUILD-BATCHES.md` lo dice explícitamente — "la paleta es una decisión de producto que no me toca tomar". Además tal como está en la rama es defectuosa: `--color-accent` es idéntico a `--color-primary` (`#4E46B4`) y `--color-accent-content` es idéntico a `--color-accent` (contraste 1:1, texto invisible). Adoptarla requiere que el dueño del producto fije los valores, no que yo los invente.
- **Reversibilidad:** total.

### D-08 — React 19.0.3 no se adopta

- **Contexto:** alcance L0 punto 6 — decidir si `main` adopta React 19.0.3, que viene en `components` y en dos ramas copilot. Hoy el repo fija `react: 19.0.1` en `pnpm.overrides`.
- **Opciones:** (a) adoptar 19.0.3; (b) quedarse en 19.0.1; (c) subir a la línea actual.
- **Decisión:** **(b)** por ahora, y (c) como lote propio.
- **Razón:** 19.0.3 existe pero la línea publicada va ya por **19.3.1**; adoptar un parche de hace un año arrastra ~975 líneas de `pnpm-lock.yaml` sin resolver nada que esté en el alcance de L0, y deja el repo igual de desactualizado. Un bump de React merece su propio lote con la suite completa en verde, y hoy la suite de componentes **no se ejecuta** (§9.2, lote 2): subir React sin tests que corran sería a ciegas.
- **Reversibilidad:** total.

### D-09 — El borrado de ramas remotas no se ejecuta: se entrega como script

- **Contexto:** AC5 pide `git ls-remote --heads origin` sin ramas muertas. El prompt fija como único gate la revisión de la PR.
- **Opciones:** (a) borrar las 12 ramas ahora; (b) no borrar nada y dejarlo escrito; (c) entregar un script idempotente y verificable que el humano ejecute tras aprobar.
- **Decisión:** **(c)**.
- **Razón:** borrar ramas remotas es una acción destructiva, fuera del repositorio local y **no revisable en la PR**: se ejecutaría antes del único gate acordado y no se deshace desde la propia PR. El script conserva el valor (una orden, idempotente, con los ahead/behind re-verificados en el momento de correrlo) sin saltarse el gate. AC5 se marca **NO CUMPLIDO** con esta justificación, no se declara cumplido a medias.
- **Reversibilidad:** la decisión es total; el borrado, una vez ejecutado por el humano, es difícil de revertir — razón de más para dejárselo a él.

---

### D-10 — Los 8 roles de `button.css` caen al color base si falta su `-focus`

- **Contexto:** el `button.css` rescatado hacía `--btn-focus-color: var(--color-primary-focus)` sin fallback en 6 de los 8 roles (sólo `warning` y `error` lo traían). Si el token no existe, la declaración queda inválida en tiempo de cómputo y el color de interacción se pierde en silencio: es la trampa descrita en `AGENTS.md` §11.1.
- **Opciones:** (a) dejarlo como venía, dado que en `develop` los 8 tokens existen; (b) poner fallback al color base en los 8.
- **Decisión:** **(b)**.
- **Razón:** en el repo los tokens existen, pero **un tema custom de un consumidor puede omitirlos** — el plugin acepta cualquier subconjunto de variables. Con fallback, el peor caso es un hover sin color curado; sin fallback, es un botón con el `outline` roto y sin pista de por qué. El coste son 6 caracteres por línea. Hace AC3 verdadero por construcción y no sólo para los temas del repo.
- **Reversibilidad:** total.

### D-11 — El bloque `:disabled` se mueve al final de la cascada

- **Contexto:** el `button.css` rescatado declaraba `:disabled` **antes** de los roles y los tratamientos, con el comentario "estado FINAL, gana a todo". Pero `.btn:where(:disabled, …)` tiene especificidad (0,1,0), la misma que `.btn-primary`, así que decidía el orden de aparición: el rol le sobreescribía `--btn-fg`. Detectado leyendo los estilos computados en Chromium, no el código: un `.btn-primary:disabled` daba texto blanco opaco en vez del 35% previsto.
- **Opciones:** (a) dejarlo (defecto heredado de la rama); (b) subir la especificidad con un selector más pesado; (c) moverlo al final de la cascada.
- **Decisión:** **(c)**, con el porqué escrito en el propio CSS.
- **Razón:** (a) publica un estado deshabilitado roto en el archivo que este lote introduce. (b) funciona pero rompe el patrón de §4.8, donde todos los selectores viven en (0,1,0) a propósito. (c) es un cambio de orden, cero especificidad añadida, y es lo que el comentario original ya decía querer.
- **Reversibilidad:** total.

### D-12 — El material rescatado se guarda como Markdown, no como archivos fuente

- **Contexto:** el fixture React rescatado se guardó primero como `.tsx`/`.ts` reales en `@docs/salvage/`. Eslint los recoge y añadían 69 warnings de Prettier.
- **Opciones:** (a) dejarlos y asumir el ruido; (b) añadirlos a la configuración de ignore de eslint/prettier; (c) transcribirlos a un `.md` con bloques de código.
- **Decisión:** **(c)**.
- **Razón:** (a) degrada la señal del lint para todo el mundo. (b) toca configuración global, que el lote tiene prohibido. (c) además es más honesto: es material de referencia de una rama descartada, no código del proyecto — así no se lintea, no se typechequea y no se puede importar por accidente.
- **Reversibilidad:** total; el contenido está íntegro.

## 8. Bloqueantes

| ID   | Severidad                                                   | Descripción                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | Estado                                                                           |
| ---- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| B-01 | 🟠 No crítico                                               | **AC5 no se puede cumplir dentro del gate.** El borrado de 12 ramas remotas es destructivo y no revisable en la PR (D-09). Se entrega `scripts/cleanup-dead-branches.sh` para ejecución manual tras la aprobación.                                                                                                                                                                                                                                                                                                                                                              | **Decisión resuelta** (aprobada el 2026-11-19); la ejecución se bloquea por B-04 |
| B-04 | 🟠 No crítico                                               | **El entorno del agente no puede borrar ramas remotas.** Con P-03 ya aprobada, `./scripts/cleanup-dead-branches.sh --execute` falla en las 12: `git push origin --delete` devuelve `RPC failed; HTTP 403` desde el proxy git de la sesión. **No es falta de permiso del dueño ni de credenciales de GitHub**: el mismo remoto acepta `git push` de commits nuevos sin problema (esta rama se publicó así), y el `README` del proxy indica que las denegaciones por política (403/407) se reportan, no se rodean. Hay que ejecutarlo desde una máquina con credenciales propias. | ABIERTO — requiere acción humana                                                 |
| B-03 | 🔴 **CRÍTICO**                                              | **No se pudo hacer `push` ni abrir la PR.** El proxy git de la sesión rechaza la escritura: _"ferbbo/own-ui is not in this session's authorized repository set"_ (HTTP 403), y el token de `gh` tampoco es válido. La sesión tiene acceso de **lectura** (el clon funcionó) pero no de escritura, y no existe en este entorno ninguna herramienta para añadir el repositorio al conjunto autorizado. **No es un fallo del lote**: los 8 commits están completos y verificados. Falta publicarlos.                                                                               | ABIERTO — requiere acción humana                                                 |
| B-02 | 🟠 No crítico (verificado al cierre: el lote no lo empeora) | **`pnpm lint` falla en `develop` antes de este lote**: 5 errores (1 en `jest.setup.js`, 4 en `Dropdown.stories.tsx`) y 307 warnings de Prettier. Son preexistentes y están **fuera del alcance de L0** (`jest.setup.js` → lote 2; `Dropdown.stories.tsx` → lotes 6/7). No se tocan. Se verifica en cambio que los archivos que toca este lote queden limpios.                                                                                                                                                                                                                   | ABIERTO — pasa a gaps                                                            |

### Cómo recuperar el trabajo (B-03)

El contenedor de esta sesión es efímero, así que el lote se empaquetó en dos formatos, ambos
en la raíz del repo:

| Archivo         | Uso                                                             |
| --------------- | --------------------------------------------------------------- |
| `lote-0.bundle` | `git bundle`, conserva los 8 commits con sus mensajes y autoría |
| `lote-0.patch`  | los 8 commits como serie de parches (`git format-patch`)        |

```bash
# Opción A — bundle (recomendada: preserva los commits tal cual)
git fetch ./lote-0.bundle claude/lote-0:claude/lote-0
git push -u origin claude/lote-0

# Opción B — serie de parches
git checkout -b claude/lote-0 develop
git am lote-0.patch
git push -u origin claude/lote-0
```

Después, abrir la PR `claude/lote-0` → `develop`. El cuerpo sugerido está más abajo, en §12.

Para que una sesión futura pueda publicar sola, hay que añadir `ferbbo/own-ui` a las _sources_
del entorno con acceso de escritura.

**Un bloqueante crítico, y es de permisos, no de código** (B-03). El repo se pudo leer,
`develop` existe y el entorno funciona (`pnpm install --frozen-lockfile` en verde); lo único
que falló fue la escritura al remoto, en el último paso.

---

## 9. Preguntas abiertas, objeciones y gaps

### Preguntas abiertas (requieren decisión del dueño)

Las tres fueron **respondidas y aprobadas por el dueño el 2026-11-19**. Se dejan aquí con su
resolución en vez de borrarlas, para que no se reabran.

- **P-01 — ¿Un tema custom marcado `--default` debe pintar la raíz? → SÍ, se conserva.**
  (`:where(:root),[data-theme="x"]`). Es lo que el flag dice y lo que §4.6 documenta, y ya
  estaba fijado por e2e: `custom-theme.spec.ts:15` lo afirma y pasa. El cambio que proponía
  `tw-theme/v1` se descarta por _breaking_; su mitad útil —poder declarar un tema que exista
  sólo bajo `[data-theme]`— entra como **flag nuevo y aditivo `--opt-in`** en el lote 21
  (P-05 del lote 1). Cerrada en `specs/lote-1.md` D-20.
- **P-02 — ¿Cuál es la paleta de marca definitiva? → CERRADA.** Dos partes: (a) la paleta
  neutra actual se queda como tema built-in **por defecto** y la de marca se publica como **par
  de temas opcionales** (`ownui` / `ownui-dark`), activables con `themes: "ownui"`; (b) los
  valores, que eran lo único que faltaba, **están calculados, verificados y aprobados** el
  2026-11-19: las dos tablas completas (24 tokens por tema, con sus 8 `-focus`) están en
  `@docs/BUILD-BATCHES.md` §L21. Todos los pares alcanzan AA 4.5:1 en reposo **y** en
  interacción. Sólo se movieron dos rellenos de marca (el teal Hit en claro, que con blanco da
  2.93:1, y el rojo de error un 4.5 % de L); la tinta oscura `#211F43` ya era color de marca, así
  que el único hex nuevo del sistema es `accent #6865D6`. Implementación: slice del lote 21.
  Evidencia reproducible: `node scripts/check-contrast.mjs`.
- **P-03 — ¿Se borran las ramas muertas? → SÍ, aprobado.** Script re-verificado y ampliado
  (12 ramas, antes 11: se añade `claude/lote-0`, ya mergeada, y se corrige la detección de
  `claude/great-archimedes-5f008a`). **La ejecución falla por política del entorno, no por falta
  de permiso del dueño:** ver B-04. Queda una orden para el dueño.

### Objeciones al plan

- **O-01 — `AGENTS.md` §11 ya está desactualizado** en los contadores ahead/behind (decía
  `components` 0 behind, `tw-theme/v1` 9 behind; hoy 1 y 10, por el merge de la PR #24).
  Cualquier tabla de ahead/behind en documentación caduca al siguiente merge. Corregida en T6,
  pero conviene no volver a fijar esos números a mano.
- **O-02 — AC3 y AC4 están redactados como condicionales** ("si entra `components`"). Al
  decidir D-03/D-07 (la paleta no entra), se cumplen por construcción y no por arreglo. Se
  verifican igualmente con grep para que la evidencia sea real y no un argumento.

### Gaps (fuera de alcance, para el backlog)

- **G-01** — `pnpm lint` falla en `develop` (B-02): 5 errores preexistentes. Candidato a lote
  propio o a L2.
- **G-02** — **`ci.yml` sólo se dispara en PRs hacia `main`** (`on: pull_request: branches: [main]`).
  Con `develop` como rama de integración, **ninguna PR de lote ejecutará CI**. Es un agujero en
  el modelo de ramas que este lote adopta. No se toca (el prompt prohíbe tocar CI), pero
  invalida la señal de CI de todas las PRs de lote hasta que se arregle.
- **G-03** — Existe un fixture e2e `react-components/` (App.tsx + Vite + tema custom `brand`)
  en `copilot/update-react-to-19-0-3` que `develop` no tiene y que `AGENTS.md` §11 no menciona.
  Es material directo para el fixture que pide L1 y para la app de ejemplo de L9. Rescatado a
  `@docs/salvage/`.
- **G-04** — No existe script `typecheck` en la raíz ni en `@ownui/tw-theme`; sólo en los tres
  paquetes de componentes. La verificación de tipos del paquete más crítico es manual
  (`tsc --noEmit -p packages/tw-theme/tsconfig.json`). Candidato a L3.
- **G-05** — `packages/tw-theme/src/themes/rootColors.ts` define `--color-base-200: #000000`
  y `--color-base-content: #ffffff`: una superficie **negra** con texto blanco como base de
  ambos temas, incluido el claro. El `button.css` rescatado usa `--color-base-200` como color
  del botón neutro por defecto, así que el botón por defecto sale negro en tema claro. No es
  regresión de este lote (ya pasaba), pero confirma que la escala de superficies del lote 4
  es más urgente de lo que parece.

---

## 10. Log cronológico

| #   | Hecho                                                                                                                                                                                                                                                                                                                        |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Repo clonado; `gh repo clone` falla porque GraphQL está bloqueado en estas sesiones → `git clone` directo.                                                                                                                                                                                                                   |
| 2   | `develop` confirmada (existe, en `70d1d22`, idéntica a `main`). Rama `claude/lote-0` creada desde ella.                                                                                                                                                                                                                      |
| 3   | `{{N}}` sin sustituir en el prompt → resuelto a 0 (D-01).                                                                                                                                                                                                                                                                    |
| 4   | `pnpm install --frozen-lockfile` en verde. Baseline: `pnpm test` 3 suites / 25 tests OK; `pnpm lint` **falla** con 5 errores preexistentes (B-02).                                                                                                                                                                           |
| 5   | Inventario de las 14 ramas remotas re-medido; `AGENTS.md` §11 estaba desactualizado (O-01).                                                                                                                                                                                                                                  |
| 6   | `claude/great-archimedes-5f008a` verificada como redundante: su árbol es idéntico a `develop`.                                                                                                                                                                                                                               |
| 7   | Hallazgo: fixture e2e `react-components/` rescatable, no documentado en §11 (G-03).                                                                                                                                                                                                                                          |
| 8   | **T1** `ae94ea4`: `CLAUDE.md` + spec con inventario y decisiones.                                                                                                                                                                                                                                                            |
| 9   | **T2** `41796fd`: fix de `getThemeNameConfig` + 10 tests. Comprobado con `git stash` que 5 de ellos fallan contra el código sin arreglar — no son tests de adorno.                                                                                                                                                           |
| 10  | **T3** `aecdf17`: 5 tokens de estado. Se montó el runner e2e (el entorno no traía el build de Chromium que pide el repo; se resolvió con un config temporal fuera del repo y un servidor estático propio, sin tocar `e2e/playwright.config.ts`). 80/80 e2e en verde.                                                         |
| 11  | **T4** `2f6e5fd`: `button.css` reconciliado. Verificado con estilos computados en Chromium; así se encontró y arregló el orden del bloque `:disabled` (D-11).                                                                                                                                                                |
| 12  | **T5** `e54ad83`: insumos rescatados, ficha del L0 cerrada, contenido trasladado al L1, script de limpieza. El propio script, en dry-run, **destapó un error mío**: usaba un diff de dos puntos para decidir si una rama aporta algo, que da falso positivo en ramas muy atrasadas. Corregido a dos pruebas complementarias. |
| 13  | **T6** `5317df7`: `AGENTS.md` §4.1/§4.3/§4.8/§6.5/§9.10/§11 al día.                                                                                                                                                                                                                                                          |
| 14  | **T7** `ddaaa15`: el fixture rescatado pasa a Markdown al detectar que añadía 69 warnings de lint (D-12); changeset del lote.                                                                                                                                                                                                |
| 15  | Fase final: rebase sobre `develop` (sin conflictos, no había avanzado), suite completa, verificación de los 6 criterios y cierre de esta spec.                                                                                                                                                                               |

---

## 11. Anexo: salida de las verificaciones

### AC3 — referencias a `--color-*-focus`

```
tokens -focus definidos en themes/:     8
tokens -focus referenciados en src/:    8
referenciados y NO definidos:          (vacío)
```

### AC4 — pares `-content` frente a su color base

```
tema light:                                           tema dark:
  primary    #3b82f6  content #ffffff  focus #2563eb    primary    #60a5fa  content #1e293b  focus #3b82f6
  secondary  #10b981  content #ffffff  focus #059669    secondary  #34d399  content #1e293b  focus #10b981
  accent     #8b5cf6  content #ffffff  focus #7c3aed    accent     #a78bfa  content #1e293b  focus #8b5cf6
  neutral    #6b7280  content #ffffff  focus #4b5563    neutral    #9ca3af  content #1e293b  focus #6b7280
  info       #0ea5e9  content #ffffff  focus #0284c7    info       #38bdf8  content #1e293b  focus #0ea5e9
  success    #22c55e  content #ffffff  focus #16a34a    success    #4ade80  content #1e293b  focus #22c55e
  warning    #f59e0b  content #ffffff  focus #d97706    warning    #fbbf24  content #1e293b  focus #f59e0b
  error      #ef4444  content #ffffff  focus #dc2626    error      #f87171  content #1e293b  focus #ef4444
=> 16 pares comprobados, 0 colisiones
```

Nota para el lote 22: que ningún `-content` **colisione** no significa que contraste. El patrón
`-content: #ffffff` uniforme del tema light sigue dando ratios por debajo de WCAG AA
(`warning` 2.15:1, `success` 2.28:1, `primary` 3.68:1, ya medidos en §9.10 de `AGENTS.md`).
AC4 pregunta por colisiones, y de eso no hay ninguna.

### Tests

```
Test Suites: 4 passed, 4 total
Tests:       35 passed, 35 total      (antes del lote: 3 suites, 25 tests)

e2e (Chromium, CSS compilado):  80 passed
```

---

## 12. Cuerpo de la PR (no se pudo abrir: ver B-03)

> Destino: `claude/lote-0` → **`develop`** (nunca `main`). Lista para revisión, no borrador.
> Título sugerido: `feat(lote-0): reconciliar las ramas sin mergear`

### Resumen

Primer lote del plan de construcción, y el que `@docs/BUILD-BATCHES.md` exige antes que
cualquier otro: `main` no era el estado más avanzado del repo y había dos ramas con trabajo
real que se solapaba con los lotes 1, 4 y 5. Este lote decide qué se rescata de cada una de las
14 ramas remotas, rescata lo que vale y documenta el resto.

**La decisión que lo articula todo:** la rama `components` traía dos mejoras claras (tokens de
estado y un `button.css` mucho mejor) y tres regresiones. Al separar la paleta de marca —que es
una decisión de producto, no técnica— del resto, **las tres regresiones desaparecen solas**:
existían porque esa rama borraba los 8 tokens `--color-*-focus` de los que su propio CSS
dependía. No hubo que parchear nada, sólo no adoptar la paleta.

8 commits, una task cada uno. Ningún cambio en `packages/ui/`.

### Criterios de aceptación

| ID  | Criterio                                            | Veredicto                      | Evidencia                                                                                                                                                                                                                                                                                          |
| --- | --------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1 | Decisión escrita para cada una de las 14 ramas      | ✅                             | `specs/lote-0.md` §6 y `AGENTS.md` §11                                                                                                                                                                                                                                                             |
| AC2 | `tw-theme/v1` integrado o trasladado al lote 1      | ✅                             | Fix de `getThemeNameConfig` + 10 tests; **5 fallan sin el fix** (comprobado). Publicación de CSS trasladada a la ficha del L1, con el export corregido                                                                                                                                             |
| AC3 | Ningún `--color-*-focus` referenciado e inexistente | ✅                             | 8 referenciados = 8 definidos; `comm -23` vacío                                                                                                                                                                                                                                                    |
| AC4 | Ningún `-content` igual a su color base             | ✅                             | 16 pares comprobados, 0 colisiones                                                                                                                                                                                                                                                                 |
| AC5 | Remoto sin ramas muertas                            | ❌ **NO CUMPLIDO, deliberado** | Borrar ramas es destructivo y pasaría por delante del único gate acordado. Se entrega `scripts/cleanup-dead-branches.sh`, verificado en dry-run. Ver D-09 · **Actualización 2026-11-19:** P-03 aprobada, pero el borrado falla con 403 desde el proxy git de la sesión (B-04): queda para el dueño |
| AC6 | `AGENTS.md` §4 y §11 al día                         | ✅                             | §4.1, §4.3, §4.8, §6.5, §9.10 y §11 reescritas                                                                                                                                                                                                                                                     |

Suite completa: **35 tests** unitarios (eran 25) y **80/80 e2e** sobre CSS compilado en
Chromium, build en verde, `tsc` de `tw-theme` limpio. `pnpm lint` sigue fallando **exactamente
igual que en `develop`** (5 errores preexistentes, fuera de alcance): el lote no añade ni un
warning.

### Decisiones clave

Las 12 están en `specs/lote-0.md` §7, con contexto, opciones, razón y reversibilidad. Las que
cambian el producto:

- **D-07 — la paleta de marca no se adopta.** Es una decisión de producto, y tal como venía era
  defectuosa: `--color-accent` idéntico a `--color-primary`, y `--color-accent-content` idéntico
  a `--color-accent` (contraste 1:1, texto invisible).
- **D-04 — el cambio de semántica `:where(root)` no se adopta.** Un tema custom `--default`
  sigue pintando la raíz. Cambiarlo es observable y pide fixture e2e.
- **D-08 — React 19.0.3 no se adopta.** La línea publicada va por 19.3.1, y hoy los tests de
  componentes no se ejecutan (§9.2): subir React sin tests sería a ciegas.
- **D-09 — no se borra ninguna rama.** Se entrega el script.
- **D-11 — el bloque `:disabled` de `button.css` se mueve al final de la cascada.** Tenía la
  misma especificidad que `.btn-primary`, así que el rol le ganaba por orden y el botón
  deshabilitado seguía pintado. Se encontró leyendo estilos computados, no el código.

### Bloqueantes, preguntas abiertas y gaps

Detalle en `specs/lote-0.md` §8 y §9.

**Necesitan tu decisión:**

1. **P-02 — ¿cuál es la paleta de marca definitiva?** Hace falta la paleta real con sus
   `-content` y `-focus`. Mientras no esté, `components` no se puede borrar.
2. **P-01 — ¿un tema custom `--default` debe pintar la raíz?** Define si un tema custom es "el
   tema del sitio" o "un tema que hay que activar".
3. **P-03 — ¿se ejecuta el borrado de las 11 ramas muertas?** Una orden:
   `./scripts/cleanup-dead-branches.sh --execute`.

**Gaps fuera de alcance** (G-01…G-05), de los que destaco dos:

- **G-02 — `ci.yml` sólo se dispara en PRs hacia `main`.** Con `develop` como rama de
  integración, **esta PR no ejecutará CI**: la ausencia de checks no significa verde. No se tocó
  porque el lote tiene prohibido tocar CI.
- **G-05 — `--color-base-200` es `#000000`** en ambos temas, y el `button.css` rescatado lo usa
  como relleno del botón neutro, así que ese botón sale negro en tema claro. No es regresión
  (ya pasaba), pero hace el lote 4 más urgente de lo que parecía.

### Impacto de versión

**minor** para `@ownui/tw-theme` (changeset `lote-0-reconciliacion.md`). Trae dos cambios de
comportamiento, ambos derivados del fix del flag de tema:

1. Un tema con `--prefersdark` **cambia de sitio**: antes pintaba la raíz (por el bug), ahora va
   dentro de `@media (prefers-color-scheme: dark)`, que es lo que declaraba.
2. Un flag desconocido ahora **aborta el build** con `Invalid theme name configuration` en vez
   de degradarse en silencio a `--default`.

Si consideras que (2) rompe compatibilidad, el changeset debería subirse a **major** antes de
publicar. `css/button.css` **no** afecta al paquete publicado: sigue sin incluirse en `dist/`
(es el bug §9.1, que resuelve el lote 1).

### Cómo verificarlo en local

```bash
git checkout claude/lote-0
pnpm install --frozen-lockfile

pnpm test                                   # 4 suites, 35 tests
pnpm build                                  # @ownui/tw-theme
npx tsc --noEmit -p packages/tw-theme/tsconfig.json

cd packages/tw-theme && pnpm e2e            # 80 tests en Chromium
```

Para comprobar que los tests del fix no son de adorno, quítalo y vuelve a correrlos: 5 de los
10 deben fallar.

```bash
git stash push packages/tw-theme/src/theme.ts
npx jest --selectProjects tw-theme --coverage=false packages/tw-theme/src/__tests__/theme.test.ts
git stash pop
```

AC3 y AC4, que son los que se cumplen "por construcción", se verifican así:

```bash
# AC3: todo --color-*-focus referenciado debe existir en themes/
diff <(grep -rhoE '\-\-color-[a-z]+-focus' packages/tw-theme/src/{css,variants,utilities} | sort -u) \
     <(grep -rhoE '"--color-[a-z]+-focus"' packages/tw-theme/src/themes/ | tr -d '"' | sort -u)
```

> `pnpm lint` falla también en `develop`: 5 errores preexistentes en `jest.setup.js` y
> `Dropdown.stories.tsx`, fuera del alcance de este lote.

### Próximo paso

**No mergear sin decidir P-01 y P-02.** El lote siguiente es el **L1** (publicar el CSS de
componentes), que ya tiene en su ficha el snippet corregido y el fixture rescatado.
