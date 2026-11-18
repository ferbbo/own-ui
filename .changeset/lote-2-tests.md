---
"@ownui/button": patch
---

Arreglo del forwarding de ref en `Button` (lote 2).

`Button` montaba en el DOM el `ref` del consumidor mientras `useDOMRef` reflejaba en ese
mismo `ref` su `innerRef`, que nunca se asociaba a ningún nodo. Resultado: `ref.current`
quedaba siempre en `null` y React Aria tampoco recibía el elemento real.

`useButton` ahora devuelve `domRef` (el ref interno) y `Button` monta ese; el `ref` del
consumidor recibe el nodo a través del `useImperativeHandle` de `useDOMRef`.

Sin cambios de API: `loading`, `variant` e iconos siguen pendientes del lote 5.
