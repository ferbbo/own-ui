# Lote 7 — Dropdown: accesibilidad e higiene de props

## 1. Meta

| Campo           | Valor                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| Lote            | **L7** — Dropdown: accesibilidad e higiene de props (`@docs/BUILD-BATCHES.md` §L7) |
| Rama base       | `develop` (en `368b3fe`, "Merge pull request #33 from ferbbo/claude/lote-6") |
| Rama de trabajo | `claude/lote-7`                                                              |
| Estado general  | **COMPLETO** — 3 tasks, 0 bloqueadas, 6/6 criterios cumplidos. Incluye las decisiones de la revisión (D-05, D-06) |
| Fecha           | 2026-11-21                                                                   |

> Parte del `develop` que ya tiene los lotes 0–6. El lote 6 dejó el CSS del menú y del
> trigger; este cierra el comportamiento, que es la mitad que falta: hoy el Dropdown emite
> `role="menu"` y `role="menuitem"` **sin navegación por teclado**, y eso para un lector de
> pantalla es peor que un `<div>`, porque promete una interacción que no existe.

---

## 2. Criterios de segmentación aplicados

Los del prompt (`AGENTS.md` no define otros), igual que en los lotes 0–6:

- **Slice** = unidad mínima verificable y testeable por sí sola.
- **Task** = agrupación de slices cohesivos. **Una task = un commit.**

Reglas de `AGENTS.md` que condicionan este lote:

- **§8.5 — «Todo componente interactivo pasa por React Aria. Si no existe el hook adecuado,
  dilo en el PR en vez de improvisar manejo de teclado.»** Es la regla que decide la forma del
  lote; se aborda de frente en **D-01**, no de tapadillo.
- **§5.3 — patrón Provider.** El estado compartido va al contexto; los subcomponentes no
  reciben props de configuración.
- **§5.5 — `aria-*` derivados del estado real**, y nada de `onClick` crudo sin teclado.
- **Tests reales o nada** (§8.6).

### Criterios de aceptación del lote (del backlog)

| ID  | Criterio                                                                                   |
| --- | ------------------------------------------------------------------------------------------ |
| AC1 | `render` del Dropdown no emite warnings de React (test que falla si `console.error` recibe algo) |
| AC2 | El HTML del contenedor no contiene atributos `variant`, `size`, `defaultOpen`, etc.        |
| AC3 | Tests de teclado: flechas mueven foco, `Esc` cierra y el foco vuelve al trigger, `Enter` selecciona, los `disabled` se saltan |
| AC4 | Test de click-outside                                                                      |
| AC5 | `aria-controls` del trigger = `id` del menú                                                |
| AC6 | Listener removido al desmontar (test con spy en `removeEventListener`)                     |

---

## 3. Tabla de SLICES

| ID  | Descripción | Criterios | Archivos | Depende de | Estado |
| --- | ----------- | --------- | -------- | ---------- | ------ |
| S01 | `DropdownRoot` separa `contextProps` de `domProps` explícitamente; el `<div>` recibe sólo atributos DOM válidos | AC1, AC2 | `Dropdown.tsx`, `Dropdown.types.ts` | — | HECHO |
| S02 | `useId` en el provider → `menuId` / `triggerId` en contexto; `aria-controls` + `id` en el trigger, `id` + `aria-labelledby` en el menú | AC5 | `DropdownContext.tsx`, `useDropdown.tsx`, `Dropdown.types.ts` | S01 | HECHO |
| S03 | `useDropdownItem` devuelve `itemClasses` aparte, como el resto de hooks | — | `useDropdown.tsx`, `Dropdown.tsx` | — | HECHO |
| S04 | Navegación por teclado en el menú: `ArrowDown`/`ArrowUp` (saltando deshabilitados), `Home`/`End`, `Esc` (cierra + devuelve foco), `Tab` (cierra) | AC3 | `useDropdown.tsx` | S02 | HECHO |
| S05 | `Enter`/`Space` seleccionan en el item; `ArrowDown`/`ArrowUp` en el trigger abren y enfocan | AC3 | `useDropdown.tsx` | S04 | HECHO |
| S06 | Foco inicial al abrir (item activo si hay, primero si no) y retorno al trigger al cerrar con `Esc` o selección | AC3 | `useDropdown.tsx` | S04 | HECHO |
| S07 | Click-outside: listener de `pointerdown` en `document` sólo mientras está abierto, con limpieza | AC4, AC6 | `useDropdown.tsx` | S01 | HECHO |
| S08 | Tests de higiene: sin warnings de React y sin props de configuración en el DOM | AC1, AC2 | `__test__/Dropdown.test.tsx` | S01 | HECHO |
| S09 | Tests de teclado, foco y click-outside, incluida la limpieza del listener | AC3, AC4, AC6 | `__test__/Dropdown.test.tsx` | S04–S07 | HECHO |
| S10 | `AGENTS.md` (§5.3, §9.8), changeset y spec | — | `AGENTS.md`, `.changeset/`, `specs/lote-7.md` | S01–S09 | HECHO |
| S11 | **D-06** El panel deja de desmontarse al cerrarse: queda montado con `aria-hidden` + `inert`, para que la transición se vea | — | `Dropdown.tsx`, `useDropdown.tsx`, `__test__/Dropdown.test.tsx`, `e2e/fixtures/dropdown/`, `e2e/tests/dropdown.spec.ts` | S01–S09 | HECHO |
| S12 | **D-05** El impacto de versión baja a `minor` y se corrige el gap G-01, que era falso | — | `.changeset/`, `AGENTS.md`, `useDropdown.tsx`, `specs/lote-7.md` | S11 | HECHO |

