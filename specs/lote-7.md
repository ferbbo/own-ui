# Lote 7 — Dropdown: accesibilidad e higiene de props

## 1. Meta

| Campo           | Valor                                                                        |
| --------------- | ---------------------------------------------------------------------------- |
| Lote            | **L7** — Dropdown: accesibilidad e higiene de props (`@docs/BUILD-BATCHES.md` §L7) |
| Rama base       | `develop` (en `368b3fe`, "Merge pull request #33 from ferbbo/claude/lote-6") |
| Rama de trabajo | `claude/lote-7`                                                              |
| Estado general  | EN CURSO                                                                     |
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
| S01 | `DropdownRoot` separa `contextProps` de `domProps` explícitamente; el `<div>` recibe sólo atributos DOM válidos | AC1, AC2 | `Dropdown.tsx`, `Dropdown.types.ts` | — | PENDIENTE |
| S02 | `useId` en el provider → `menuId` / `triggerId` en contexto; `aria-controls` + `id` en el trigger, `id` + `aria-labelledby` en el menú | AC5 | `DropdownContext.tsx`, `useDropdown.tsx`, `Dropdown.types.ts` | S01 | PENDIENTE |
| S03 | `useDropdownItem` devuelve `itemClasses` aparte, como el resto de hooks | — | `useDropdown.tsx`, `Dropdown.tsx` | — | PENDIENTE |
| S04 | Navegación por teclado en el menú: `ArrowDown`/`ArrowUp` (saltando deshabilitados), `Home`/`End`, `Esc` (cierra + devuelve foco), `Tab` (cierra) | AC3 | `useDropdown.tsx` | S02 | PENDIENTE |
| S05 | `Enter`/`Space` seleccionan en el item; `ArrowDown`/`ArrowUp` en el trigger abren y enfocan | AC3 | `useDropdown.tsx` | S04 | PENDIENTE |
| S06 | Foco inicial al abrir (item activo si hay, primero si no) y retorno al trigger al cerrar con `Esc` o selección | AC3 | `useDropdown.tsx` | S04 | PENDIENTE |
| S07 | Click-outside: listener de `pointerdown` en `document` sólo mientras está abierto, con limpieza | AC4, AC6 | `useDropdown.tsx` | S01 | PENDIENTE |
| S08 | Tests de higiene: sin warnings de React y sin props de configuración en el DOM | AC1, AC2 | `__test__/Dropdown.test.tsx` | S01 | PENDIENTE |
| S09 | Tests de teclado, foco y click-outside, incluida la limpieza del listener | AC3, AC4, AC6 | `__test__/Dropdown.test.tsx` | S04–S07 | PENDIENTE |
| S10 | `AGENTS.md` (§5.3, §9.8), changeset y spec | — | `AGENTS.md`, `.changeset/`, `specs/lote-7.md` | S01–S09 | PENDIENTE |

---

## 4. Tabla de TASKS

| ID  | Slices | Predecesora | Modo + justificación | Commit | Estado |
| --- | ------ | ----------- | -------------------- | ------ | ------ |
| T1  | S01, S02, S03, S08 | — | **SECUENCIAL** — base: reorganiza el contrato de props y el contexto, de donde cuelga el resto | — | PENDIENTE |
| T2  | S04–S07, S09 | T1 | **SECUENCIAL** — el teclado necesita los ids y el contexto de T1, y todo vive en `useDropdown.tsx` | — | PENDIENTE |
| T3  | S10 | T1, T2 | **SECUENCIAL** — documenta el resultado | — | PENDIENTE |

Aquí **no hay paralelismo posible** y conviene decirlo: las dos tasks de código tocan los
mismos tres archivos (`Dropdown.tsx`, `DropdownContext.tsx`, `useDropdown.tsx`). En los lotes
anteriores el paralelismo salía de que CSS, e2e y stories viven en paquetes distintos; este
lote es todo comportamiento en un único paquete.

---

## 5. Checklist de criterios de aceptación

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| AC1 | PENDIENTE | — |
| AC2 | PENDIENTE | — |
| AC3 | PENDIENTE | — |
| AC4 | PENDIENTE | — |
| AC5 | PENDIENTE | — |
| AC6 | PENDIENTE | — |

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

---

## 7. Bloqueantes

Ninguno por ahora.

---

## 8. Preguntas abiertas, objeciones y gaps

(Se completa durante la ejecución.)

---

## 9. Log cronológico

- **2026-11-21 ~21:45** — Fase 0. El PR #33 (lote 6) se mergeó en `develop` (`368b3fe`) con
  CI en verde, después de integrar el lote 5 y revalidar. Rama `claude/lote-7` creada desde
  ese `develop`. Inventario del punto de partida: el Dropdown tiene `aria-expanded`,
  `aria-haspopup`, `role="menu"`, `role="menuitem"`, `aria-disabled`, `aria-selected` y
  `tabIndex`, y **nada** de teclado, foco ni `aria-controls`.
