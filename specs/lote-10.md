# Lote 10 — Input / Field

## 1. Meta

| Campo           | Valor                                                                           |
| --------------- | ------------------------------------------------------------------------------- |
| Lote            | **L10** — Input / Field (`@docs/BUILD-BATCHES.md` §L10). Abre la **FASE 3**.     |
| Rama base       | `claude/lote-9` en `778abb3`, que es el árbol del PR #36 a `develop` (ver **B-01**) |
| Rama de trabajo | `claude/lote-10`                                                                 |
| Estado general  | **COMPLETO** — 4 tasks, 0 bloqueadas, 9/9 criterios cumplidos                    |
| Fecha           | 2026-11-23                                                                       |
| PR              | _pendiente de que el PR #36 entre en `develop`_                                  |

---

## 2. Criterios de segmentación aplicados

Los mismos de los lotes 0–9: **slice** = unidad mínima verificable; **task** = grupo cohesivo
de slices, un commit cada una.

### Criterios de aceptación

El backlog define una **plantilla estándar** para todo lote de componente (L10–L19) y la ficha
de L10 añade lo específico.

| ID  | Criterio (plantilla estándar de FASE 3)                                                |
| --- | --------------------------------------------------------------------------------------- |
| AC1 | `pnpm check:contract` en verde                                                            |
| AC2 | Cada valor de cada prop de variante/tamaño aplica una clase que existe en el CSS          |
| AC3 | 8 variantes semánticas, legibles en light y dark                                          |
| AC4 | Hook de `@react-aria/*` apropiado; teclado completo; ARIA derivado del estado real        |
| AC5 | `React.memo` + `useMemo` en clases + `forwardRef` que expone el nodo DOM                  |
| AC6 | Cobertura ≥90% de líneas del paquete                                                      |
| AC7 | Build con banner `"use client"`; `sideEffects: false`                                     |
| AC8 | Ningún color literal fuera de `themes/*.ts`                                               |
| AC9 | Específicos de L10: `useTextField`; `:invalid`/`aria-invalid`; relación label ↔ control ↔ descripción ↔ error; `type` soportado; decidir si `Field` va aparte |

> El criterio "contraste AA verificado para las 8 variantes" de la plantilla **no aplica tal
> cual** a este componente y se documenta por qué en **O-01**: el Input no pinta texto sobre el
> color del rol, así que no hay par rol/`-content` que medir.

---

## 3. Tabla de SLICES

| ID  | Descripción | Criterios | Archivos | Depende de | Estado |
| --- | ----------- | --------- | -------- | ---------- | ------ |
| S01 | `css/input.css`: base, cascada de tokens y anatomía del campo | AC2, AC8 | `packages/tw-theme/src/css/input.css` | — | HECHO |
| S02 | 8 roles semánticos sobre el **borde** y el anillo de foco | AC3, AC8 | idem | S01 | HECHO |
| S03 | Tratamientos `outline` / `ghost` / `bordered` | AC2 | idem | S01 | HECHO |
| S04 | Tamaños `xs`–`xl` derivados de `--size-field` | AC2 | idem | S01 | HECHO |
| S05 | Estados `invalid` / `readonly` / `disabled` por `color-mix` | AC2 | idem | S01 | HECHO |
| S06 | Partes: `.input-field`, `-label`, `-control`, `-icon`, `-description`, `-error-message` | AC2 | idem | S01 | HECHO |
| S07 | Contrato `variants/input.ts` + registro en `variants/index.ts` y `css/index.css` | AC1, AC2 | `variants/input.ts`, `variants/index.ts`, `css/index.css` | S01–S06 | HECHO |
| S08 | Paquete `@ownui/input` (package.json, tsconfig, tsup) y registros en `@ownui/ui`, Jest y `tsconfig.jest.json` | AC7 | `packages/ui/src/Input/*`, `packages/ui/*`, `jest.config.js`, `tsconfig.jest.json` | S07 | HECHO |
| S09 | `Input.types.ts`: uniones cerradas y atributos nativos gestionados fuera | AC1, AC9 | `Input.types.ts` | S08 | HECHO |
| S10 | `useInput.tsx`: 5 pasos de §5.2 sobre `useTextField`, clases memoizadas, reparto de props | AC4, AC5, AC9 | `useInput.tsx` | S09 | HECHO |
| S11 | `Input.tsx`: `forwardRef` al `<input>` + `React.memo` | AC5 | `Input.tsx` | S10 | HECHO |
| S12 | 33 tests RTL de comportamiento observable | AC2, AC4, AC5, AC6 | `__test__/Input.test.tsx` | S11 | HECHO |
| S13 | Stories: `Default`, `AllVariants`, `AllThemes`, `AllSizes`, `Invalid`, `WithIcons`, `Disabled`, `ReadOnly`, `Controlled` | — | `Input.stories.tsx` | S11 | HECHO |
| S14 | Fixture e2e `input/` + 26 tests sobre el CSS publicado | AC2, AC3 | `e2e/fixtures/input/*`, `e2e/tests/input.spec.ts` | S07 | HECHO |
| S15 | Sección del Input en la app de ejemplo | AC3 | `apps/example-app/src/sections/InputSection.tsx`, `App.tsx` | S11 | HECHO |
| S16 | README, `AGENTS.md` (mapa, inventario, cifras) y changeset | — | `README.md`, `AGENTS.md`, `.changeset/` | S15 | HECHO |