---

## 4. Tabla de TASKS

| ID  | Slices | Predecesora | Modo + justificación | Commit | Estado |
| --- | ------ | ----------- | -------------------- | ------ | ------ |
| T1  | S01–S09 | — | **SECUENCIAL** | `2eb5410` | HECHO |
| T2  | S10 | T1 | **SECUENCIAL** — documenta el resultado | `026dddb` | HECHO |
| T3  | S11, S12 | T2 | **SECUENCIAL** — decisiones de la revisión; tocan los mismos archivos que T1 | `(este commit)` | HECHO |

**Desviación del plan, registrada (D-02).** El plan abría con tres tasks: props+ids, teclado y
documentación. Las dos primeras se fusionaron en T1 al ejecutarlas: el teclado necesita los
`id` y las refs del contexto, el contexto necesita el `setOpen(open, { returnFocus })` que sólo
tiene sentido con el teclado puesto, y el arreglo de refs del trigger es condición para el
retorno de foco. Partirlo habría dado un primer commit que **no compila** (tipos del contexto
sin sus consumidores) y un segundo que arregla su propio build: dos commits peores que uno.
Aquí no había paralelismo posible en ningún caso, y conviene decir por qué: en los lotes 4–6 el
paralelismo salía de que CSS, e2e y stories viven en paquetes distintos; este lote es todo
comportamiento en tres archivos del mismo paquete.

Aquí **no hay paralelismo posible** y conviene decirlo: las dos tasks de código tocan los
mismos tres archivos (`Dropdown.tsx`, `DropdownContext.tsx`, `useDropdown.tsx`). En los lotes
anteriores el paralelismo salía de que CSS, e2e y stories viven en paquetes distintos; este
lote es todo comportamiento en un único paquete.

---

## 5. Checklist de criterios de aceptación

Todas las evidencias son del commit `2eb5410`, en
`packages/ui/src/Dropdown/__test__/Dropdown.test.tsx`.

| ID  | Criterio | Estado | Evidencia |
| --- | -------- | ------ | --------- |
| AC1 | Sin warnings de React al renderizar | ✅ **CUMPLIDO** | Test «AC1: renderizar no emite ningún warning de React»: espía `console.error` y falla si recibe **cualquier** llamada, con el dropdown renderizado con las seis props de configuración a la vez. Es más estricto que mirar atributos: React avisa por consola también de props desconocidas en los hijos |
| AC2 | El HTML del contenedor no lleva props de configuración | ✅ **CUMPLIDO** | Test «no filtra props de configuración al DOM»: comprueba los seis atributos y, además, que las props que **sí** son del DOM siguen llegando (la clase se compone, no se pisa). Era el `test.failing` que dejó el lote 2 como marcador: al cerrarse la fuga empezó a pasar y Jest lo reportó, que es exactamente para lo que estaba puesto |
| AC3 | Teclado: flechas, `Esc` + foco, `Enter`, saltar deshabilitados | ✅ **CUMPLIDO** | 12 tests en el bloque «AC3: teclado»: foco inicial (primero y item seleccionado), `ArrowDown` saltando un deshabilitado, `ArrowUp`, vuelta circular en los dos sentidos, `Home`/`End`, `Enter`, `Space`, item deshabilitado que no selecciona, `Esc` con retorno de foco, `Tab` sin retorno, `ArrowDown` en el trigger, y `tabIndex=-1` en todos los items |
| AC4 | Click fuera | ✅ **CUMPLIDO** | Tests «un click fuera cierra el menú», «un click fuera NO devuelve el foco al trigger» y «un click dentro del menú no lo cierra» |
| AC5 | `aria-controls` del trigger = `id` del menú | ✅ **CUMPLIDO** | Tests «AC5: aria-controls del trigger es el id del menú» (comprueba también el `aria-labelledby` recíproco) y «dos dropdowns en la misma página no comparten ids» |
| AC6 | Listener retirado al desmontar | ✅ **CUMPLIDO** | Test «AC6: el listener se quita al desmontar», con espías en `addEventListener` y `removeEventListener`: verifica que el handler retirado **es el mismo** que se registró, no sólo que hubo una llamada. Más «el listener no se registra mientras está cerrado» |

