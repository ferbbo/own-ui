# @ownui/tw-theme

> Las entradas de **1.0.0** y **1.0.1** se reconstruyen a posteriori (lote 3): ambas versiones
> se publicaron desde la rama `tw-theme/v1`, que nunca se mergeó, así que el repo no tenía
> registro de lo que la gente instala. A partir de aquí las escribe Changesets.

## 1.0.1

Publicada el 2026-03-02 desde `tw-theme/v1`.

### Patch Changes

- Se empieza a publicar el CSS de componentes: el build copia `src/css` a `dist/css`, así que
  el tarball incluye `button.css`, `dropdown.css`, `loader.css` y `menu.css`.

### Problemas conocidos de esta versión (corregidos en la siguiente)

- **`exports["./css"]` apunta a un directorio** (`"./css": "./dist/css"`), y Node no resuelve un
  export que apunta a una carpeta ⇒ `@import "@ownui/tw-theme/css"` **falla** en el consumidor.
  Hay que importar cada archivo por su ruta real.
- **No hay agregador**: falta un `css/index.css` que cargue los cuatro de una vez.
- **`menu.css` va vacío** (0 líneas) dentro del paquete.
- **El rango de peer de Tailwind es `>= 3.4.17 <4.1.1`**, que excluye las versiones 4.1.x que el
  plugin realmente necesita (usa features de v4).

## 1.0.0

Publicada el 2025-12-15. Primera versión estable del plugin de Tailwind v4: sistema de color
semántico de 8 familias (`primary`, `secondary`, `accent`, `neutral`, `info`, `success`,
`warning`, `error`) como custom properties, temas light/dark intercambiables con `data-theme` o
`prefers-color-scheme`, utilidades de color generadas, temas custom vía
`@plugin "@ownui/tw-theme/theme"` y API tipada. **No publicaba el CSS de componentes**: las
clases que emiten los componentes React (`btn btn-primary btn-md`) llegaban sin definir.
