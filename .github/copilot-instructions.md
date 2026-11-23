# AI Coding Instructions for Own UI

**La fuente de verdad de este repo es [`AGENTS.md`](../AGENTS.md).** Léelo antes de escribir
código: describe la arquitectura real (tokens, plugin de Tailwind, contrato de clases, patrones
de componente), las convenciones y la deuda técnica conocida, verificado contra el código.

Este archivo era una segunda descripción de la arquitectura y se había desincronizado: situaba
los componentes en un directorio `components/` colgando de `packages/`, las utilidades de DOM
en un `dom.ts` suelto y los imports como rutas relativas de tres niveles. Ninguna de esas rutas
existe en este monorepo (los componentes viven en `packages/ui/src/<Name>/`, `useDOMRef` en
`packages/utils/dom-utils/src/` y se importa como `@ownui/dom-utils`). Mantener dos
descripciones del mismo sistema garantiza que una de las dos mienta, así que esta pasa a ser un
puntero.

## Dónde está cada cosa

| Pregunta | Dónde |
| --- | --- |
| Arquitectura, tokens, convenciones, deuda | [`AGENTS.md`](../AGENTS.md) |
| Plan de trabajo por lotes | [`@docs/BUILD-BATCHES.md`](../@docs/BUILD-BATCHES.md) |
| Cómo se escribe un componente React | [`instructions/components-react.instructions.md`](instructions/components-react.instructions.md) |
| Cómo se escribe el CSS de un componente | [`instructions/components-css.instructions.md`](instructions/components-css.instructions.md) |
| Cómo se publica | [`RELEASE_SETUP.md`](RELEASE_SETUP.md) |
| Consumo real de los paquetes | [`apps/example-app/`](../apps/example-app/README.md) |

## Lo mínimo que no puedes saltarte

1. **El contrato manda.** Para cada componente, `packages/ui/src/<Name>/` (React),
   `packages/tw-theme/src/variants/<name>.ts` (contrato) y
   `packages/tw-theme/src/css/<name>.css` (CSS) tienen que decir lo mismo.
   `pnpm check:contract` lo verifica y corre en CI.
2. **Ningún color literal fuera de `packages/tw-theme/src/themes/*.ts`.** En el CSS de
   componente, siempre `var(--color-*)` y mezclas en `oklab`/`oklch`.
3. **CSS antes que React.** Un componente cuyo CSS no esté importado en
   `packages/tw-theme/src/css/index.css` no se publica, y sale sin estilos en el proyecto de
   quien lo instale.
4. **Todo componente interactivo pasa por un hook de `@react-aria/*`.**
5. **Tests reales**, nunca stubs de `console.log`.
6. **`pnpm`**, nunca npm ni yarn; dependencias internas con `workspace:*`.
7. **Un componente nuevo se crea con `pnpm create-component <Name>`**, que genera las tres capas
   ya registradas.
8. Commits en conventional commits; comentarios y JSDoc en español.