### Verificación de que los tests prueban algo

Los 21 tests pasaron a la primera, que es justo cuando hay que desconfiar. Se comprobaron por
**mutación**: quitando `aria-controls`, el `returnFocus` del `Esc` y el filtro
`:not([aria-disabled="true"])` del selector de items, fallan tres tests distintos. Sin esa
comprobación, un test que pasa a la primera no distingue entre «la funcionalidad está» y «el
test no mira».

### Suite completa

| | Antes del lote | Ahora |
|---|---|---|
| Unitarios | 211 | **232** |
| E2E (Chromium) | 147 | 147 (sin cambios: este lote no toca CSS) |
| `pnpm lint` | código 0 | código 0 |
| `tsc --noEmit` del paquete | 0 errores | 0 errores |
| `pnpm build` | 6/6 | 6/6 |

---

## 6. Decisiones tomadas

### D-01 — No se migra a `@react-aria/menu`; el teclado se implementa en los hooks

Es **la** decisión del lote, y el backlog pide tomarla con argumentos.

- **Contexto.** `AGENTS.md` §8.5 empuja a React Aria. `@react-aria/menu` +
  `@react-stately/menu` resolverían teclado, foco y typeahead con código probado.
- **El coste real no es la dependencia, es la API.** `@react-aria/menu` trabaja sobre el
  modelo de **colecciones** de React Stately: los items no son JSX arbitrario, son
  `<Item>` de `@react-stately/collections` que la librería introspecciona para construir
  la colección. El Dropdown de hoy es un compound con hijos libres
  (`<Dropdown.Item onSelect={…}>` puede contener cualquier cosa; la story
  `RealWorldExample` mete un `<div>` con dos líneas de texto). Migrar no es cambiar de
  motor de teclado: es **romper la API pública** de `@ownui/dropdown` y reescribir los
  cuatro subcomponentes, los tipos, las stories y los tests.
- **Opciones.** (a) Migrar ahora: rompe la API, se sale del alcance («accesibilidad e
  higiene de props») y mete 2 dependencias nuevas más sus transitivas. (b) No tocar el
  teclado y limitarse a reportarlo, que es la lectura literal de §8.5: deja el lote sin
  cumplir cuatro de sus seis criterios y el `role="menu"` sigue mintiendo. (c) Implementar
  el patrón de menú de la APW en los hooks, sin dependencias nuevas, manteniendo la API.
- **Decisión.** (c), y se deja constancia explícita de que es una desviación consciente de
  §8.5, no un descuido — que es lo que esa regla pide («dilo en el PR»).
- **Razón.** El patrón de menú de la APG es acotado y verificable: foco gestionado con
  `tabIndex={-1}` en todos los items y `.focus()` imperativo, flechas/`Home`/`End`/`Esc`/`Tab`
  en el `onKeyDown` del menú, y `Enter`/`Space` en el item. Cada pieza queda cubierta por un
  test de RTL. El trigger **sí** sigue pasando por React Aria (`@react-aria/button`), que es
  donde el hook adecuado existe de verdad.
- **Cuándo revisarlo.** Cuando el Dropdown se rehaga como `Select` con API de colección
  (**L16**): ahí el modelo de React Stately deja de ser un coste y pasa a ser la forma
  natural del componente. Registrado como gap.
- **Reversibilidad.** Alta en lo interno (el teclado vive en los hooks, no en los
  componentes), baja en lo público si luego se migra: eso será un `major` de todas formas.

### D-02 — Dos tasks en vez de tres

