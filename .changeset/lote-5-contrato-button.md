---
"@ownui/tw-theme": minor
---

Contrato de clases del Button alineado con el CSS (lote 5).

## Corregido

- **`variant.solid` ya no existe.** El contrato prometía `.btn-solid`, una clase que
  `button.css` nunca definió: "solid" es la **ausencia** de tratamiento. Un `variant="solid"`
  emitía una clase muerta.
- **`ghost` ya no está duplicado.** Estaba en `theme` y en `variant` a la vez, y era la razón
  por la que `variant="ghost"` parecía funcionar a pesar del bug de lookup del hook. `ghost` es
  un rol (fija `--btn-fg` desde `--btn-color`), no un tratamiento.

## Añadido

- `variant` declara los tres tratamientos que el CSS sí tiene: `outline`, `dash`, `soft`.
- **Modificadores de layout expuestos**: `shape` (`btn-square`, `btn-circle`), `width`
  (`btn-wide`, `btn-block`) y `state` (`btn-active`, `btn-disabled`). El CSS los tenía desde
  siempre y el contrato no los ofrecía, así que React no podía emitirlos.
- Test que cruza **cada clase del contrato contra `css/button.css`**: añadir una prop sin su CSS
  (o borrar una clase que el contrato promete) ahora falla en la suite, no en silencio en el
  navegador del consumidor.
