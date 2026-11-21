# Lote 6 — Dropdown: CSS de menu y trigger

## 1. Meta

| Campo           | Valor                                                                           |
| --------------- | ------------------------------------------------------------------------------- |
| Lote            | **L6** — Dropdown: CSS de menu y trigger (`@docs/BUILD-BATCHES.md` §L6)         |
| Rama base       | `develop` (en `0afe779`, lote 4). **Integrado después `0366c3d`**, que trae el lote 5 |
| Rama de trabajo | `claude/lote-6`                                                                 |
| Estado general  | **COMPLETO** — 7 tasks, 0 bloqueadas, 5/5 criterios cumplidos. Incluye las dos decisiones de la revisión (D-08, D-09) |
| Fecha           | 2026-11-21                                                                      |
| PR              | [#33 → `develop`](https://github.com/ferbbo/own-ui/pull/33) — listo para revisión |

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
| S01 | `.dropdown` pasa a ser wrapper de posicionamiento (sin superficie propia) y declara los tokens del componente | AC1, AC2 | `src/css/dropdown.css` | — | HECHO |
| S02 | `.dropdown-trigger` + `.dropdown-trigger-active` con cascada de custom properties y `:focus-visible` | AC2 | `src/css/dropdown.css` | S01 | HECHO |
| S03 | `.dropdown-menu`: panel absoluto, `z-index`, `min-width`, elevación, radio y superficie       | AC1, AC2 | `src/css/dropdown.css` | S01 | HECHO |
| S04 | `.dropdown-menu-open` / `-closed` + `prefers-reduced-motion`                                  | AC2, AC4 | `src/css/dropdown.css` | S03 | HECHO |
| S05 | Las 8 variantes semánticas en los dos niveles (`.dropdown-*` y `.dropdown-menu-*`)            | AC2, AC3 | `src/css/dropdown.css` | S01 | HECHO |
| S06 | Variantes de tamaño en los dos niveles + tamaño de texto del item por token                   | AC2 | `src/css/dropdown.css` | S01 | HECHO |
| S07 | Variantes de estilo (`ghost`/`bordered`/`compact`) en los dos niveles, aplicadas al panel      | AC2 | `src/css/dropdown.css` | S03 | HECHO |
| S08 | `.dropdown-open` con significado real (contexto de apilamiento mientras está abierto)         | AC2 | `src/css/dropdown.css` | S01 | HECHO |
| S09 | `variants/dropdown.ts` alineado con el contrato real                                          | AC2 | `src/variants/dropdown.ts` | S01–S08 | HECHO |
| S10 | Test de contrato: literales de `useDropdown.tsx` ⇄ `dropdown.css` ⇄ `variants/dropdown.ts`    | AC2 | `src/__tests__/dropdown-contract.test.ts` (nuevo) | S09 | HECHO |
| S11 | Fixture e2e `dropdown/`                                                                       | AC1, AC3, AC4 | `e2e/fixtures/dropdown/*` | S01–S08 | HECHO |
| S12 | Spec e2e sobre estilos computados en Chromium                                                 | AC1, AC3, AC4 | `e2e/tests/dropdown.spec.ts` | S11 | HECHO |
| S13 | Adaptar el fixture `base-surfaces` a la nueva semántica de `.dropdown`                        | AC1 | `e2e/fixtures/base-surfaces/index.html`, `e2e/tests/base-surfaces.spec.ts` | S01 | HECHO |
| S14 | Stories: `AllVariants` con las 8, `AllSizes` con las 5, nueva `StyleVariants`                  | AC5 | `Dropdown.stories.tsx` | S05–S07 | HECHO |
| S15 | `AGENTS.md` al día (§4.8 y §9.7)                                                              | — | `AGENTS.md` | S01–S13 | HECHO |
| S16 | Changeset con el impacto de versión                                                           | — | `.changeset/lote-6-*.md` | S01–S15 | HECHO |
| S17 | **D-09** El rol semántico pasa a ser acento: panel neutro, color sólo en el item activo        | AC3 | `src/css/dropdown.css`, `src/__tests__/dropdown-contract.test.ts`, `e2e/fixtures/dropdown/`, `e2e/tests/dropdown.spec.ts` | S01–S12 | HECHO |
| S18 | **D-08** El trigger reutiliza `.btn`                                                           | AC2, AC3 | `useDropdown.tsx`, `src/css/dropdown.css`, `src/css/index.css`, test de contrato, fixture y spec e2e, `Dropdown.test.tsx` | S01–S12 | HECHO |
| S19 | Documentación de las dos decisiones (`AGENTS.md`, changeset, stories, spec)                   | — | `AGENTS.md`, `.changeset/`, `Dropdown.stories.tsx`, `specs/lote-6.md` | S17, S18 | HECHO |

---

## 4. Tabla de TASKS

| ID  | Slices        | Predecesora | Modo + justificación | Commit | Estado |
| --- | ------------- | ----------- | -------------------- | ------ | ------ |
| T1  | S01–S08       | —           | **SECUENCIAL** — es la base: un solo archivo (`dropdown.css`) y todo lo demás lo verifica. Partirlo por slice daría 8 commits sobre el mismo archivo sin ningún punto verificable intermedio | `e8aa686` | HECHO |
| T2  | S09, S10      | T1          | **SECUENCIAL** — el test cruza los selectores que escribe T1; sin T1 fallaría por construcción | `ecd566b` | HECHO |
| T3  | S11, S12, S13 | T1          | **PARALELO posible** con T2 y T4 — analizado: T2 toca `src/variants` y `src/__tests__`, T3 sólo `e2e/`, T4 sólo `packages/ui`; cero archivos en común y cero imports entre ellas. Ejecutadas en serie por un único agente (una task = un commit, y el coste de coordinar worktrees supera el de esperar ~20 s de suite) | `e89d0ba` | HECHO |
| T4  | S14           | T1          | **PARALELO posible** con T2 y T3 (único archivo, en otro paquete) — misma justificación que T3 | `2f1ac9b` | HECHO |
| T5  | S15, S16      | T1–T4       | **SECUENCIAL** — documenta y versiona el resultado de las cuatro | `594e0c1` | HECHO |
| T6  | S17, S18      | T5          | **SECUENCIAL** — las dos decisiones de la revisión se cruzan en los mismos cuatro archivos (`dropdown.css`, test de contrato, fixture y spec e2e); separarlas daría dos commits que no compilan por sí solos | `4caeacd` | HECHO |
| T7  | S19           | T6          | **SECUENCIAL** — documenta el resultado de T6 | `(este commit)` | HECHO |

---

## 5. Checklist de criterios de aceptación

| ID  | Criterio | Estado | Evidencia |
| --- | -------- | ------ | --------- |
| AC1 | Menú abierto: `position` = `absolute` y `box-shadow` ≠ `none` | ✅ **CUMPLIDO** | `e89d0ba` — `e2e/tests/dropdown.spec.ts`, bloque «AC-1: el panel abierto se posiciona y se eleva» (6 tests). Mide `position`, `box-shadow`, `z-index` resuelto, que el panel flote bajo el trigger (`getBoundingClientRect`) y que el wrapper no crezca. Fixture `e2e/fixtures/dropdown/`. Verificado en Chromium: 23/23 en verde |
| AC2 | Ninguna clase emitida por los hooks carece de selector | ✅ **CUMPLIDO** | `ecd566b` — `src/__tests__/dropdown-contract.test.ts`. No usa lista escrita a mano: extrae los literales de `useDropdown.tsx` y expande las 6 plantillas `dropdown-${…}` con las uniones reales de `Dropdown.types.ts` (40 clases), y las cruza contra los selectores de `dropdown.css` **y** contra `variants/dropdown.ts`. Incluye la comprobación inversa (CSS que nadie declara) |
| AC3 | Las 8 variantes semánticas aplican color distinto | ✅ **CUMPLIDO** | `e8aa686` (CSS) + `e89d0ba` (spec), **revisado en `4caeacd`** — tras D-09 el rol es acento: el bloque «AC-3» mide el **item activo** de cada rol (pinta su token leído del `:root`, los 8 distintos entre sí, texto con su `-content`) y el trigger de cada rol (`btn-{rol}`). Se añade el bloque «D-09», que comprueba lo contrario para el panel: los 8 paneles pintan `--color-base-100`, son iguales al panel sin variante, y el texto del item **pasa WCAG AA en las ocho** |
| AC4 | Con `prefers-reduced-motion: reduce` la transición se anula | ✅ **CUMPLIDO** | `e89d0ba` — bloque «AC-4»: con `emulateMedia({ reducedMotion: "reduce" })`, `transition-duration` es `0s` en panel, trigger e item, y el panel sigue visible. Este criterio **cazó una regresión real**: el bloque estaba antes de las reglas del item y perdía por orden de aparición (ver §9, log) |
| AC5 | Story `AllVariants` muestra las 8 | ✅ **CUMPLIDO** | `2f1ac9b` — `Dropdown.stories.tsx`: `AllVariants` itera `VARIANTS`, derivado de `DropdownVariant` (8). `AllSizes` pasa de 3 a 5 y se añade `StyleVariants` |

### Fuera de los criterios del backlog, verificado igualmente

| Comprobación | Evidencia |
| --- | --- |
| El wrapper `.dropdown` no pinta (cambio de semántica D-02) | `e89d0ba` — test «el wrapper .dropdown no pinta: solo posiciona»: `background-color` transparente, `box-shadow: none`, `position: relative` |
| Menú cerrado oculto y sin eventos | `e89d0ba` — `visibility: hidden`, `opacity: 0`, `pointer-events: none` |
| Variantes de estilo aplicadas al panel | `e89d0ba` — `ghost` sin superficie ni sombra, `bordered` con borde en el panel y no en el wrapper, `compact` con menos relleno |
| Escala de tamaños del trigger igual a la de `.btn` | `e89d0ba` — 24/32/40/48/56 px |
| `data-theme="dark"` cambia el panel | `e89d0ba` — 2 tests (superficie y rol primary) |
| El trigger se pinta con `button.css` (D-08) | `4caeacd` — bloque «D-08» del spec e2e: altura 40px, relleno 16px y radio 6px vienen de `btn-md`, y `dropdown.css` sólo añade `justify-content: space-between` y el ancho del wrapper. Más el bloque «D-08» del test de contrato, que cruza las clases que el trigger emite contra `button.css` |
| Suite completa en verde | **138** unitarios (122 en la línea base), **144** e2e (116 en la base), `pnpm lint` en **código 0** (en `develop` salía 1), `pnpm build` de los 6 paquetes |

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

### D-05 — El impacto de versión se declara `minor`, no `major`

- **Contexto.** Mover la superficie de `.dropdown` a `.dropdown-menu` (D-02) retira fondo,
  relleno y sombra de un selector público. Para quien considere el CSS publicado como API,
  eso es *breaking*.
- **Opciones.** (a) `major` en `@ownui/tw-theme` (hoy 1.0.1 → 2.0.0). (b) `minor`, declarando
  el cambio observable de forma destacada en el changeset.
- **Decisión.** (b) `minor` para `@ownui/tw-theme` y `patch` para `@ownui/dropdown`.
- **Razón.** Coherencia con el precedente del lote 4, que también trasladó tokens de sitio
  (de `:root` a los temas) con impacto observable y se declaró `minor`; y porque las clases
  afectadas **nunca llegaron a funcionar como panel en un consumidor real** — `.dropdown` sólo
  pintaba dentro de Storybook hasta el lote 1, y el primer release con el CSS publicado es
  reciente. `@ownui/dropdown` se lleva `patch` porque su código no cambia (sólo stories), pero
  su apariencia sí.
- **Reversibilidad.** Total hasta que se publique: basta editar `.changeset/lote-6-*.md`.
  **Es el punto que más conviene revisar en el PR** — si se prefiere `major`, es un cambio de
  una línea en el changeset.

### D-06 — Se adapta el fixture del lote 4 en vez de conservar el fondo del wrapper

- **Contexto.** El lote 4 dejó un criterio (AC-3) que afirma que `.dropdown` tiene fondo, medido
  sobre el fixture `base-surfaces`. D-02 se lo quita.
- **Opciones.** (a) Dejar fondo en `.dropdown` para no tocar el fixture ajeno: vuelve el doble
  panel. (b) Mover la medición al panel conservando los mismos `id`, para que los asserts del
  lote 4 no cambien. (c) Borrar esos tests.
- **Decisión.** (b).
- **Razón.** La *intención* del criterio del lote 4 era "una superficie resuelve
  `--color-base-100` y sigue al tema", no "el selector se llama `.dropdown`". Con el panel
  dentro de un wrapper y los ids intactos, los cuatro asserts (fondo claro, fondo oscuro,
  item, contraste WCAG AA) siguen verificando lo mismo. Sólo cambia el HTML del fixture y dos
  títulos de `describe`.
- **Reversibilidad.** Total.

### D-07 — El hook sigue construyendo las clases a mano

- **Contexto.** `useDropdown.tsx` compone las clases con plantillas (`dropdown-${variant}`) en
  vez de leer `variants/dropdown.ts`, como sí hace `useButton`.
- **Opciones.** (a) Rewirear el hook en este lote. (b) Dejarlo y cubrir la coherencia con el
  test de contrato.
- **Decisión.** (b).
- **Razón.** El alcance del lote es CSS; el lote 7 va a reescribir esos hooks completos
  (higiene de props, teclado, `aria-controls`) y hacerlo ahora garantiza conflicto. El riesgo
  que justificaba el rewire — que hook y contrato divergieran — queda cubierto por el test,
  que falla si se separan.
- **Reversibilidad.** Total; queda anotado como gap **G-06** para el lote 7.

### D-08 — El trigger reutiliza `.btn` *(decisión del usuario en la revisión)*

- **Contexto.** Pregunta abierta 3 del PR #33: `.dropdown-trigger` reimplementaba superficie,
  tamaños y foco que `button.css` ya resuelve. Respuesta: **sí**, reutilizarlo.
- **Opciones de implementación.** (a) Exigir al consumidor que añada `btn` a mano en el
  trigger: rompe a quien ya lo usa y deja el estilo a medias por defecto. (b) Que
  `dropdown.css` copie las reglas de `.btn` con otro nombre: es lo que había. (c) Que el hook
  emita las clases del Button leyendo su contrato.
- **Decisión.** (c): `useDropdownTrigger` emite
  `btn btn-{rol} btn-{tamaño} dropdown-trigger`, y `dropdown.css` se queda sólo con
  `width: 100%`, `justify-content: space-between` y `.dropdown-trigger-active`, que remapea
  los tokens `--btn-*`.
- **Razón.** Es la única que no duplica CSS ni pide trabajo al consumidor, y arregla de paso
  G-01 de `specs/lote-2.md` (el trigger no heredaba ningún estilo semántico). ~80 líneas menos.
- **Consecuencias que acepto explícitamente.** (1) El contrato del Dropdown pasa a ser
  **cruzado** con el del Button: cubierto por el bloque «D-08» del test de contrato.
  (2) El orden de los `@import` de `index.css` pasa a ser funcional: cubierto por el spec e2e.
  (3) Contradice D-07 de este mismo lote (no tocar el hook), que decidí para no chocar con el
  lote 7 — pero la decisión del usuario manda y el lote 7 tendrá que partir de aquí.
- **Reversibilidad.** Media: volver atrás es restaurar el bloque de trigger en `dropdown.css`
  y el `triggerClasses` anterior, los dos en el historial de este lote.

### D-09 — El rol semántico es acento, no superficie *(decisión del usuario en la revisión)*

- **Contexto.** Pregunta abierta 2 del PR #33: el panel se pintaba entero del color del rol.
  Respuesta: **panel neutro, con el rol sólo en el item activo.**
- **Decisión.** Las 8 variantes fijan `--dropdown-role` / `--dropdown-role-content` /
  `--dropdown-focus-color` y dejan de tocar `--dropdown-color` (la superficie). El acento lo
  consumen el item activo, el anillo de foco y el trigger (vía su `btn-{rol}`). Sin variante,
  el item activo cae al realce neutro por `color-mix` que ya existía.
- **Razón, además de la estética.** Resuelve la objeción **O-01** de este lote sin tocar la
  paleta: con panel sólido, `warning` y `success` ponían texto blanco sobre relleno claro
  (≈2.15:1 y ≈2.28:1, por debajo del 4.5:1 de AA) y el CSS no podía arreglarlo. Con panel
  neutro el texto del menú es `--color-base-content` sobre `--color-base-100` y **pasa AA en
  las ocho variantes**, medido en Chromium. El par rol/`-content` sólo queda expuesto en la
  fila activa, que es una superficie pequeña; el arreglo de fondo sigue siendo el lote 22.
- **Reversibilidad.** Total: son 8 bloques de variante.

### D-10 — `@ownui/dropdown` sube de `patch` a `minor`

- **Contexto.** El usuario aprobó «minor + patch» (D-05) cuando el paquete `@ownui/dropdown`
  no tenía cambio de código, sólo stories. D-08 cambia `useDropdown.tsx`.
- **Decisión.** Mantener `@ownui/tw-theme` en `minor` (lo decidido) y subir `@ownui/dropdown`
  a `minor` en el changeset nuevo. Changesets se queda con el bump más alto.
- **Razón.** La premisa de aquel `patch` («su código no cambia») ya no se cumple; emitir
  clases nuevas es comportamiento añadido, que en semver es `minor`.
- **Reversibilidad.** Una línea de `.changeset/lote-6-trigger-btn-panel-neutro.md`.

---

## 7. Bloqueantes

**Ninguno.** Las 5 tasks se completaron; ninguna llegó a necesitar un segundo intento salvo T3
(ver §9: el spec e2e detectó una regresión de orden en el CSS y se corrigió dentro de la misma
task, antes del commit).

Incidencia de entorno resuelta sin tocar el repo: el Playwright del repo espera la build de
Chromium `1200` y la sesión trae la `1243` preinstalada en `/opt/pw-browsers`. Se resolvió con
un symlink **local de la sesión**; no hay cambio en el repo ni en CI, que instala su propio
navegador (`playwright install --with-deps chromium`). Anotado como **G-07** sólo para que
quien reproduzca la suite en otra máquina sepa a qué se debe.

---

## 8. Preguntas abiertas, objeciones y gaps

### Objeciones al lote tal como está especificado

- **O-01 — ✅ RESUELTA por D-09.** El criterio «las 8 variantes aplican color distinto» no
  decía nada del contraste, y con panel sólido el resultado era ilegible. Con el panel neutro,
  el texto del menú pasa AA en las ocho y hay un test e2e que lo mide. Queda expuesto sólo el
  par rol/`-content` de la fila activa, que sigue siendo cosa del lote 22. El texto original
  de la objeción, por si hace falta el contexto:

- **O-01 (original) — El criterio «las 8 variantes aplican color distinto» no dice nada del contraste.**
  Ya está cumplido, pero conviene saber qué significa: con la paleta actual, un panel
  `warning` o `success` lleva texto `#ffffff` encima de un relleno claro, y eso **no pasa
  WCAG AA** (`warning` ≈ 2.15:1, `success` ≈ 2.28:1, medidos en el lote 0). El CSS es
  correcto — usa el `-content` que el tema define — pero el resultado es ilegible. Deliberadamente
  **no** se añadió un assert de contraste a las 8 variantes del spec e2e: fallaría, y el
  arreglo es cambiar la paleta, que es el lote 22, no este. Si se quiere un gate antes,
  el sitio es `scripts/check-contrast.mjs`.

### Gaps (fuera de alcance, para lotes posteriores)

| ID | Hallazgo | Dónde corresponde |
| --- | --- | --- |
| G-01 | **La transición de apertura no se ve nunca en React.** `DropdownMenu` devuelve `null` cuando está cerrado, así que el panel se monta ya abierto y se desmonta al cerrar: ni la entrada ni la salida llegan a animarse. El CSS de `-closed` existe y está probado en el fixture, pero es inalcanzable desde el componente. El arreglo es mantener el menú montado (con `aria-hidden` y `pointer-events: none`, que ya están) o usar `@starting-style` | L7 (reescribe los hooks del Dropdown) |
| G-02 | Contraste de los roles claros sobre el panel (ver O-01) | L22 — auditoría WCAG AA |
| G-03 | Fuga de props al DOM: `DropdownContainer` sigue haciendo `{...restProps}` con `variant`, `size`, `styleVariant`, `open`… ⇒ avisos de React | L7 (§9.8) |
| G-04 | Sin navegación por teclado, sin `Esc`, sin click-outside, sin `aria-controls` | L7 (§9.8) |
| G-05 | El posicionamiento es sólo CSS: el panel siempre se abre hacia abajo y a la izquierda, sin detección de colisión con el viewport. Resolverlo bien pide estrategia JS (portal + floating), y es la misma que necesitarán Tooltip y Popover | L15, o L7 si se decide portalizar |
| G-06 | `useDropdown.tsx` no lee `variants/dropdown.ts` (D-07), y `useDropdownItem` devuelve `className` dentro de `itemProps`, a diferencia de los demás hooks | L7 |
| G-07 | Desajuste de build de Chromium entre el `playwright` del repo y el preinstalado en el entorno de sesión (ver §7) | — (entorno, no repo) |
| G-08 | `pnpm lint` tenía **4 errores** en `develop`, todos en `Dropdown.stories.tsx` (`useState` dentro de `render`). Al tocar ese archivo en T4 se arreglaron, así que `pnpm lint` ya sale en verde. Quedan **228 avisos** repo-wide, ninguno de este lote | L9 o un lote de higiene |
| G-09 | `AGENTS.md` no pasa `prettier --check` en `develop` (ya ocurría antes de este lote; `pnpm format` sólo cubre `src/**`) | L9 |
| G-11 | **`button.css` no tiene bloque `prefers-reduced-motion`.** El Dropdown se lo presta a su trigger (el bloque de `dropdown.css` incluye `.dropdown-trigger`), pero un `.btn` suelto sigue animando con `reduce` | Un lote de higiene del Button |
| G-12 | ✅ **Resuelto.** D-08 ata el Dropdown al contrato del Button, y el lote 5 se mergeó en `develop` mientras este lote estaba en revisión. Integrado y revalidado: conserva `theme` y `size`, el test de contrato pasa y la suite entera también. Queda como aviso para el futuro: cualquier cambio en esos dos mapas afecta al trigger del Dropdown | — |
| G-10 | **El build copia `src/css` → `dist/css` entero**, sin filtrar. Cualquier archivo que caiga en `src/css/` acaba publicado: lo descubrí al meter ahí el test de contrato (resuelto moviéndolo, ver §9). Convendría que el script de copia filtrase por extensión, o un test que compruebe el contenido de `dist/css` | L9, o el lote que vuelva a tocar el empaquetado |

### Preguntas abiertas (no bloquean; decididas con criterio y reversibles)

Las tres se resolvieron en la revisión del PR #33 (2026-11-21). Se dejan con su respuesta:

1. **¿`major` o `minor`?** → **`minor` + `patch`** (D-05 confirmada). Matiz posterior: D-08
   obliga a subir `@ownui/dropdown` a `minor` (D-10).
2. **¿Panel sólido del rol?** → **No: panel neutro, rol sólo en el item activo** (D-09).
3. **¿`.dropdown-trigger` reutiliza `.btn`?** → **Sí** (D-08).

Texto original de las preguntas:

1. **¿`major` o `minor`?** Ver D-05. Es la decisión con más consecuencias del lote y la única
   que cambia con una línea.
2. **¿El panel debe seguir mostrando el rol semántico como superficie sólida?** Hoy
   `variant="primary"` pinta el panel entero de azul y los items de azul con texto blanco. Es
   lo que ya hacía el CSS anterior para 4 roles y se ha mantenido para los 8 por coherencia,
   pero la alternativa habitual (daisyUI, HeroUI) es panel neutro con el rol sólo en el item
   activo. Cambiarlo es rehacer 8 bloques de variante, no el patrón.
3. **¿`.dropdown-trigger` debería ser `.btn`?** El trigger reimplementa superficie, tamaños y
   foco que `button.css` ya resuelve. Reutilizar `.btn` quitaría ~80 líneas, pero ataría el
   Dropdown al contrato del Button. No se tocó porque el hook emite `dropdown-trigger` y el
   alcance era darle CSS, no rediseñar el contrato.

---

## 9. Log cronológico

- **2026-11-21 ~18:45** — Fase 0. Verificado el estado del repo: `develop` existe en remoto con
  los lotes 0–4 mergeados (PRs #25–#29, #31); lote 5 entregado y abierto en el PR #32.
  Resuelto `{{N}}` → 6 (D-01). Rama `claude/lote-6` creada desde `origin/develop` (`0afe779`).
- **2026-11-21 ~18:50** — Línea base verde antes de tocar nada: `pnpm test` con 122 tests en 10
  suites. `pnpm lint` **no** estaba limpio: 4 errores preexistentes en `Dropdown.stories.tsx`
  (G-08).
- **2026-11-21 ~19:00** — Leído el contrato de las tres capas antes de escribir nada
  (regla §8.1 de `AGENTS.md`): `useDropdown.tsx`, `variants/dropdown.ts`, `dropdown.css`,
  `Dropdown.types.ts` y los dos fixtures e2e que ya medían `.dropdown` (lotes 1 y 4). De ahí
  salen D-02, D-03, D-04 y D-06.
- **2026-11-21 ~19:10** — **T1** (`e8aa686`): `dropdown.css` reescrito (224 → 567 líneas).
  Verificado que compila con la CLI de Tailwind y que las 42 clases aparecen en el CSS de
  salida antes de commitear.
- **2026-11-21 ~19:20** — **T2** (`ecd566b`): contrato + test. El test falló a la primera y
  **por un motivo útil**: capturaba `dropdown-x` y `dropdown-menu-x` de un ejemplo escrito en
  el comentario de cabecera del CSS. Se arregló quitando comentarios antes de extraer
  selectores, no relajando el assert.
- **2026-11-21 ~19:35** — **T3** (`e89d0ba`): fixture + spec e2e + adaptación de
  `base-surfaces`. Primera corrida: 22/23. El que falló fue justo el de AC4 — el item seguía
  con `transition-duration: 0.2s, 0.2s` bajo `reduce`, porque el bloque de movimiento reducido
  estaba **antes** de las reglas de `.dropdown-item` y, con la misma especificidad, perdía por
  orden de aparición. Movido al final del archivo con el porqué anotado en el CSS. Segunda
  corrida: 23/23, y 139/139 en la suite e2e completa.
- **2026-11-21 ~19:50** — **T4** (`2f1ac9b`): stories. Al extraer las tres stories con estado a
  componentes desaparecieron los 4 errores de ESLint de G-08: `pnpm lint` pasa a código 0.
- **2026-11-21 ~20:00** — **T5**: `AGENTS.md` (§4.7, §4.8 con la tabla de clases y la sección
  nueva de los tres niveles, §9.7 marcada como resuelta) y changeset.
- **2026-11-21 ~20:05** — Verificación de empaquetado en la fase final: el test de contrato
  estaba en `src/css/__tests__/`, y el build de `tw-theme` copia `src/css` → `dist/css` entero,
  así que el paquete publicado habría llevado un archivo de test dentro de `dist/css/`. Movido a
  `src/__tests__/`, junto a los demás tests del paquete. Comprobado después con
  `ls dist/css/`: sólo los cuatro `.css`. Lo detectó la revisión del `dist`, no un test:
  anotado como **G-10**.
- **2026-11-21 ~20:10** — Fase final: `develop` sin commits nuevos respecto a la base
  (`git rev-list --left-right --count origin/develop...HEAD` → `0 5`), así que no hubo nada que
  integrar ni conflictos que resolver. Suite completa en verde: `pnpm lint` (código 0),
  `pnpm test` (131), `pnpm --filter @ownui/tw-theme e2e` (139), `pnpm build` (6/6 paquetes) y
  `tsc --noEmit` del paquete Dropdown. Push y PR.
- **2026-11-21 ~20:20** — PR [#33](https://github.com/ferbbo/own-ui/pull/33) abierto hacia `develop`, listo para revisión. Sin merge: el gate es humano.
- **2026-11-21 ~20:35** — **CI en verde** sobre `d384c3a`:
  [run 32](https://github.com/ferbbo/own-ui/actions/runs/44939111735) (`conclusion: success`).
  Confirma la suite en el runner y no sólo en la sesión: es el único sitio donde los tests e2e
  corren con el navegador que instala el propio workflow, sin el symlink local de G-07.
- **2026-11-21 ~21:00** — **Revisión del usuario sobre el PR #33.** Tres respuestas:
  `minor`+`patch`, panel neutro con el rol sólo en el item activo, y sí a reutilizar `.btn` en
  el trigger. Implementadas como **T6** (`4caeacd`, D-08 y D-09) y documentadas en **T7**.
  El contraste del panel, que era la objeción O-01, queda resuelto de paso.
  Suite tras los cambios: 138 unitarios, 144 e2e, lint en código 0, build 6/6.
  Un fallo durante T6, corregido antes del commit: el assert de contraste nuevo usaba
  `window.contrastRatio`, que sólo existía en el fixture de `base-surfaces`; se añadieron los
  dos helpers al fixture del dropdown.
- **2026-11-21 ~21:30** — **El lote 5 se mergeó en `develop` (`0366c3d`, PR #32) mientras este
  lote estaba en revisión**, que es exactamente el riesgo anotado en G-12. Integrado en la rama
  con `git merge origin/develop`: **un conflicto, en `AGENTS.md`**, en dos pasajes donde los dos
  lotes describían el mismo contrato:
    · §4.7 — el lote 5 escribió que «`dropdown` queda fuera del test a propósito: hoy promete
      clases que su CSS no define, y repararlo es el lote 6». Resuelto combinando: ahora se
      documentan **los dos** tests de contrato y por qué el Dropdown necesita uno aparte
      (plantillas en vez de mapa, y contrato cruzado con `button.css`).
    · §4.8 — la tabla de clases: se queda la fila de `dropdown.css` de este lote (540 ln, tras
      el recorte de D-08) y la de `loader.css` del lote 5 (119 ln, con `.loader-current`).
  Actualizado también el comentario de `variants/__tests__/contract.test.ts` (del lote 5), que
  seguía diciendo que el Dropdown está fuera porque §9.7 estaba sin arreglar.
  Revalidación completa sobre el merge: **211** unitarios, **147** e2e, lint en código 0,
  build 6/6. El contrato cruzado del trigger sigue en pie: el lote 5 conserva `theme` y `size`.