Ver la nota bajo la tabla de tasks: fusionar props+ids con teclado era la opción con mejor
relación coste/beneficio, porque la alternativa dejaba un commit que no compila.

### D-03 — ⚠️ REVERTIDA en la revisión: el menú sigue desmontándose al cerrar

> El mantenedor pidió arreglarlo. Ver **D-06**. El texto original se conserva porque el
> razonamiento sigue siendo válido en una parte: el cambio *es* observable y necesitaba
> decisión — lo que cambia es quién la toma.

#### Texto original

### D-03 (original) — El menú sigue desmontándose al cerrar

- **Contexto.** El lote 6 dejó el gap **G-01**: `DropdownMenu` devuelve `null` cuando está
  cerrado, así que el panel se monta ya abierto y la transición de apertura que tiene el CSS no
  se ve nunca. Aquel gap apuntaba a este lote.
- **Opciones.** (a) Mantener el menú montado con `hidden`/`aria-hidden` y `pointer-events:
  none`, que haría visible la transición. (b) Dejarlo como está.
- **Decisión.** (b), y el gap se queda abierto con el motivo.
- **Razón.** No es un detalle de implementación, es **comportamiento observable y ya testeado**:
  hay un test del lote 2 que afirma que los items **no están en el documento** con el menú
  cerrado, y mantenerlo montado cambia lo que un lector de pantalla recorre y lo que
  `screen.queryByText` encuentra. Eso merece su propia decisión de producto (y seguramente un
  `@starting-style` en vez de un montaje permanente), no colarlo dentro de un lote de a11y
  cuyos seis criterios no lo piden.
- **Reversibilidad.** Total: es el `if (!isVisible) return null;` de `Dropdown.tsx`.

### D-04 — ⚠️ CORREGIDA: el `Button` no tenía el bug

> **Me equivoqué, y la corrección importa porque esto quedó escrito en `AGENTS.md`.** Afirmé
> que `Button.tsx` monta la ref *forwarded* y que el bug «sigue abierto ahí». Es falso: el
> **lote 5 ya lo arregló** — `useButton` devuelve `domRef: innerRef`, `Button.tsx` monta
> `ref={domRef}` y hay un comentario en el hook explicando exactamente este fallo. Lo afirmé
> por el patrón que describe `AGENTS.md` §5.2 sin abrir el archivo.
>
> `Loader` tampoco lo tiene: no usa `useDOMRef`, reenvía su ref directamente, que es correcto
> porque no pasa por React Aria. Y `@ownui/dom-utils` **sí** tiene tests (6), contra lo que
> dice §9.10.
>
> Corregido en `AGENTS.md` §9.8, en el comentario de `useDropdown.tsx` y en el gap G-01, que
> queda eliminado. Lo que sí es cierto y se queda documentado es que **el Dropdown se había
> quedado atrás** respecto al arreglo del lote 5.

#### Texto original

### D-04 (original) — El arreglo de refs se limita al Dropdown

- **Contexto.** `useDOMRef` devuelve una `innerRef` que los componentes **no montan**: montan la
  ref *forwarded*. El resultado es que `innerRef.current` es siempre `null`, React Aria trabaja
  sin nodo y la ref del consumidor resuelve a `null`. Está igual en `Button.tsx`.
- **Decisión.** Arreglarlo en el Dropdown (el retorno de foco lo necesita) y **no** tocar el
  Button, dejándolo como gap **G-01** con el arreglo ya identificado.
- **Razón.** La regla del lote es no modificar componentes terminados salvo que un test lo
  exija. Aquí ningún criterio del lote 7 toca el Button, y su arreglo quiere sus propios tests
  (ref del consumidor, `onPress` de React Aria) que son un lote de Button, no de Dropdown.
- **Reversibilidad.** Trivial, es una línea por componente.

### D-05 — El impacto de versión baja a `minor` *(decisión del mantenedor)*

- **Contexto.** Pregunta abierta 1: puse `major` porque `useDropdownItem` cambia su API
  (exportada en `index.ts`) y los items pasan a `tabIndex={-1}`. Respuesta: **sí**, los hooks
  cuentan como API interna → `minor`.
- **Decisión.** `minor`, y los tres cambios observables listados **explícitamente** en el
  changeset bajo su propio encabezado, con una línea que dice que van en `minor` por decisión
  del mantenedor.
