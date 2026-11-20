---
"@ownui/tw-theme": minor
"@ownui/loader": minor
---

`color="current"` en el Loader: el spinner hereda el color del contexto (lote 5).

Antes, los ocho colores del Loader eran roles semánticos fijos (`--color-primary`,
`--color-success`…). Un spinner dentro de un botón tenía que elegir uno de ellos, así que el
spinner de un `btn-primary` salía azul sobre azul: invisible.

`.loader-current` fija `--loader-color: currentColor`, de modo que el spinner toma el `color`
del elemento que lo contiene — dentro de un `.btn` eso es `--btn-fg`, el token `-content` del
rol. El Button lo usa desde este lote y así contrasta en los 10 temas sin duplicar en React el
mapa rol de botón → color de loader.

Es aditivo: los ocho colores semánticos siguen igual y `primary` sigue siendo el default.
