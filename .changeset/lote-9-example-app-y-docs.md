---
"@ownui/tw-theme": patch
---

El CSS de componentes publicado se verifica ahora desde una app real.

`apps/example-app` consume `@ownui/tw-theme` por sus `exports` —no por rutas al fuente— y
monta las variantes de los tres componentes sobre los temas built-in y uno propio declarado
con `@plugin "@ownui/tw-theme/theme"`. Es la prueba de humo que faltaba para el contenido de
`./css`: si el paquete deja de publicarlo, la app deja de compilar estilada.

Storybook pasa a importar ese mismo `@ownui/tw-theme/css`. Hasta ahora no lo hacía, así que el
escaparate visual del repo renderizaba los componentes sin un solo estilo.

No cambia ninguna API ni ningún token del paquete: sólo documentación ejecutable y
verificación.
