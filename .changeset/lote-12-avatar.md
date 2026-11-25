---
"@ownui/avatar": minor
"@ownui/tw-theme": minor
"@ownui/ui": minor
---

Nuevo componente: `Avatar`, con `Avatar.Group`.

Caja cuadrada que recorta su contenido, con 8 roles, dos formas (`circle`,
`square`) y 5 tamaños. La cascada de contenido es **imagen → hijos →
iniciales → icono de reserva**: si la imagen falla al cargar, el avatar baja al
escalón siguiente en vez de dejar el hueco de una imagen rota.

`Avatar.Group` solapa los avatares, recorta con `max`, resume el resto en un
contador `+N` —`total` permite contar también los que nunca llegaron, en una
lista paginada— y comparte `size` y `shape` por **contexto**, así que un avatar
envuelto en otro componente los sigue heredando.

Accesibilidad por escalón: con imagen el nombre lo da el `alt`; sin imagen la
caja recibe `role="img"` y el nombre; sin nombre que dar, se oculta en vez de
anunciar un nodo vacío.

`@ownui/tw-theme` publica `css/avatar.css` y el contrato `variants/avatar`.
