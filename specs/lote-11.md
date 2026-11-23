# Lote 11 — Checkbox + Radio + Switch

## 1. Meta

| Campo           | Valor                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| Lote            | **L11** — Checkbox + Radio + Switch (`@docs/BUILD-BATCHES.md` §L11)          |
| Rama base       | `develop` en `c3cb7f2` (merge del PR #37 / lote 10)                           |
| Rama de trabajo | `claude/lote-11`                                                              |
| Estado general  | **COMPLETO** — 6 tasks, 0 bloqueadas, 9/9 criterios cumplidos                 |
| Fecha           | 2026-11-23                                                                    |
| PR              | _pendiente_                                                                   |

---

## 2. Criterios de segmentación aplicados

Los mismos de los lotes 0–10: **slice** = unidad mínima verificable; **task** = grupo cohesivo
de slices, un commit cada una.

El backlog manda ir **en un solo lote** con los tres componentes, y la razón que da es la que
organiza todo el trabajo: comparten el patrón de control marcable y los tokens `--control-*`.
Partirlo en tres lotes habría significado inventar esa capa compartida tres veces.

### Criterios de aceptación (plantilla estándar de FASE 3)

| ID  | Criterio                                                                           |
| --- | ------------------------------------------------------------------------------------ |
| AC1 | `pnpm check:contract` en verde                                                        |
| AC2 | Cada valor de cada prop de variante/tamaño aplica una clase que existe en el CSS      |
| AC3 | 8 variantes semánticas, legibles en light y dark                                      |
| AC4 | Hook de `@react-aria/*` apropiado; teclado completo; ARIA derivado del estado real    |
| AC5 | `React.memo` + `useMemo` en clases + `forwardRef` que expone el nodo DOM              |
| AC6 | Cobertura ≥90% de líneas del paquete                                                  |
| AC7 | Build con banner `"use client"`; `sideEffects: false`                                 |
| AC8 | Ningún color literal fuera de `themes/*.ts`                                           |
| AC9 | Específicos de L11: tercer estado del checkbox; `RadioGroup` como Provider con roving tabindex; el Switch comparte tokens con el Checkbox pero no su geometría |

---

## 3. Tabla de SLICES

| ID  | Descripción | Criterios | Archivos | Depende de | Estado |
| --- | ----------- | --------- | -------- | ---------- | ------ |
| S01 | Capa de tokens `--control-*` en `themes/root.ts` | AC9 | `themes/root.ts` | — | HECHO |
| S02 | `css/checkbox.css`: caja, trazo, campo, grupo, roles, tamaños, estados | AC2, AC8 | `css/checkbox.css` | S01 | HECHO |
| S03 | `css/radio.css`: círculo y punto; marcado que tiñe el marco y no rellena | AC2, AC8 | `css/radio.css` | S01 | HECHO |
| S04 | `css/switch.css`: pista y pulgar; ancho derivado de la altura | AC2, AC8, AC9 | `css/switch.css` | S01 | HECHO |
| S05 | Los tres contratos + registro en `variants/index.ts` y `css/index.css` | AC1, AC2 | `variants/{checkbox,radio,switch}.ts` | S02–S04 | HECHO |
| S06 | `@ownui/checkbox`: tipos, contexto, hook de clases, `Checkbox`, `CheckboxGroup` | AC4, AC5, AC9 | `packages/ui/src/Checkbox/**` | S05 | HECHO |
| S07 | 32 tests del Checkbox y su grupo | AC2, AC4, AC6 | `Checkbox/__test__` | S06 | HECHO |
| S08 | `@ownui/radio`: `Radio` + `RadioGroup` con fallo rápido fuera del grupo | AC4, AC5, AC9 | `packages/ui/src/Radio/**` | S05 | HECHO |
| S09 | 23 tests del Radio, incluidos los 4 de teclado | AC2, AC4, AC6 | `Radio/__test__` | S08 | HECHO |
| S10 | `@ownui/switch`: `Switch` con `role="switch"` | AC4, AC5, AC9 | `packages/ui/src/Switch/**` | S05 | HECHO |
| S11 | 18 tests del Switch | AC2, AC4, AC6 | `Switch/__test__` | S10 | HECHO |
| S12 | Arreglo del generador: alias para nombres que son palabra reservada | — | `scripts/create-component.mjs`, su test | S10 | HECHO |
| S13 | Fixture e2e `controls/` + 17 tests, centrado en la alineación de los tres | AC2, AC3, AC9 | `e2e/fixtures/controls/*`, `e2e/tests/controls.spec.ts` | S05 | HECHO |
| S14 | Stories de los tres | — | `*.stories.tsx` | S06, S08, S10 | HECHO |
| S15 | Sección de la app de ejemplo | AC3 | `apps/example-app/src/sections/ControlsSection.tsx` | S06, S08, S10 | HECHO |
| S16 | README, `AGENTS.md` y changeset | — | `README.md`, `AGENTS.md`, `.changeset/` | S15 | HECHO |

---

## 4. Tabla de TASKS

| ID  | Slices | Predecesora | Modo + justificación | Commit | Estado |
| --- | ------ | ----------- | -------------------- | ------ | ------ |
| T1 | S01–S05 | — | SECUENCIAL. "CSS antes que React", y además la capa `--control-*` es la premisa de las tres siguientes. | `363dca6` | HECHO |
| T2 | S06, S07, S14a | T1 | SECUENCIAL: toca `packages/ui/package.json`, `packages/ui/src/index.ts`, `jest.config.js` y `tsconfig.jest.json`, que son los mismos archivos que T3 y T4. | `d821bb4` | HECHO |
| T3 | S08, S09, S14b | T2 | SECUENCIAL: mismos archivos compartidos. | `db517e7` | HECHO |
| T4 | S10–S12, S14c | T3 | SECUENCIAL: mismos archivos compartidos, y además el arreglo del generador salió de generar este componente. | `b693c84` | HECHO |
| T5 | S13 | T1 | SECUENCIAL por decisión: ver **D-05**. | `3a98914` | HECHO |
| T6 | S15, S16 | T2–T5 | SECUENCIAL: documenta lo que dejan las anteriores. | _esta task_ | HECHO |

**Análisis de paralelismo.** T2, T3 y T4 son tres componentes independientes y sería el caso
más goloso del plan entero, pero **los cuatro registros que el generador hace son archivos
compartidos**: el barrel de `@ownui/ui`, sus dependencias, `jest.config.js` y
`tsconfig.jest.json`. Tres ramas paralelas chocarían en los cuatro. T5 sí era independiente de
T2–T4 (mide CSS, no React); se ejecutó en secuencial por **D-05**.

---

## 5. Checklist de criterios de aceptación

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| **AC1** — `check:contract` en verde | **CUMPLIDO** | `363dca6`. Tres componentes nuevos en el informe: `checkbox` 27 clases, `radio` 26, `switch` 21. Las cuatro reglas pasan. |
| **AC2** — Cada valor de cada prop aplica una clase que existe | **CUMPLIDO** | Los tests recorren el contrato con `it.each(Object.entries(...))` en los tres paquetes, así que un valor nuevo genera su test solo. Más 17 tests e2e (`3a98914`) que miden que esas clases pintan. |
| **AC3** — 8 variantes semánticas legibles en light y dark | **CUMPLIDO** | E2E: cada rol pinta su color en los tres controles y el switch repinta al cambiar `data-theme`. En la app de ejemplo los 8 roles se ven en los tres temas. |
| **AC4** — React Aria, teclado y ARIA real | **CUMPLIDO** | `useCheckbox`/`useCheckboxGroupItem`/`useCheckboxGroup`, `useRadio`/`useRadioGroup`, `useSwitch`, con sus `@react-stately/*`. Tests de teclado: espacio alterna checkbox y switch; en el radio, `Tab` entra una sola vez al grupo, las flechas recorren **circularmente** y sólo la opción elegida lleva `tabindex="0"`. ARIA: `role="switch"` real (hay test de que **no** hay ningún `checkbox`), `aria-readonly`, `aria-invalid`, y el `indeterminate` como propiedad del DOM. |
| **AC5** — `memo` + `useMemo` + `forwardRef` al nodo DOM | **CUMPLIDO** | Los tres exportan `React.memo(...)`; las clases salen de `use*Classes` con dos `useMemo`; test en cada paquete de que `ref.current` es el `<input>` y no el `<label>`. |
| **AC6** — Cobertura ≥90% de líneas | **CUMPLIDO** | `ui/src/Checkbox/src` **100%**, `ui/src/Radio/src` **100%**, `ui/src/Switch/src` **100%** de líneas y de funciones (ramas: 87.3 / 77.1 / 82.6). |
| **AC7** — Banner `"use client"`, `sideEffects: false` | **CUMPLIDO** | `pnpm build` → 10/10 paquetes; los tres emiten CJS + ESM + `.d.ts`. |
| **AC8** — Ningún color literal fuera de `themes/*.ts` | **CUMPLIDO** | `grep -nE "#[0-9a-fA-F]{3,8}"` sobre los tres CSS sólo devuelve `#000` y `#0000` como operandos de `color-mix`. |
| **AC9** — Específicos de L11 | **CUMPLIDO** | Tercer estado: `indeterminate` con su propio trazo, prioridad sobre `checked` y test de las dos cosas. `RadioGroup` como Provider con roving tabindex, verificado. Switch: comparte la fuente de color y `--control-*` con el Checkbox, pero su geometría es propia y el e2e mide las dos mitades de la frase — **misma altura**, **distinta forma**. |

---

## 6. Decisiones tomadas

### D-01 — Los tokens `--control-*` son globales, no de cada componente

| Campo | Valor |
| --- | --- |
| Contexto | La ficha L11 dice que los tres "comparten los mismos tokens de `--control-*`", pero no dónde viven. |
| Opciones | (a) Cada CSS define los suyos y se repiten los valores. (b) Una capa global en `themes/root.ts`. |
| Decisión | **(b)**. |
| Razón | Lo que esos tokens fijan no es una propiedad de cada control, es una **relación entre los tres**: en un formulario, una casilla, un radio y un switch del mismo tamaño tienen que alinearse. Con (a) esa relación no está escrita en ningún sitio y se rompe en el primer ajuste que alguien haga a uno solo. Con (b) está en un archivo y hay un fixture que la mide. |
| Reversibilidad | Alta: son cinco líneas en `root.ts` y cada CSS ya declara su fallback. |

### D-02 — La rama suelta/agrupada del Checkbox se hace eligiendo componente

| Campo | Valor |
| --- | --- |
| Contexto | Una casilla suelta usa `useCheckbox` + `useToggleState`; una de grupo usa `useCheckboxGroupItem` con el estado del grupo. Son hooks distintos. |
| Opciones | (a) Llamar a uno u otro dentro de un `if` (lo prohíben las reglas de hooks, y el repo tiene `rules-of-hooks: error`). (b) Llamar a los dos siempre y descartar uno. (c) Dos componentes internos y elegir cuál se renderiza. |
| Decisión | **(c)**. |
| Razón | (a) no compila el lint. (b) monta estado que no se usa y hace que el componente dependa de dos máquinas a la vez. (c) deja cada hook en un componente que lo llama incondicionalmente; la rama es estable porque una casilla no entra ni sale de un grupo durante su vida, así que no provoca remontajes. Lo común —clases y marcado— se factoriza en `useCheckboxClasses` y `CheckboxView`. |
| Reversibilidad | Alta: la API pública no la ve. |

### D-03 — El contexto del Checkbox devuelve `null`; el del Radio lanza

| Campo | Valor |
| --- | --- |
| Contexto | Los dos componentes tienen grupo, y hay que decidir qué pasa fuera de él. |
| Opciones | (a) Que los dos lancen. (b) Que los dos devuelvan `null`. (c) Uno cada cosa. |
| Decisión | **(c)**: el Checkbox devuelve `null`, el Radio lanza. |
| Razón | No es simetría mal aplicada, es que los dos casos son distintos. Una casilla suelta ("acepto los términos") es el uso más común del componente. Un radio suelto es un control imposible: sin estado compartido no hay nada que deseleccionar al elegir otra opción, así que el usuario acabaría con dos marcados y sin forma de volver atrás. Mejor un error en desarrollo que eso en producción; hay test. |
| Reversibilidad | Total. |

### D-04 — El radio marcado no se rellena; la casilla sí

| Campo | Valor |
| --- | --- |
| Contexto | El patrón del sistema es que el estado activo tome el color del rol. |
| Opciones | (a) Rellenar los dos. (b) Rellenar la casilla y, en el radio, teñir sólo el marco. |
| Decisión | **(b)**. |
| Razón | Un círculo relleno con un punto interior **del mismo color** no se lee: el punto desaparece. Teñir el marco y dejar el punto sólido conserva las dos señales. Es una diferencia de pintura, no de tokens: los dos siguen leyendo `--{c}-color` del rol. Fijado en el e2e. |
| Reversibilidad | Total: una declaración. |

### D-05 — T5 (fixture e2e) va en secuencial pese a ser paralelizable

| Campo | Valor |
| --- | --- |
| Contexto | T5 depende sólo de T1: mide el CSS publicado con HTML a mano, sin React. |
| Opciones | (a) Worktree paralelo. (b) Secuencial. |
| Decisión | **(b)**. |
| Razón | Igual que en el lote 10: cada iteración del fixture necesita `pnpm e2e` sobre el árbol completo, y un worktree habría duplicado `node_modules` y la compilación de los 11 fixtures para ahorrar minutos en un lote de seis commits. |
| Reversibilidad | Total. |

### D-06 — El arreglo del generador entra en este lote aunque sea alcance del L8

| Campo | Valor |
| --- | --- |
| Contexto | `pnpm create-component Switch` emitía un paquete que no compila: las plantillas escriben `import { switch } from ...`, y un binding de `import` no puede ser palabra reservada (un nombre **exportado** sí). |
| Opciones | (a) Arreglar el Switch a mano y anotar el bug como gap del lote 8. (b) Arreglar el generador. |
| Decisión | **(b)**, con test de regresión. |
| Razón | (a) deja el andamio produciendo código roto justo para el componente que este lote tenía que crear, y el siguiente que genere un `Class` o un `Default` se encuentra lo mismo. El arreglo son ~15 líneas: una lista de reservadas y un alias en las plantillas. El test se hace sobre `Class` y no sobre `Switch` porque el generador no pisa archivos existentes y `Switch` ya vive en el repo — detalle que costó un falso negativo. |
| Reversibilidad | Total. |

### D-07 — No hay clase `focused`: el foco lo resuelve el CSS

| Campo | Valor |
| --- | --- |
| Contexto | El input real está oculto visualmente, así que su `:focus-visible` tiene que reflejarse en el elemento que sí se ve. |
| Opciones | (a) Emitir `.{c}-focused` desde JS con `useFocusRing`. (b) `:has(.{c}-input:focus-visible)` en el CSS. |
| Decisión | **(b)**, y se retiró `focused` de los tres contratos. |
| Razón | (b) funciona igual con React y con HTML escrito a mano, que es el punto de publicar el CSS, y no necesita JavaScript. Con (a) habría dos fuentes de verdad para el mismo estado. `:has()` es seguro aquí: este sistema ya exige un navegador con `color-mix` y `oklab`. |
| Reversibilidad | Alta: volver a añadir la clase al contrato y al CSS. |

---

## 7. Bloqueantes

**Ninguno.**

---

## 8. Preguntas abiertas, objeciones y gaps

### G-01 — `check:contract` sigue sin comprobar nada en los componentes nuevos

Ya se registró en el lote 10 y ahora afecta a cuatro componentes: el informe dice
`checkbox · 0 emitidas`, `radio · 0 emitidas`, `switch · 0 emitidas`. Los hooks no escriben ni
un literal de clase —las sacan todas del contrato—, así que el extractor no encuentra nada que
cruzar y la **regla C1 queda desactivada en silencio**. La C2 (contrato ⇄ CSS) sí cubre las 74
clases. Es la propuesta más rentable sobre `check-contract.mjs`: avisar cuando un componente
con contrato emite 0 clases, o resolver los accesos `contrato.grupo.clave`.

### G-02 — El `AGENTS.md` del lote 10 quedó a medias

Al cerrar el lote 10, un script de parcheo abortó a mitad y cuatro líneas del mapa del monorepo
(`variants/`, `css/`, `e2e/` y la fecha de verificación) se quedaron con los valores del lote 9.
Se arregla en este lote. **La lección no es el error sino el hueco**: `pnpm check:docs` valida
los enlaces, pero nada valida que las cifras y las rutas del `AGENTS.md` sigan siendo ciertas.
Un `check:agents` que compruebe que los paquetes listados existen y que los conteos cuadran con
la salida real de los comandos sería barato y cerraría la categoría entera de bug que el lote 9
atacó a mano.

### G-03 — Cobertura de ramas por debajo de líneas

Líneas al 100% en los tres, ramas al 87/77/83. Lo que falta son combinaciones de props
opcionales (`invalid` del grupo pisado por el de la opción, `boxClassName` sin `className`…).
El criterio del backlog es de líneas y se cumple; se deja anotado por si se sube el listón.

### G-04 — El Switch no tiene etiquetas de estado

Muchos sistemas acompañan el interruptor con un "Sí/No" o un icono dentro de la pista. No se ha
hecho: encarece el contrato (dos nodos más, dos props más) y no estaba en la ficha. Si se
quiere, es un añadido pequeño y aditivo sobre `.switch-thumb`.

### G-05 — No hay `CheckboxGroup` horizontal

El `RadioGroup` tiene `orientation`; el `CheckboxGroup` no, porque la ficha sólo lo pedía para
el radio (donde además cambia el comportamiento de las flechas). En el checkbox sería sólo
disposición. Trivial de añadir cuando haga falta.

### Objeción al alcance

La ficha L11 pide `useCheckboxGroup`, `useRadioGroup` y sus `@react-stately/*`, y eso está.
Pero el repo ya tiene **cuatro** componentes con el patrón "etiqueta + ayuda + error"
(`Input`, `CheckboxGroup`, `RadioGroup` y, en cuanto llegue, `Select`), cada uno con sus
propias clases `-label`, `-description`, `-error-message`. Es exactamente el umbral que la
decisión **D-02 del lote 10** fijó para extraer un `Field` común. **Este lote no lo hace**
—refactorizar tres componentes recién escritos mientras se escriben es como se rompen las
cosas—, pero la deuda ya está vencida y debería ser un lote propio antes de L16.

---

## 9. Log cronológico

- **Fase 0** — Rama `claude/lote-11` desde `develop` en `c3cb7f2`. Andamio de los tres
  componentes con `pnpm create-component`.
- **T1** (`363dca6`) — Capa `--control-*` y los tres CSS. La parte que costó decidir fue cuánto
  comparten: tokens sí, geometría no, y eso acabó siendo la tesis que mide el e2e.
- **T2** (`d821bb4`) — Checkbox. La rama suelta/agrupada obligó a repensar la estructura
  (**D-02**). Un test falló al principio esperando `aria-checked="mixed"`: el tercer estado de
  un checkbox nativo se expone como **propiedad del DOM**, no como atributo, y eso explica a su
  vez por qué el CSS tiene que pintarlo por clase.
- **T3** (`db517e7`) — Radio. Sin sorpresas: React Aria trae el roving tabindex hecho y los
  tests sólo tuvieron que comprobarlo.
- **T4** (`b693c84`) — Switch, y el arreglo del generador (**D-06**). El test de regresión falló
  dos veces antes de acertar: la primera porque el generador no pisa archivos existentes y
  leía el `Switch` viejo del repo, la segunda por lo mismo desde el sandbox de Jest, que copia
  el árbol real. Se resolvió probándolo con `Class`.
- **T5** (`3a98914`) — Fixture `controls/`, en verde a la primera.
- **T6** — App de ejemplo (verificada en Chromium: 22 casillas, 9 radios, 13 switches, 0 errores
  de consola y los tres midiendo exactamente 20px de alto a tamaño md), README, `AGENTS.md`,
  changeset y esta spec.
- **Cierre** — Suite completa en verde: `lint` 0 errores · `typecheck` 8/8 paquetes · `test` 19
  suites / 400 tests · `build` 10/10 · `check:contract` ✓ · `check:docs` ✓ · `example:build` ✓ ·
  `e2e` 193 passed en 11 fixtures.

---

## 10. Impacto de versión

**minor** en `@ownui/checkbox`, `@ownui/radio` y `@ownui/switch` (paquetes nuevos),
`@ownui/tw-theme` (tokens, CSS y contratos nuevos, sin romper nada) y `@ownui/ui` (re-exporta
los tres y sus grupos). Changeset: `.changeset/lote-11-controles-marcables.md`.
