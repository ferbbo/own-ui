---
"@ownui/tw-theme": minor
---

Escala de superficies `base-100/200/300` (lote 4): ahora existe, está completa y depende del tema.

## Corregido

- **`--color-base-100` ya existe.** `css/dropdown.css` lo referenciaba tres veces sin que
  ningún tema lo definiera. Un `var()` a un token *indefinido* queda `guaranteed-invalid`, y
  eso **no** dispara el fallback (IACVT), así que `background-color` caía a `transparent`: el
  dropdown se renderizaba sin fondo.
- **Un `.btn` sin variante ya no sale negro en tema claro.** `css/button.css` usa
  `--color-base-200` como relleno por defecto y `--color-base-content` como texto. Los dos
  tokens eran globales y fijos (`#000000` y `#ffffff`), así que no cambiaban con el tema.

## Añadido

- Escala completa de superficies, definida **por tema** en `themes/light.ts` y `themes/dark.ts`:

  | Token | Light | Dark | Rol |
  |---|---|---|---|
  | `--color-base-100` | `#ffffff` | `#1d232a` | superficie principal |
  | `--color-base-200` | `#f2f2f2` | `#191e24` | superficie elevada/alterna |
  | `--color-base-300` | `#e5e6e6` | `#15191e` | bordes y separadores |
  | `--color-base-content` | `#1f2937` | `#e5e7eb` | texto sobre superficies |

- **16 utilidades de superficie**: 4 tokens × 4 prefijos (`bg`, `text`, `border`, `divide`).
  Ej.: `.bg-base-100`, `.text-base-content`, `.border-base-300`, `.divide-base-300`. No se
  emite `ring-base-*` (un anillo de foco del color de la superficie no contrasta con ella) ni
  variantes `-content`/`-focus` sobre las superficies numeradas.
- Tipos `SurfaceColorName` y `ColorToken` en el entrypoint público.
- `generateSurfaceUtilities()` exportado desde `utilities/colors.ts`.

## Cambios de comportamiento

Conviene leerlos antes de actualizar:

1. **`--color-base-200` y `--color-base-content` cambian de valor y de sitio.** Pasan de
   `:root` (globales, `#000000` / `#ffffff`) a los temas. Si tenías algo que dependía de que la
   superficie por defecto fuera negra y el texto blanco en **ambos** temas, ahora seguirá al
   tema. Es el arreglo, pero es observable.
2. **Con `@plugin "@ownui/tw-theme" { themes: false }` ya no hay tokens de superficie.** Antes
   `base-200` y `base-content` sobrevivían porque venían de `:root`. Ahora, igual que pasa con
   `--color-primary`, quien deshabilite los temas built-in define sus propias superficies en su
   tema custom. No se duplican en `root.ts` a propósito: `:root` (0,1,0) vencería a
   `:where(:root)` (0,0,0) y el "fallback" ganaría al tema.
3. **`src/themes/rootColors.ts` se elimina.** No era API pública (no se exportaba desde
   `index.ts`), así que no debería afectar a ningún consumidor; se menciona por completitud.

## Verificación

20 tests unitarios nuevos y un fixture e2e nuevo (`base-surfaces/`, 18 tests sobre estilos
computados en Chromium). `src/__tests__/surfaces.test.ts` deja como gate permanente que todo
token `--color-base-*` referenciado en `src/css/*.css` exista en los dos temas, y que las 3
superficies pasen WCAG AA (≥ 4.5:1) contra `base-content`.
