---
"@ownui/checkbox": minor
"@ownui/radio": minor
"@ownui/switch": minor
"@ownui/tw-theme": minor
"@ownui/ui": minor
---

Tres componentes nuevos: `Checkbox`, `Radio` y `Switch`.

Los tres son controles marcables accesibles sobre `@react-aria/*`, con 8 roles semánticos y 5
tamaños. `Checkbox` trae el tercer estado (`indeterminate`) y un `CheckboxGroup` opcional;
`Radio` sólo existe dentro de un `RadioGroup`, con recorrido por flechas y tabindex rotatorio;
`Switch` se anuncia como `role="switch"` y no tiene ni tercer estado ni grupo, a propósito.

`@ownui/tw-theme` añade una capa de tokens globales `--control-size`, `--control-radius`,
`--control-border-width`, `--control-gap` y `--control-mark-width`. Son globales y no de cada
componente porque la relación que fijan es **entre** los tres: a un mismo tamaño, una casilla,
un radio y un switch tienen que alinearse cuando conviven en un formulario. Hay un fixture e2e
que lo mide.

También publica `css/checkbox.css`, `css/radio.css` y `css/switch.css` (agregados en
`@ownui/tw-theme/css`) y sus contratos en `variants/`.
