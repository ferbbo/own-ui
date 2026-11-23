# E2E — `@ownui/tw-theme`

Estas pruebas **no testean JavaScript**: compilan CSS real con la CLI de Tailwind y verifican en
Chromium los valores computados. Es el único mecanismo del repo que detecta regresiones de CSS
compilado, así que **todo cambio en el plugin viene con su fixture**.

```bash
pnpm install
pnpm --filter @ownui/tw-theme exec playwright install --with-deps chromium

pnpm --filter @ownui/tw-theme e2e        # compila fixtures + corre los tests
```

Estado actual: **150 tests en 9 fixtures**, todos en verde.

## Cómo funciona

```
e2e/fixtures/<caso>/{tailwind.config.js, input.css, index.html}
  → scripts/compile-fixtures.js   (compila con @tailwindcss/cli)
  → e2e/dist/<caso>/
  → sirv en :3456
  → e2e/tests/<caso>.spec.ts      (mide getComputedStyle en Chromium)
```

## Fixtures

| Fixture | Tests | Qué fija |
| --- | --- | --- |
| `default-themes` | 10 | Los temas light y dark que inyecta el plugin por defecto |
| `no-default-themes` | 6 | `themes: false` desactiva los temas built-in |
| `custom-theme` | 10 | Un tema completo declarado con `@plugin "@ownui/tw-theme/theme"` |
| `theme-switching` | 10 | Cambio en vivo entre temas con `data-theme` |
| `utility-classes` | 32 | Las utilidades de color generadas (`bg-`, `text-`, `border-`…) |
| `custom-root-scope` | 12 | La opción `root`: aplicar el tema a un ámbito y no a `:root` |
| `base-surfaces` | 18 | La escala de superficies `base-100/200/300` (lote 4) |
| `component-styles` | 21 | Que el CSS de componentes publicado define de verdad `.btn`, `.dropdown` y `.loader` (lote 1) |
| `dropdown` | 31 | Posicionamiento, elevación y orden de importación del menú y el trigger (lote 6) |

## Scripts

```bash
pnpm --filter @ownui/tw-theme e2e:build    # sólo compilar los fixtures
pnpm --filter @ownui/tw-theme e2e:test     # sólo correr los tests
pnpm --filter @ownui/tw-theme e2e:test:ui  # modo interactivo de Playwright
pnpm --filter @ownui/tw-theme e2e:report   # abrir el último informe HTML
```

## Añadir un fixture

1. `e2e/fixtures/<caso>/` con `tailwind.config.js`, `input.css` y `index.html`.
2. `e2e/tests/<caso>.spec.ts`, midiendo `getComputedStyle`, nunca el texto del CSS.
3. `pnpm --filter @ownui/tw-theme e2e`.

Un fixture nuevo no necesita registro: `compile-fixtures.js` recorre el directorio.