---

## 4. Tabla de TASKS

| ID  | Slices | Predecesora | Modo + justificación | Commit | Estado |
| --- | ------ | ----------- | -------------------- | ------ | ------ |
| T1 | S01–S07 | — | SECUENCIAL. "CSS antes que React": sin contrato no hay nada que consumir. | `3d0158f` | HECHO |
| T2 | S08–S13 | T1 | SECUENCIAL: el hook importa el contrato de T1 y los tests lo usan como fuente de las clases esperadas. | `553c9c5` | HECHO |
| T3 | S14 | T1 | SECUENCIAL por decisión, no por dependencia: ver el análisis de abajo. | `f0b8174` | HECHO |
| T4 | S15, S16 | T2, T3 | SECUENCIAL: documenta lo que dejan las tres anteriores. | _esta task_ | HECHO |

**Análisis de paralelismo.** T3 (fixture e2e) depende sólo de T1, no de T2: mide el **CSS
publicado** con HTML escrito a mano, sin React. Era, por tanto, paralelizable con T2. Se
ejecutó en secuencial por **D-04**.

---

## 5. Checklist de criterios de aceptación

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| **AC1** — `pnpm check:contract` en verde | **CUMPLIDO** | `3d0158f`. `input · prefijo .input · 26 clases de contrato`, y las cuatro reglas (C1–C4) pasan: ninguna clase emitida sin selector, ninguna entrada de contrato sin CSS, ningún valor de unión de tipos sin entrada y el CSS importado en `css/index.css`. |
| **AC2** — Cada valor de cada prop aplica una clase que existe | **CUMPLIDO** | `553c9c5`. Los tests recorren el contrato con `it.each(Object.entries(input.theme \| variant \| size))` en vez de una lista escrita a mano: si mañana se añade un valor al contrato y no al CSS, el test nuevo aparece solo. Más 26 tests e2e (`f0b8174`) que miden que esas clases **pintan**. |
| **AC3** — 8 variantes semánticas legibles en light y dark | **CUMPLIDO** | `f0b8174`. E2E: los tres roles medidos dan tres bordes distintos y ninguno pinta el relleno; el test de tema oscuro comprueba que la caja repinta de `rgb(255,255,255)` a `rgb(29,35,42)` al cambiar `data-theme`. En la app de ejemplo los 8 roles se ven en los tres temas (captura en la sección `#input`). |
| **AC4** — React Aria, teclado y ARIA real | **CUMPLIDO** | `553c9c5`. `useTextField` genera y enlaza los cuatro `id`. Tests: `<label for>` apunta al control, `aria-describedby` contiene el `id` de la ayuda **y** el del error, `aria-invalid="true"` sólo con `invalid`, `Tab` enfoca el control, `readOnly` y `disabled` bloquean la escritura de verdad (con `userEvent.type`, no simulando). |
| **AC5** — `memo` + `useMemo` + `forwardRef` al nodo DOM | **CUMPLIDO** | `553c9c5`. `export default React.memo(Input)`; dos `useMemo` (contenedor y caja); test que exige `ref.current === screen.getByLabelText(...)` y `tagName === "INPUT"`, es decir el `<input>` y no el contenedor. |
| **AC6** — Cobertura ≥90% | **CUMPLIDO** | `pnpm test:coverage --selectProjects components`: `ui/src/Input/src` → **100% líneas, 100% funciones, 91.3% ramas**. |
| **AC7** — Banner `"use client"` y `sideEffects: false` | **CUMPLIDO** | `pnpm --filter @ownui/input build` → CJS + ESM + `.d.ts` (5.38 KB) sin errores; `sideEffects: false` en el `package.json`; el banner lo pone el `tsup.config.ts` del andamio. |
| **AC8** — Ningún color literal fuera de `themes/*.ts` | **CUMPLIDO** | `grep -nE "#[0-9a-fA-F]{3,8}" packages/tw-theme/src/css/input.css` sólo devuelve `#000` y `#0000` como operandos de `color-mix`, que es lo que la guía permite. Todo lo demás es `var(--color-*)`. |
| **AC9** — Específicos de L10 | **CUMPLIDO** | `useTextField` (`553c9c5`); `aria-invalid` + `.input-invalid` + regla `:has(.input-control[aria-invalid="true"])` para HTML a mano; relación label ↔ control ↔ descripción ↔ error por los `id` de React Aria, con test por cada enlace; `type` como unión cerrada de 7 valores, con test de que llega al DOM. La decisión sobre `Field` es **D-02**. |

