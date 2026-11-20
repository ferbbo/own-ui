---
"@ownui/button": major
---

Button: `variant` aplica clase, `loading` conserva el contenido e iconos reales (lote 5).

## Corregido

- **`variant` ya aplica clase.** El hook resolvía `button.theme[variant]`: consultaba el mapa de
  **roles** con una clave de **tratamiento**, así que `variant="dash"` y `variant="soft"` se
  perdían del todo y `variant="outline"` sólo funcionaba por coincidencia de nombre entre los
  dos mapas. Ahora resuelve `button.variant[variant]` y `ButtonVariant` es
  `"outline" | "dash" | "soft"` (sin `solid`, que no existe en el CSS).
- **`loading` ya no descarta el contenido.** El spinner se renderiza **junto** a los children,
  el botón declara `aria-busy="true"` y la interacción queda bloqueada mientras carga.
- **El spinner hereda tamaño y color del botón.** Antes era siempre `primary`/`md`: azul sobre
  azul (invisible) en un `btn-primary` y demasiado grande en un `btn-xs`.
- **Ninguna prop de configuración llega al DOM.** `loading` se colaba como atributo y React
  avisaba con `Received \`true\` for a non-boolean attribute \`loading\``.
- **`as="a"` vuelve a ser un enlace.** React Aria fuerza `role="button"` sobre todo elemento que
  no sea `<button>`; con `href` presente el rol se retira para no tapar el rol nativo `link`.
- **`disabled` emite `btn-disabled`** en vez de las utilidades `opacity-50 cursor-not-allowed`,
  que sólo existirían si el consumidor escaneara nuestro bundle con Tailwind.

## Añadido

- `startIcon` / `endIcon` ahora son `ReactNode` (antes estaban tipados `boolean`) y **se
  renderizan**, en el orden `[spinner] [startIcon] [children] [endIcon]`.
- `icon` define un botón icon-only: es el único contenido, exige `aria-label` en TypeScript y
  aplica `.btn-square` salvo que se pida otra `shape`.
- Modificadores de layout que el CSS ya tenía: `shape` (`square`/`circle`), `width`
  (`wide`/`block`) y `active`.

## Cambios que rompen la API (de ahí el `major`)

- `variant="solid"` y `variant="ghost"` ya no existen: un botón sólido es la ausencia de
  `variant`, y `ghost` es un rol (`theme="ghost"`).
- `startIcon`/`endIcon` pasan de `boolean` a `ReactNode`.
- Un botón con `icon` ya no acepta `children`.
