# @ownui/example-app

App de ejemplo de Own UI: Vite + React 19 + TypeScript. Consume `@ownui/ui` y
`@ownui/tw-theme` por `workspace:*`.

```bash
# desde la raíz del monorepo
pnpm install
pnpm example          # construye las dependencias y arranca Vite en :5173
pnpm example:build    # typecheck + build de producción en apps/example-app/dist
```

## Para qué sirve

1. **Documentación ejecutable.** Muestra las tres formas de configurar el plugin
   (`src/styles.css`), el cambio de tema por `data-theme` y todas las variantes de los tres
   componentes publicados.
2. **Prueba de humo de consumo real.** No hay alias a `packages/*`: los imports resuelven por el
   symlink de pnpm a lo que cada paquete declara en `exports`, es decir a su `dist/`. Si un
   paquete deja de publicar algo —el bug raíz del lote 1, con el CSS de componentes fuera del
   bundle— la app se rompe aquí antes que en el proyecto de alguien.

La prueba **no sustituye** a instalar un tarball de `npm pack` fuera del monorepo: el symlink de
pnpm resuelve cosas que un `node_modules` real no resolvería. Ver `specs/lote-9.md` §G-01.

## Estructura

| Archivo                 | Rol                                                                        |
| ----------------------- | -------------------------------------------------------------------------- |
| `src/styles.css`        | Entrada de Tailwind: plugin, CSS de componentes y tema propio `ownui-dusk` |
| `src/ThemeSwitcher.tsx` | Escribe `data-theme` en `<html>`                                           |
| `src/layout.tsx`        | Primitivas de maquetación; todo el color sale de utilidades de superficie  |
| `src/sections/`         | Un showcase por componente                                                 |