---

## 6. Decisiones tomadas

### D-01 — El rol colorea el borde, no el relleno

| Campo | Valor |
| --- | --- |
| Contexto | El `Button` usa el rol como color de relleno (`--btn-bg: var(--btn-color)`). Copiar ese patrón en el Input daba un campo con fondo `primary`. |
| Opciones | (a) Copiar el patrón del Button. (b) El rol colorea el borde y el anillo de foco; el relleno se queda en la superficie del tema. |
| Decisión | **(b)**. |
| Razón | Un campo de texto con relleno de rol es ilegible en cuanto lleva contenido: el texto del usuario se pinta con `--color-base-content`, no con el `-content` del rol, y acabaríamos necesitando un segundo juego de tokens sólo para esto. Además es lo que hace un campo real: comunica estado por el borde. En reposo el borde se mezcla hacia la superficie (55%) para que `info` y `error` se distingan sin gritar; en foco se usa el token `-focus` del rol a plena intensidad. |
| Reversibilidad | Alta: son dos declaraciones en `.input`. Está fijada por el spec e2e, así que revertirla rompe tests explícitos en vez de pasar desapercibida. |

### D-02 — No hay `<Field>` aparte: el `Input` monta el campo entero

| Campo | Valor |
| --- | --- |
| Contexto | La ficha L10 pide decidir si `Field` (label + descripción + error) es un compound separado, y lo recomienda "para no inflar `Input`". |
| Opciones | (a) `Field` como provider y `Input` como consumidor. (b) El `Input` monta label, caja, ayuda y error. |
| Decisión | **(b)**, con el CSS de las partes ya separado (`.input-field`, `.input-label`, `.input-description`, `.input-error-message`) para poder extraerlo sin reescribirlo. |
| Razón | `useTextField` devuelve `labelProps`, `inputProps`, `descriptionProps` y `errorMessageProps` **en la misma llamada**, porque es quien genera y enlaza los `id`. Con (a), el `Field` tendría que recibir esas bolsas desde el `Input`, es decir hacia arriba, y React sólo pasa hacia abajo; la salida sería duplicar la llamada al hook o montar el contexto bidireccional de `react-aria-components`, que es una máquina entera. El coste de (b) es que el `Input` siempre monta un contenedor. Cuando L11 y L16 traigan el segundo y el tercer caso real, se extrae un `Field` **de tres casos**, que es cuando se sabe qué hay de común. |
| Reversibilidad | Media. El CSS ya está partido por nodos, así que extraer un paquete `@ownui/field` sería mover markup, no rediseñar. La API pública (`label`, `description`, `errorMessage` como props) se mantendría por compatibilidad. |

