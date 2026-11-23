---
"@ownui/badge": minor
"@ownui/tw-theme": minor
"@ownui/ui": minor
---

Nuevo componente: `Badge`.

Etiqueta corta de estado con 8 roles semánticos, dos tratamientos (`outline`,
`soft`), 5 tamaños y un modificador `dot` para el punto de estado.

A diferencia del `Card` y del `Input`, el Badge **sí rellena con el rol**: su
contenido es sólo texto, así que el par rol / `-content` del tema es lo que
necesita. Los dos tratamientos, en cambio, pintan texto de color de rol sobre
una superficie, donde el `-content` no es legible: el CSS lo deriva mezclando
el rol hacia `--color-base-content`. Medido en Chromium, el peor caso pasa de
2.15:1 (`warning` puro sobre blanco) a 5.45:1, por encima del umbral AA.

Un `dot` sin `aria-label` es decorativo y se oculta al lector de pantalla; con
nombre pasa a ser información y recibe `role="img"`.

`@ownui/tw-theme` publica `css/badge.css` y el contrato `variants/badge`.
