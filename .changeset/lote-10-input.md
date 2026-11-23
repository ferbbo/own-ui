---
"@ownui/input": minor
"@ownui/tw-theme": minor
"@ownui/ui": minor
---

Nuevo componente: `Input`.

Campo de texto accesible sobre `@react-aria/useTextField`, con etiqueta,
texto de ayuda, mensaje de error e iconos a los lados. 8 roles semánticos, 3
tratamientos de marco (`outline`, `ghost`, `bordered`), 5 tamaños y los tipos
de texto habituales (`text`, `email`, `password`, `number`, `search`, `tel`,
`url`).

A diferencia del `Button`, **el rol no pinta el relleno**: colorea el borde y
el anillo de foco, y el relleno se queda en la superficie del tema. Un campo
de texto con fondo de rol es ilegible en cuanto lleva contenido.

`@ownui/tw-theme` publica `css/input.css` (agregado en `@ownui/tw-theme/css`)
y el contrato `variants/input`. `@ownui/ui` re-exporta `Input` y sus tipos.