### D-03 — El `errorMessage` sólo se muestra si `invalid`

| Campo | Valor |
| --- | --- |
| Contexto | `errorMessage` e `invalid` son dos props independientes y podrían renderizarse por separado. |
| Opciones | (a) Mostrar `errorMessage` siempre que se pase. (b) Mostrarlo sólo con `invalid`. |
| Decisión | **(b)**. |
| Razón | Con (a) es trivial dejar un error visible mientras `aria-invalid` dice que el campo es válido: la pantalla y el lector de pantalla cuentan cosas distintas. Con (b) hay una sola fuente de verdad y el consumidor no puede desincronizarlas. Hay test explícito de que un `errorMessage` sin `invalid` no se monta. |
| Reversibilidad | Total: una línea en el hook. |

### D-04 — T3 (fixture e2e) va en secuencial pese a ser paralelizable

| Campo | Valor |
| --- | --- |
| Contexto | T3 depende sólo de T1 (mide el CSS publicado con HTML a mano), así que podía correr en paralelo con T2. |
| Opciones | (a) Worktree paralelo para T3. (b) Secuencial. |
| Decisión | **(b)**. |
| Razón | T3 tardó tres iteraciones en ponerse verde por cómo Chromium serializa y transiciona los valores (ver el log), y cada iteración necesitaba `pnpm e2e` sobre el árbol completo. Un worktree habría duplicado el `node_modules` y la compilación de fixtures para ahorrar unos minutos de reloj en un lote de cuatro commits. |
| Reversibilidad | Total: no deja rastro en el código. |

### D-05 — La clase de tamaño se aplica dos veces

| Campo | Valor |
| --- | --- |
| Contexto | Las clases `.input-{xs..xl}` definen `--input-fontsize`, que necesitan la caja **y** el `<label>`. El label es hermano de la caja, no hijo, así que no hereda sus custom properties. |
| Opciones | (a) Tamaño sólo en la caja; label con tamaño fijo. (b) Tamaño en la caja y en el contenedor. (c) Mover todas las propiedades de tamaño al contenedor. |
| Decisión | **(b)**. |
| Razón | (a) deja un `xs` con etiqueta de `md`, que se ve mal en cuanto hay dos campos de tamaños distintos. (c) no funciona: `.input` declara sus propios valores por defecto y una declaración propia gana a la heredada, así que habría que quitar los defaults y el CSS dejaría de servir para HTML escrito a mano. (b) cuesta una línea y está comentada en el hook y cubierta por un test. |
| Reversibilidad | Total. |

---

## 7. Bloqueantes

### B-01 — La rama base es `claude/lote-9`, no `develop` (resuelto, con una condición)

Al empezar este lote, el PR #36 (lote 9) estaba abierto contra `develop` y su CI llevaba
**más de 50 minutos colgada en el paso `Install Playwright Browsers`**; las ejecuciones
anteriores de ese mismo workflow tardaban ~2,5 minutos, y la ejecución del push de `develop`
tras mergear el lote 8 estaba colgada en el mismo paso. Es decir: una avería de los runners,
no del código. Los pasos de lint, contrato, build y tests unitarios ya habían pasado en verde.

Para no bloquear la FASE 3 detrás de una avería de infraestructura, `claude/lote-10` se creó
desde `claude/lote-9`, que es exactamente el árbol que el PR #36 mergeará. **Condición al
cerrar el lote**: cuando #36 entre en `develop`, hay que traer `develop` a esta rama (será un
merge trivial, porque el contenido de #36 ya es su base) y abrir el PR de L10 contra `develop`.
No se ha mergeado nada por cuenta propia.

---

## 8. Preguntas abiertas, objeciones y gaps

### O-01 — El criterio de contraste AA de la plantilla no aplica literalmente

