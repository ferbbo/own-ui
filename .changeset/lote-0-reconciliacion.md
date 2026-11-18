---
"@ownui/tw-theme": minor
---

Reconciliación de ramas (lote 0): se corrige el parseo del flag de tema custom y se añade la capa de tokens de estado.

## Corregido

- **`--prefersdark` ya funciona.** `getThemeNameConfig` comparaba el flag contra el literal
  `"string"` en vez de usar `typeof`, así que la primera rama se cumplía siempre y **todo** tema
  custom se registraba como `--default`. Un tema declarado con `--prefersdark` se ignoraba y no
  llegaba nunca a su `@media (prefers-color-scheme: dark)`.
- Se toleran espacios de más entre el nombre del tema y su flag (`"mi-tema   --prefersdark"`).

## Añadido

- 5 tokens globales de estado en `:root`: `--hover-depth` (7%), `--active-depth` (5%),
  `--disabled-bg-opacity` (60%), `--disabled-fg-opacity` (35%) y `--transition-duration` (0.2s).
  Permiten ajustar la intensidad de las interacciones desde el tema. Son aditivos: no redefinen
  ningún token existente.
- `css/button.css` reescrito sobre custom properties puras (sin `@apply`), con escala de tamaños
  completa (`xs`…`xl`) y estados derivados con `color-mix`. El conjunto de clases no cambia.
  Este archivo **sigue sin publicarse** en el paquete; lo resuelve el lote 1.

## Cambios de comportamiento

Ambos derivan del fix de arriba y conviene leerlos antes de actualizar:

1. Un tema custom con flag `--prefersdark` **cambia de sitio**: antes pintaba la raíz como tema
   por defecto (por el bug); ahora se registra dentro de `@media (prefers-color-scheme: dark)`,
   que es lo que declaraba.
2. Un flag **desconocido** (`--typo`) ahora aborta el registro con
   `Invalid theme name configuration` en vez de degradarse en silencio a `--default`. Falla en
   build, no en producción.

Si se considera que (2) rompe compatibilidad para quien tuviera un flag mal escrito, este
changeset debería subirse a `major` antes de publicar.
