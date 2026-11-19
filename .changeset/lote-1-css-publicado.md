---
"@ownui/tw-theme": minor
---

Publicación del CSS de componentes (lote 1): las clases que emiten los componentes React ya
vienen definidas en el paquete.

## Añadido

- **Subpath exports del CSS de componentes.** `@ownui/tw-theme/css` carga los tres componentes
  de golpe y `@ownui/tw-theme/css/<archivo>.css` uno a uno:

  ```css
  @import "tailwindcss";
  @plugin "@ownui/tw-theme";
  @import "@ownui/tw-theme/css";
  ```

- **`src/css/index.css`**, agregador de `button.css`, `dropdown.css` y `loader.css`.
- El build copia `src/css` a `dist/css`, así que el CSS entra en el tarball (`files: ["dist"]`).

## Corregido

- **El paquete publicado no definía ni una sola clase de componente.** `src/css/*.css` no se
  importaba en ningún sitio del repo y no se empaquetaba: quien instalaba la librería recibía
  `class="btn btn-primary btn-md"` sin reglas detrás, así que los componentes se renderizaban
  sin estilos fuera de Storybook.
- **El rango de peer de Tailwind excluía las versiones que el plugin necesita.** Era
  `">= 3.4.17 <4.1.1"` mientras el plugin usa la API de v4; instalar el paquete junto a
  Tailwind 4.1.1+ fallaba con `ERESOLVE` en npm. Ahora es `">=4.1.0 <5"`.

## Eliminado

- `src/css/menu.css` estaba vacío (0 líneas) y no existe componente `Menu` ni
  `variants/menu.ts`. El CSS de `.dropdown-menu*` llega en su propio lote.