- **Razón del matiz.** D-06 añade un cambio observable que no existía cuando se tomó la
  decisión: el panel cerrado ahora está en el DOM, así que un `querySelector` lo encuentra y
  los snapshots de HTML cambian. No lo subo a `major` por mi cuenta —la decisión es del
  mantenedor— pero un `minor` silencioso sí sería un problema, así que la mitigación es que el
  CHANGELOG lo diga sin eufemismos. La accesibilidad **no** cambia: con `aria-hidden` e `inert`
  ni un lector de pantalla ni las consultas por rol lo ven.
- **Reversibilidad.** Una línea del changeset.

### D-06 — El panel cerrado se queda montado *(decisión del mantenedor)*

- **Contexto.** Era el gap G-01 del lote 6 y la D-03 de este lote, que había decidido dejarlo
  para más adelante. El mantenedor pidió arreglarlo.
- **Decisión.** `DropdownMenu` deja de devolver `null`. El panel se queda montado con
  `aria-hidden` (fuera del árbol de accesibilidad) e `inert` (fuera del foco y del puntero,
  todo el subárbol incluido), y el CSS lo oculta con `visibility: hidden`.
- **Por qué `inert` y no `hidden`.** `hidden` aplica `display: none`, que **mata la
  transición**: es justo lo que había que evitar. `visibility: hidden` sí es animable, pero
  depende de que la hoja de estilos haya cargado, y el comportamiento no debe depender de eso
  — de ahí `inert`, que lo garantiza desde el DOM.
- **Cómo se verificó.** En jsdom no hay transiciones, así que el mecanismo se prueba en los
  tests unitarios (el **mismo nodo** persiste al cerrar, y las clases y los atributos cambian)
  y la **interpolación real** en Chromium: se abre el panel y se mide la opacidad computada dos
  frames después, que tiene que estar estrictamente entre 0 y 1. El caso
  `prefers-reduced-motion` es el **control negativo**: la misma medida da exactamente 1, así
  que el test no puede pasar por accidente.
- **Coste aceptado.** Un nodo más en el DOM por dropdown montado, y el cambio observable de
  D-05.
- **Reversibilidad.** Total: es volver a poner el `if (!isVisible) return null;`.

---

## 7. Bloqueantes

**Ninguno.** Las 3 tasks se completaron; ninguna necesitó un segundo intento.

---

## 8. Preguntas abiertas, objeciones y gaps

### Objeciones al lote tal como está especificado

- **O-01 — «focus trap» no es lo que quiere un menú.** El enunciado del backlog pide «focus
  trap/retorno de foco». Se implementó el **retorno** de foco, no una trampa: un menú no es
  modal, y atrapar el foco dentro impediría que `Tab` lleve al siguiente elemento de la página,
  que es justo lo que el patrón de la APG manda que ocurra (y lo que hace el criterio AC3 al
  pedir que `Tab` cierre). Una trampa de foco sería correcta para el **Modal** (L13), no aquí.

### Gaps (fuera de alcance)

| ID | Hallazgo | Dónde corresponde |
| --- | --- | --- |
| ~~G-01~~ | ❌ **Retirado: era falso.** Afirmé que `Button` tenía el bug de refs sin abrir el archivo; el lote 5 ya lo había arreglado. Ver D-04 | — |
| ~~G-02~~ | ✅ **Resuelto en la revisión.** El menú ya no se desmonta, así que la transición se ve. Ver D-06 | — |
| G-07 | `AGENTS.md` §9.10 dice que `@ownui/dom-utils` «no tiene tests». **Tiene 6** desde el lote 5. Hay más entradas de §9.10 que pueden estar igual de desactualizadas: la lista merece una pasada completa contra el código, no parches sueltos | L9 (verdad en la documentación) |
| G-03 | **`@ownui/dropdown` no declara las dependencias que importa**: `useDropdown.tsx` importa `@react-aria/button` y `@react-aria/utils`, que están en el `package.json` **raíz**, no en el del paquete. Funciona en el monorepo por el hoisting de pnpm y es frágil al publicar. Es el §9.10 de `AGENTS.md`, y este lote añade un import más (`mergeRefs`) a la cuenta | L9 o un lote de empaquetado |
| G-04 | **Sin typeahead.** El patrón de menú de la APG incluye saltar al item que empieza por la letra pulsada. No está en los criterios del lote y es acumulativo (hace falta un buffer con temporizador) | L16 (Select) |
| G-05 | **El menú no se reposiciona** si no cabe en el viewport (viene del lote 6, G-05): sigue abriéndose siempre hacia abajo | L15 / L16 |
| G-06 | `@react-aria/menu` como motor, cuando el componente se rehaga con API de colección (D-01) | L16 |

