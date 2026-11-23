# Lote 12 — Card + Badge + Avatar

## 1. Meta

| Campo           | Valor                                                                   |
| --------------- | ----------------------------------------------------------------------- |
| Lote            | **L12** — Card + Badge + Avatar (`@docs/BUILD-BATCHES.md` §L12, FASE 3) |
| Rama base       | `develop` en `c3cb7f2` (merge del PR #37, lote 10)                      |
| Rama de trabajo | `claude/lote-12`                                                        |
| Estado general  | EN CURSO                                                                |
| Fecha           | 2026-11-23                                                              |
| PR              | _pendiente_                                                             |

> **El prompt del lote llegó con el parámetro sin sustituir** (`LOTE {{N}}`). La resolución a
> **L12** está documentada en **D-01**: no es una elección de alcance, es la lectura del estado
> del repo.

---

## 2. Criterios de segmentación aplicados

Los de `AGENTS.md` §7 y de la **plantilla estándar de FASE 3** de `@docs/BUILD-BATCHES.md`
(idénticos a los de los lotes 10 y 11): **slice** = unidad mínima verificable por sí sola;
**task** = grupo cohesivo de slices (mismo componente o mismos archivos), un commit cada una.

El orden dentro de cada componente es el invariante del repo: **CSS y contrato antes que React.**
Un componente cuyo CSS no está publicado no está hecho (lote 1).

### Criterios de aceptación

| ID   | Criterio (plantilla estándar de FASE 3)                                                                                                                                                               |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC1  | `pnpm check:contract` en verde para los tres componentes                                                                                                                                              |
| AC2  | Cada valor de cada prop de variante/tamaño aplica una clase que existe en el CSS                                                                                                                      |
| AC3  | 8 variantes semánticas (donde el componente es semántico), legibles en light y dark                                                                                                                   |
| AC4  | ARIA derivado del estado real; teclado completo donde el componente es interactivo                                                                                                                    |
| AC5  | `React.memo` + `useMemo` en clases + `forwardRef` que expone el nodo DOM                                                                                                                              |
| AC6  | Cobertura ≥90% de líneas de cada paquete nuevo                                                                                                                                                        |
| AC7  | Build con banner `"use client"`; `sideEffects: false`                                                                                                                                                 |
| AC8  | Ningún color literal fuera de `themes/*.ts`                                                                                                                                                           |
| AC9  | Contraste AA verificado donde el componente pinta texto sobre el color del rol                                                                                                                        |
| AC10 | Específicos de L12: Card compound (`Header`/`Body`/`Footer`); Badge con `outline`/`soft`; Avatar con imagen, iniciales, fallback y grupo; el lote **consume** la escala `base-100/200/300` del lote 4 |

---

## 3. Tabla de SLICES

| ID  | Descripción                                                                                                  | Criterios           | Archivos                                                                          | Depende de    | Estado    |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------- | --------------------------------------------------------------------------------- | ------------- | --------- |
| S01 | `css/card.css`: superficie, cascada de tokens y anatomía (`.card`, `-header`, `-body`, `-footer`, `-title`)  | AC2, AC8, AC10      | `packages/tw-theme/src/css/card.css`                                              | —             | HECHO     |
| S02 | Card: 8 roles sobre el **borde** + tratamientos `elevated`/`outlined`/`ghost` + tamaños `xs`–`xl`            | AC2, AC3            | idem                                                                              | S01           | HECHO     |
| S03 | Contrato `variants/card.ts` + registro en `variants/index.ts` y `css/index.css`                              | AC1, AC2            | `variants/card.ts`, `variants/index.ts`, `css/index.css`                          | S01, S02      | HECHO     |
| S04 | Paquete `@ownui/card` (package.json, tsconfig, tsup) y registros en `@ownui/ui`, Jest y `tsconfig.jest.json` | AC7                 | `packages/ui/src/Card/*`, `packages/ui/*`, `jest.config.js`, `tsconfig.jest.json` | S03           | HECHO     |
| S05 | `Card.types.ts` + `useCard.tsx` + `Card.tsx` con subcomponentes estáticos                                    | AC4, AC5, AC10      | `packages/ui/src/Card/src/*`                                                      | S04           | HECHO     |
| S06 | Tests RTL del Card y stories                                                                                 | AC2, AC5, AC6       | `Card/__test__`, `Card.stories.tsx`                                               | S05           | HECHO     |
| S07 | `css/badge.css`: relleno por rol, `outline`/`soft`, tamaños                                                  | AC2, AC3, AC8       | `packages/tw-theme/src/css/badge.css`                                             | —             | PENDIENTE |
| S08 | Contrato `variants/badge.ts` + registros                                                                     | AC1, AC2            | `variants/badge.ts`, `variants/index.ts`, `css/index.css`                         | S07           | PENDIENTE |
| S09 | Paquete `@ownui/badge` + tipos + hook + componente                                                           | AC5, AC7            | `packages/ui/src/Badge/*`                                                         | S08           | PENDIENTE |
| S10 | Tests RTL del Badge y stories                                                                                | AC2, AC5, AC6       | `Badge/__test__`, `Badge.stories.tsx`                                             | S09           | PENDIENTE |
| S11 | `css/avatar.css`: caja cuadrada, imagen, iniciales, grupo apilado, tamaños                                   | AC2, AC3, AC8       | `packages/tw-theme/src/css/avatar.css`                                            | —             | PENDIENTE |
| S12 | Contrato `variants/avatar.ts` + registros                                                                    | AC1, AC2            | `variants/avatar.ts`, `variants/index.ts`, `css/index.css`                        | S11           | PENDIENTE |
| S13 | Paquete `@ownui/avatar` + tipos + hook + componente + `Avatar.Group`                                         | AC4, AC5, AC7, AC10 | `packages/ui/src/Avatar/*`                                                        | S12           | PENDIENTE |
| S14 | Tests RTL del Avatar (incluido el fallback por `onError`) y stories                                          | AC2, AC4, AC5, AC6  | `Avatar/__test__`, `Avatar.stories.tsx`                                           | S13           | PENDIENTE |
| S15 | Fixtures e2e `card/`, `badge/`, `avatar/` + specs sobre el CSS publicado                                     | AC2, AC3, AC10      | `e2e/fixtures/*`, `e2e/tests/*.spec.ts`                                           | S03, S08, S12 | PENDIENTE |
| S16 | Contraste AA de Badge en los dos temas                                                                       | AC9                 | `scripts/check-contrast.mjs` (sólo lectura)                                       | S07           | PENDIENTE |
| S17 | Secciones de la app de ejemplo                                                                               | AC3                 | `apps/example-app/src/sections/*`, `App.tsx`                                      | S06, S10, S14 | PENDIENTE |
| S18 | `AGENTS.md`, `README.md`, changesets y cierre de la spec                                                     | —                   | `AGENTS.md`, `README.md`, `.changeset/*`, `specs/lote-12.md`                      | S17           | PENDIENTE |

---

## 4. Tabla de TASKS

| ID  | Slices        | Predecesora    | Modo + justificación                                                                                       | Commit | Estado    |
| --- | ------------- | -------------- | ---------------------------------------------------------------------------------------------------------- | ------ | --------- |
| T1  | S01–S03       | —              | SECUENCIAL. "CSS antes que React".                                                                         | —      | PENDIENTE |
| T2  | S04–S06       | T1             | SECUENCIAL: el hook importa el contrato de T1.                                                             | —      | PENDIENTE |
| T3  | S07, S08      | T1             | SECUENCIAL: toca `variants/index.ts` y `css/index.css`, los mismos archivos de registro que T1 (ver D-07). | —      | PENDIENTE |
| T4  | S09, S10, S16 | T3             | SECUENCIAL: el hook importa el contrato de T3; y toca los mismos registros que T2.                         | —      | PENDIENTE |
| T5  | S11, S12      | T3             | SECUENCIAL: mismos archivos de registro.                                                                   | —      | PENDIENTE |
| T6  | S13, S14      | T5             | SECUENCIAL: el hook importa el contrato de T5.                                                             | —      | PENDIENTE |
| T7  | S15           | T1, T3, T5     | SECUENCIAL: tres fixtures en el mismo directorio e2e, y el `compile-fixtures` los descubre solo.           | —      | PENDIENTE |
| T8  | S17, S18      | T2, T4, T6, T7 | SECUENCIAL: documenta lo que dejan las anteriores.                                                         | —      | PENDIENTE |

**Análisis de paralelismo.** Los tres componentes son independientes entre sí en su CSS, su
contrato y su paquete de React. Lo que los acopla son **cinco archivos de registro** que cada
uno tiene que tocar: `css/index.css`, `variants/index.ts`, `packages/ui/src/index.ts`,
`packages/ui/package.json`, `jest.config.js` y `tsconfig.jest.json`. Con la regla del prompt
("si hay dependencia o duda: SECUENCIAL, siempre") eso basta para descartar el paralelo. Ver
**D-07**.

---

## 5. Checklist de criterios de aceptación

_Se completa al cerrar el lote._

---

## 6. Decisiones tomadas

### D-01 — El lote se resuelve a L12

| Campo          | Valor                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contexto       | El prompt programado llegó con el parámetro sin sustituir: "Ejecuta el LOTE `{{N}}`". No hay número que leer.                                                                                                                                                                                                                                                                                                              |
| Opciones       | (a) Terminar sin hacer nada y pedir el número — descartado: el prompt prohíbe preguntar. (b) Repetir el último lote. (c) Deducir el siguiente lote pendiente del estado del repo.                                                                                                                                                                                                                                          |
| Decisión       | **(c)**: L12.                                                                                                                                                                                                                                                                                                                                                                                                              |
| Razón          | El inventario es inequívoco: `specs/` tiene de `lote-0.md` a `lote-10.md`; `origin` tiene ramas `claude/lote-0` … `claude/lote-11`; `develop` lleva mergeados los PR hasta el #37 (lote 10) y el **PR #38 (lote 11, Checkbox+Radio+Switch) está abierto** esperando revisión. El siguiente lote del backlog sin empezar es, por tanto, el **L12**. Que (b) repitiera trabajo ya entregado sería el peor resultado posible. |
| Reversibilidad | Total: si la intención era otro lote, esta rama se cierra y se abre la correcta; nada de lo que entrega es exclusivo de L12.                                                                                                                                                                                                                                                                                               |

### D-02 — Se parte de `develop`, no del PR #38 (lote 11) sin mergear

| Campo          | Valor                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Contexto       | El lote 11 (`@ownui/checkbox`, `@ownui/radio`, `@ownui/switch`) está entregado pero sin mergear: PR #38 abierto. El lote 10 hizo lo contrario (partió de la rama del PR anterior, ver `specs/lote-10.md` B-01).                                                                                                                                                                                                                            |
| Opciones       | (a) Partir de `claude/lote-11` para no quedarse atrás. (b) Partir de `develop`.                                                                                                                                                                                                                                                                                                                                                            |
| Decisión       | **(b)**.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| Razón          | L12 (Card/Badge/Avatar) **no depende** de L11: no comparte tokens (`--control-*` es de los marcables), ni CSS, ni contrato, ni paquete. Lo único que ambos tocan son los archivos de registro, y ahí un conflicto es trivial de resolver (una línea por componente). El lote 10 partió del PR anterior porque sí dependía de él (`base-100/200/300`). Encadenar ramas sin necesidad convierte la revisión de un PR en la revisión de tres. |
| Reversibilidad | Alta: si el PR #38 se mergea antes de esta revisión, la fase final de este lote trae `develop` y resuelve los registros.                                                                                                                                                                                                                                                                                                                   |

### D-03 — El Card es un compound **estático**: sin Provider ni contexto

| Campo          | Valor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contexto       | `AGENTS.md` §5.3 fija el umbral del patrón Provider: 3+ subcomponentes, estado compartido o prop drilling de más de dos niveles. El Card tiene cuatro subcomponentes (`Header`, `Title`, `Body`, `Footer`), así que el primer criterio se cumple.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Opciones       | (a) Provider + contexto, como el Dropdown. (b) Subcomponentes independientes que sólo emiten su clase.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Decisión       | **(b)**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Razón          | El umbral de §5.3 es una conjunción con sentido, no una suma de condiciones: el Provider existe para compartir **estado**, y el Card no tiene ninguno. Lo único que las partes necesitan del root es el tamaño y el rol, y eso ya viaja por la cascada de custom properties (`--card-p`, `--card-gap`, `--card-color`): montar un contexto de React para replicar lo que el CSS ya hace sería el "abstracción nueva de theming" que §8.4 prohíbe. Coste: una parte usada fuera de un `.card` se pinta con los valores por defecto en vez de avisar. Es un coste aceptable para un contenedor decorativo (y el Dropdown, que sí falla en voz alta, lo hace porque usarlo fuera del provider rompe funcionalidad, no estética). |
| Reversibilidad | Alta: añadir un Provider después no cambia la API pública, sólo añade comportamiento.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

### D-04 — `clickable` se **deriva del elemento**, no se pide por prop

| Campo          | Valor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Contexto       | Un card accionable (toda la tarjeta es un enlace) es uno de sus usos más comunes y necesita hover, elevación y anillo de foco. La forma directa sería una prop `clickable`.                                                                                                                                                                                                                                                                                                                      |
| Opciones       | (a) Prop `clickable` booleana que aplica `.card-clickable` sobre cualquier elemento. (b) Derivarlo: sólo `as="a"` y `as="button"` reciben el tratamiento.                                                                                                                                                                                                                                                                                                                                        |
| Decisión       | **(b)**.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Razón          | Con (a), `<Card clickable onClick={…}>` produce un `<div>` con `cursor: pointer` y hover que no es enfocable, no sale en el orden de tabulación y no responde a `Enter` — exactamente el antipatrón que `AGENTS.md` §8.5 prohíbe, y además invisible para quien lo escribe (se ve bien en el ratón). Con (b) es **imposible** tener un card que parezca pulsable sin serlo: el teclado, el foco y el rol los da el elemento nativo. La unión discriminada hace además que `as="a"` exija `href`. |
| Reversibilidad | Media: añadir la prop después sería retrocompatible, pero habría que decidir entonces qué se hace con el teclado. El test "un `<div>` nunca recibe .card-clickable" deja la decisión fijada en vez de implícita.                                                                                                                                                                                                                                                                                 |

### D-05 — Unión discriminada sobre `as`, no el patrón genérico

| Campo          | Valor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Contexto       | El repo tiene **dos** patrones polimórficos conviviendo (`AGENTS.md` §5.4): la unión discriminada del Button y el genérico `Props<T extends ElementType>` del Loader, que el andamio de `create-component` reproduce. El andamio generó el genérico.                                                                                                                                                                                                                                                                                           |
| Opciones       | (a) Dejar el genérico del andamio. (b) Reescribirlo como unión discriminada sobre `as`.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Decisión       | **(b)**, con `as` limitado a `div \| article \| section \| aside \| li \| a \| button`.                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Razón          | Con el genérico, `Meta<typeof Card>` de Storybook colapsa `T` a su default (`"div"`) y `as="a"` deja de typecheckear: el propio andamio no compila sus stories polimórficas. Pero la razón de fondo es de API: la unión permite exigir `href` en `as="a"` y prohibirlo en el resto, que es lo que hace falta para que D-04 sea verificable por tipos y no por convención. §5.4 ya recomienda unificar los dos patrones en el de la unión; este lote mueve el tercer componente polimórfico a ese lado en vez de añadir otro al lado contrario. |
| Reversibilidad | Media. La lista cerrada de elementos es ampliable sin romper nada; volver al genérico sí sería ruptura.                                                                                                                                                                                                                                                                                                                                                                                                                                        |

### D-07 — Las ocho tasks van en secuencial

| Campo          | Valor                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Contexto       | El prompt permite paralelizar tasks sin dependencia ni archivos en común.                                                                                                                                                                                                                                                                                                                                                                              |
| Opciones       | (a) Paralelizar los tres componentes en worktrees o subagentes e integrar antes de commitear. (b) Secuencial.                                                                                                                                                                                                                                                                                                                                          |
| Decisión       | **(b)**.                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Razón          | Los tres componentes comparten seis archivos de registro (`css/index.css`, `variants/index.ts`, `packages/ui/src/index.ts`, `packages/ui/package.json`, `jest.config.js`, `tsconfig.jest.json`), y `pnpm create-component` los edita por su cuenta: tres andamios en paralelo son tres ediciones concurrentes de los mismos seis archivos. La regla del prompt es explícita ante la duda. El coste del secuencial aquí es tiempo de reloj, no calidad. |
| Reversibilidad | N/A (decisión de proceso).                                                                                                                                                                                                                                                                                                                                                                                                                             |

---

## 7. Bloqueantes

_Ninguno por ahora._

---

## 8. Preguntas abiertas, objeciones y gaps

_Se completan durante la ejecución._

---

## 9. Log cronológico

| Momento | Hecho                                                                                                                                                                                                                                              |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fase 0  | `pnpm install` en limpio; baseline verde: `pnpm test` 307 tests en 16 suites, `pnpm check:contract` sin errores ni avisos, `pnpm build` 7/7 paquetes, `pnpm lint` 0 errores (100 avisos de Prettier preexistentes en archivos fuera de este lote). |
| Fase 0  | Rama `claude/lote-12` creada desde `origin/develop` (`c3cb7f2`). `CLAUDE.md` ya existe y apunta a `AGENTS.md`: no hace falta crearlo.                                                                                                              |
