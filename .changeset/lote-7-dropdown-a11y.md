---
"@ownui/dropdown": minor
---

Dropdown: navegación por teclado, gestión de foco y fin de la fuga de props al DOM (lote 7).

## Corregido

- **Las props de configuración ya no llegan al DOM.** `variant`, `size`, `styleVariant`,
  `defaultOpen`, `open` y `onOpenChange` acababan como atributos del `<div>` contenedor, con un
  aviso de React por cada uno y atributos inválidos en el HTML servido. El root ahora separa
  las props de configuración de las de DOM con una desestructuración explícita y tipada.
- **El trigger monta su ref de verdad.** El componente montaba la ref *forwarded* en vez de la
  `innerRef` que devuelve `useDOMRef`, así que `innerRef.current` era siempre `null`: React Aria
  trabajaba sin nodo y la ref que recibía el consumidor resolvía a `null`.

## Añadido

- **Teclado completo** (patrón de menú de la APG): flechas, `Home` / `End`, `Enter` / `Space`,
  `Esc` y `Tab`, con las flechas saltando los items deshabilitados y vuelta circular.
  `ArrowDown` / `ArrowUp` sobre el trigger abren el menú y meten el foco dentro.
- **Gestión de foco.** Al abrir, el foco entra en el item seleccionado (o en el primero). `Esc`
  y la selección lo devuelven al trigger; un click fuera no, porque ahí el usuario está yendo a
  otra parte.
- **Cierre por click fuera**, con un listener de `pointerdown` que sólo existe mientras el menú
  está abierto y se retira al cerrar o desmontar.
- **`aria-controls` / `aria-labelledby`** generados con `useId`, enlazando trigger y menú en los
  dos sentidos.

- **El panel ya no se desmonta al cerrarse.** Se queda en el DOM con `aria-hidden` e `inert`,
  que es lo que hace falta para que la transición de apertura que define `dropdown.css` se vea:
  sin un estado inicial en el DOM, el navegador no tiene nada que interpolar.

## ⚠️ Cambios observables

- **`useDropdownItem` devuelve `itemClasses` aparte**, en vez de meter `className` dentro de
  `itemProps`. Era la única excepción entre los cuatro hooks del paquete. Si consumías el hook
  directamente, ahora hay que aplicar `className={itemClasses}` en tu elemento; si usas
  `<Dropdown.Item>`, no cambia nada.
- **Los items pasan a `tabIndex={-1}`**, incluidos los habilitados. Es lo que pide el patrón de
  menú: el único punto de entrada por `Tab` es el trigger, y dentro del menú el foco se mueve
  con las flechas. Si dependías de tabular por los items, ese recorrido ya no existe.
- **El menú cerrado está en el DOM.** Un `document.querySelector(".dropdown-menu")` ahora
  encuentra el panel aunque esté cerrado, y los snapshots del HTML cambian. Lo que **no**
  cambia es la accesibilidad: con `aria-hidden` e `inert`, un lector de pantalla y las
  consultas por rol de Testing Library siguen sin verlo, igual que antes.

Los tres van en un `minor` y no en un `major` por decisión explícita del mantenedor: los hooks
se consideran API interna pese a estar exportados. Queda escrito aquí para que quien lea el
CHANGELOG no se lo encuentre por sorpresa.

## Nota sobre React Aria

No se migró a `@react-aria/menu`: trabaja sobre el modelo de colecciones de React Stately, que
obligaría a que los items fueran `<Item>` de `@react-stately/collections` en vez de JSX libre.
Eso no es cambiar de motor de teclado, es rehacer la API pública del compound; la decisión, con
sus argumentos, está en `specs/lote-7.md` D-01. **No se añadió ninguna dependencia** en este
lote.