### Preguntas abiertas

Las tres se resolvieron en la revisión (2026-11-21):

1. **¿`major` o `minor`?** → **`minor`**: los hooks cuentan como API interna (D-05).
2. **¿`Tab` cierra?** → **ok**, se queda como está.
3. **¿Arreglar lo que dejé fuera?** → **sí**: el menú ya no se desmonta (D-06); el bug del
   `Button` no existía (D-04).

Texto original de las preguntas:

1. **¿`major` es el bump correcto?** Puse `major` en `@ownui/dropdown` por dos cambios que
   rompen: `useDropdownItem` devuelve `itemClasses` aparte (API pública del hook, exportado en
   `index.ts`) y los items pasan a `tabIndex={-1}`. Si consideráis que los hooks son API
   interna pese a estar exportados, esto sería `minor`.
2. **¿`Tab` debe cerrar o sólo mover el foco?** El criterio pide que cierre y así está, pero
   nótese que el menú se desmonta: `Tab` cierra y el foco va al siguiente elemento **de la
   página**, no al siguiente item. Es el comportamiento de la APG; lo señalo porque es el que
   más sorprende al probarlo.
3. **¿`Space` debería seleccionar en el item?** Está implementado (con `preventDefault` para
   que no haga scroll). En un menú de acciones es lo habitual; si algún día los items pasan a
   ser checkboxes, `Space` querrá alternar en vez de seleccionar y cerrar.

---

## 9. Log cronológico

- **2026-11-21 ~21:45** — Fase 0. El PR #33 (lote 6) se mergeó en `develop` (`368b3fe`) con
  CI en verde, después de integrar el lote 5 y revalidar. Rama `claude/lote-7` creada desde
  ese `develop`. Inventario del punto de partida: el Dropdown tiene `aria-expanded`,
  `aria-haspopup`, `role="menu"`, `role="menuitem"`, `aria-disabled`, `aria-selected` y
  `tabIndex`, y **nada** de teclado, foco ni `aria-controls`.
- **2026-11-21 ~22:00** — **T1** (`2eb5410`): higiene de props, ids, refs, teclado, foco y
  click-outside, con 21 tests. Dos hallazgos durante la ejecución:
    · El lote 2 había dejado un `test.failing` como marcador de la fuga de props. Al cerrarla,
      Jest lo reportó («Failing test passed even though it was supposed to fail»), que es
      exactamente el aviso que ese marcador existía para dar. Promovido a test normal y
      ampliado.
    · `useDOMRef` no estaba montado por ningún componente del repo (montan la ref *forwarded*),
      así que el nodo del trigger no existía — y sin nodo no hay retorno de foco. Arreglado en
      el Dropdown; en `Button` queda como G-01 (D-04).
  Los 21 tests pasaron a la primera, así que se verificaron por mutación antes de commitear.
- **2026-11-21 ~22:10** — **T2**: `AGENTS.md` (§5.3 con el árbol, la tabla de teclas y las tres
  decisiones de implementación; §9.8 marcada como resuelta), changeset `major` y esta spec.
- **2026-11-21 ~22:30** — **Revisión del mantenedor.** Tres respuestas: `minor` (D-05), `Tab`
  se queda como está, y «arréglalo» a lo que había dejado fuera. Implementado como **T3**:
    · **D-06** — el panel se queda montado con `aria-hidden` + `inert`. Falló, como estaba
      previsto, el único test que afirmaba que los items **no** están en el documento con el
      menú cerrado (lo escribió el lote 2): actualizado al contrato nuevo — lo que se comprueba
      es que no está *expuesto*, y para eso `queryByRole` ya respeta `aria-hidden` igual que un
      lector de pantalla. Los 21 tests del lote pasaron sin tocar nada por ese mismo motivo.
      4 tests unitarios nuevos y 3 e2e, estos últimos midiendo la interpolación real en
      Chromium.
    · **D-04** — al ir a arreglar el bug de refs del `Button` resultó que **no existe**: el
      lote 5 ya lo había corregido. Mi gap G-01 era falso y estaba escrito en `AGENTS.md`;
      corregido ahí, en el comentario del hook y en la spec. De paso salió que §9.10 también
      miente sobre los tests de `dom-utils` (G-07).
  Suite tras los cambios: **236** unitarios (211 en la base), **150** e2e (147), lint en código
  0, build 6/6.
