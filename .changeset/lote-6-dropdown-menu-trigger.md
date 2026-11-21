---
"@ownui/tw-theme": minor
"@ownui/dropdown": patch
---

CSS de `trigger` y `menu` del Dropdown (lote 6): el menú ya se posiciona, se eleva y cubre los 8 roles.

## Corregido

- **Las clases del menú y del trigger ya tienen CSS.** `useDropdown.tsx` emitía
  `dropdown-trigger`, `dropdown-trigger-active`, `dropdown-open`, `dropdown-menu`,
  `dropdown-menu-{variant|size|styleVariant}` y `dropdown-menu-open/closed`, y en
  `css/dropdown.css` **no existía ni un selector** para ninguna de ellas: el menú se
  renderizaba en el flujo del documento, empujando el contenido, sin elevación ni transición.
- **Las 8 variantes semánticas.** Sólo había CSS para `primary`, `secondary`, `accent` y
  `neutral`, mientras `DropdownVariant` permite los 8: `info`, `success`, `warning` y `error`
  se emitían como clase sin ninguna regla detrás.
- **El trigger hereda el rol.** Antes no recibía ningún estilo semántico: un
  `<Dropdown variant="primary">` dejaba el trigger sin pintar.
- **`variants/dropdown.ts` decía lo que no era.** Era una copia del contrato de `button`:
  declaraba `dropdown-outline`, `dropdown-solid` y `dropdown-link` (inexistentes) y no
  declaraba ninguna de las clases que sí se emiten.

## Añadido

- `.dropdown-trigger` / `.dropdown-trigger-active`: superficie, `:focus-visible` con `outline`
  de 2px, hover por `--color-*-focus` con caída a `color-mix`, y estado deshabilitado.
- `.dropdown-menu`: `position: absolute` bajo el trigger, `z-index`, `min-width` del ancho del
  trigger, radio, borde opcional y elevación escalada por `--depth` (con `--depth: 0` el panel
  se aplana, como el resto del sistema).
- `.dropdown-menu-open` / `-closed`: transición de `opacity`/`translate`/`visibility`, anulada
  por completo con `prefers-reduced-motion: reduce`.
- Variantes de tamaño y de estilo también con prefijo `.dropdown-menu-*`, para que funcionen
  desde el panel y no sólo desde el wrapper.
- Test de contrato (`src/__tests__/dropdown-contract.test.ts`) que cruza las tres capas —
  literales de `useDropdown.tsx`, `variants/dropdown.ts` y `css/dropdown.css` — y fixture e2e
  `dropdown/` con 23 tests sobre estilos computados en Chromium.

## Cambio observable

**`.dropdown` ya no pinta: ahora es sólo el wrapper de posicionamiento, y la superficie vive en
`.dropdown-menu`.** Antes el contenedor raíz tenía fondo, relleno y sombra propios, aunque en el
árbol de React envuelve al trigger **y** al menú: el "panel" encerraba también al trigger. Quien
dependa del fondo o de la sombra de `.dropdown` dejará de verlos; el selector equivalente es
ahora `.dropdown-menu`. Los componentes de `@ownui/dropdown` no necesitan ningún cambio: ya
emitían las dos clases.