La plantilla de FASE 3 pide "contraste AA verificado para las 8 variantes en ambos temas". En
este componente **no hay par rol/`-content` que medir**: el texto del campo es
`--color-base-content` sobre `--color-base-100` (contraste del tema, ya auditado) y el rol sólo
aparece en el borde y en el anillo de foco, que son componentes de interfaz no textuales —
WCAG 1.4.11 les pide 3:1 contra lo adyacente, no 4.5:1. `pnpm check:contrast` sigue reportando
la deuda del lote 22 sobre los temas, que es ortogonal a este lote. **Lo que no se ha medido es
ese 3:1 del borde contra la superficie**, y debería entrar en el alcance del lote 22, que ya
tiene el script donde añadirlo.

### G-01 — `check:contract` no comprueba nada de C1 en este componente

El informe dice `input · 26 clases de contrato · 0 emitidas`. No es un fallo: el hook no
escribe un solo literal de clase, las saca todas del contrato (`input.part.box`,
`input.theme[theme]`…), así que el extractor de literales no encuentra nada que cruzar. La
regla C2 (contrato ⇄ CSS) sí cubre las 26. Dicho esto, **un componente escrito así desactiva
C1 sin avisar**, y C1 es la regla que caza el bug del lote 6. Propuesta: que el checker avise
cuando un componente con contrato emite 0 clases, o que resuelva los accesos
`contrato.grupo.clave`. Candidato a una vuelta sobre `check-contract.mjs`.

### G-02 — `type="number"` no trae la semántica de número

Se acepta `type="number"` y se le quitan las flechas nativas (rompen la métrica de la caja),
pero el componente no aporta `inputMode`, ni formato, ni `min`/`max`/`step` tipados, ni la
`NumberField` de React Aria. Un campo numérico de verdad es otro componente. Si aparece la
necesidad, es un lote propio, no una prop más.

### G-03 — No hay `Textarea`

La ficha L10 habla de "Input / Field" y no menciona `<textarea>`, que comparte el 90% de este
CSS y de este hook (`useTextField` lo soporta con `inputElementType: "textarea"`). Queda
señalado como el candidato más barato de la FASE 3.

### G-04 — El CSS no cubre `:autofill`

Chrome pinta el autocompletado con un fondo amarillo propio que ignora `--input-bg`. Es el
defecto visual más visible que le queda al componente en un formulario real. No se arregla
aquí porque la solución habitual (`box-shadow: inset 0 0 0 100px`) es un truco que merece su
propia discusión.

---

## 9. Log cronológico

- **Fase 0** — Rama `claude/lote-10` creada desde `claude/lote-9` (ver **B-01**). Andamio con
  `pnpm create-component Input`: 11 archivos nuevos y 6 registros automáticos.
- **T1** (`3d0158f`) — CSS y contrato reescritos sobre el andamio. La decisión de fondo
  (**D-01**) obligó a replantear la anatomía: el borde y el foco viven en una caja que envuelve
  al `<input>`, porque los iconos van dentro del marco.
- **T2** (`553c9c5`) — Paquete React. Dependencia nueva `@react-aria/textfield@3.19.1`. El
  typecheck falló primero por un `variants` sin reconstruir: el contrato se consume desde
  `dist`, así que un contrato nuevo exige `pnpm --filter @ownui/tw-theme build` antes.
- **T3** (`f0b8174`) — Fixture e2e, en verde a la tercera. Lo que costó: Chromium serializa
  `color-mix(in oklab, …)` como `oklab(… / alfa)` y no como `rgba()`; el anillo de foco usa el
  token `-focus` del rol y no el de reposo; y al cambiar `data-theme` no basta con leer en el
  mismo tick ni con esperar un poco, porque `.input` transiciona `background-color` — hay que
  usar la aserción que reintenta. Las tres quedan documentadas en el spec para el siguiente
  fixture.
- **T4** — Sección del Input en la app de ejemplo (verificada en Chromium: 23 campos, 0 errores
  de consola, caja de 40px y relleno en la superficie del tema), README, `AGENTS.md` y
  changeset.

---

## 10. Impacto de versión

**minor** en `@ownui/input` (paquete nuevo), `@ownui/tw-theme` (CSS y contrato nuevos, sin
romper nada) y `@ownui/ui` (re-exporta `Input`). Changeset:
`.changeset/lote-10-input.md`.
