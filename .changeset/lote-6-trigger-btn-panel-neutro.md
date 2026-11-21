---
"@ownui/dropdown": minor
"@ownui/tw-theme": minor
---

Dropdown: el trigger reutiliza `.btn` y el rol semántico pasa a ser acento en vez de superficie (decisiones de revisión del PR #33).

## Cambiado

- **El trigger es un `.btn`.** `useDropdownTrigger` emite ahora
  `btn btn-{rol} btn-{tamaño} dropdown-trigger`, leyendo `theme` y `size` del contrato de
  `button`. Superficie, altura, relleno, radio, hover, `:focus-visible` y `:disabled` salen de
  `button.css`; `dropdown.css` se queda con `width: 100%`, `justify-content: space-between` y
  el estado abierto, que remapea los tokens `--btn-*` en lugar de duplicar la receta de color.
  Con ello el trigger **gana** por fin el color de su rol (antes un `variant="primary"` dejaba
  el trigger sin pintar) y `dropdown.css` pierde ~80 líneas de superficie duplicada.
- **El rol semántico ya no pinta el panel.** Las 8 variantes fijan `--dropdown-role` /
  `--dropdown-role-content` / `--dropdown-focus-color` en vez de `--dropdown-color`, así que la
  superficie del panel es siempre `--color-base-100` y el color del rol aparece sólo en el
  **item activo**, en el anillo de foco y en el trigger. Sin variante, el item activo cae a un
  realce neutro por `color-mix`, igual que antes.

## Por qué

El panel sólido de color tenía un problema de legibilidad que no era arreglable desde el CSS:
con la paleta actual, un panel `warning` o `success` pone texto `#ffffff` sobre un relleno
claro (≈2.15:1 y ≈2.28:1, **por debajo del 4.5:1 de WCAG AA**). Con el panel neutro, el texto
del menú es `--color-base-content` sobre `--color-base-100` y pasa AA en los dos temas, en las
ocho variantes; el par rol/`-content` sólo queda expuesto en la fila activa. Lo verifica el
fixture e2e, que mide el contraste computado de los ocho paneles en Chromium.

## Cambio observable

Un `<Dropdown variant="primary">` ya **no** pinta el panel entero de azul: pinta el trigger
(como un `.btn` primary) y la fila seleccionada. Es un cambio visual, no de API: no cambia
ninguna prop ni ningún tipo.

Dos notas para quien revise:

- `@ownui/dropdown` sube de `patch` a **`minor`**: con esta decisión su código sí cambia
  (`useDropdown.tsx`), no sólo las stories.
- El orden de los `@import` de `@ownui/tw-theme/css` pasa a ser **funcional**: `button.css`
  antes de `dropdown.css`. El agregador ya lo hace y hay un test e2e que lo fija.
