---
"@ownui/card": minor
"@ownui/tw-theme": minor
"@ownui/ui": minor
---

Nuevo componente: `Card`.

Superficie de agrupación con cabecera, título, cuerpo y pie (`Card.Header`,
`Card.Title`, `Card.Body`, `Card.Footer`), 8 roles semánticos, tres
tratamientos del marco (`elevated`, `outlined`, `ghost`) y 5 tamaños.

Como en el `Input`, **el rol no pinta el relleno**: colorea el borde, los
separadores de las partes y el anillo de foco. El contenido de un card es
arbitrario y no se puede repintar con el `-content` del rol.

Es un compound **estático**: las partes no comparten estado con el root y el
tamaño les llega por la cascada de custom properties, no por contexto de
React. El tratamiento de card accionable (puntero, hover elevado, anillo de
foco) lo reciben sólo `as="a"` y `as="button"`, para que no exista un card que
parezca pulsable sin ser enfocable.

`@ownui/tw-theme` publica `css/card.css` (agregado en `@ownui/tw-theme/css`) y
el contrato `variants/card`. `@ownui/ui` re-exporta `Card` y sus tipos.
