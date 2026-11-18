# Material rescatado de ramas descartadas

Contenido extraído en el **lote 0** de ramas que se descartan por estar demasiado
desactualizadas para mergear, pero que contenían trabajo aprovechable.

> ⚠️ **Esto es material de entrada, no documentación vigente.** Nada de esta carpeta
> describe necesariamente el estado actual del repo: viene de ramas con 38–42 commits de
> retraso. Verifica contra el código antes de usarlo. La fuente de verdad sigue siendo
> [`AGENTS.md`](../../AGENTS.md).

| Archivo                           | Origen                                                | Insumo para                                                   | Qué es                                                                                                                                                                                                                                                                                                                                |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tw-theme-README-componentes.md`  | `copilot/update-tw-theme-readme` (5 ahead, 38 behind) | **Lote 9** (verdad en la documentación)                       | +375 ln documentando el sistema de componentes y las variantes de `button`. Corrobora dos puntos de `AGENTS.md` §9: que `menu.css` no está implementado y que `ghost` está duplicado en `theme` y `variant`.                                                                                                                          |
| `e2e-fixture-react-components.md` | `copilot/update-react-to-19-0-3` (2 ahead, 42 behind) | **Lote 1** (fixture de estilos) y **lote 9** (app de ejemplo) | Fixture React + Vite que monta `@ownui/button` con un tema custom `brand` y un conmutador light/dark/brand. **No existe en `develop`** y `AGENTS.md` §11 no lo menciona. Es el punto de partida natural del fixture `component-styles/` que pide el lote 1. Transcrito a Markdown: es material de referencia, no código del proyecto. |

## Notas de uso

- El fixture fija `react` y `react-dom` en `^19.0.3` y `tailwindcss` en `4.1.1`. Ajusta a las
  versiones vigentes del repo antes de reutilizarlo (ver `specs/lote-0.md` D-08: el bump de
  React **no** se adoptó).
- El `index.css` del fixture declara un tema custom `brand` con los 8 tokens
  `--color-*-focus` **explícitos**. Es una confirmación independiente de que esos tokens son
  parte del contrato público del plugin, y respalda la decisión D-03 de conservarlos.
- El fixture usa Vite, mientras que los fixtures e2e actuales de `packages/tw-theme/e2e/`
  compilan con `@tailwindcss/cli` y se sirven estáticos. Reutilizar su contenido (App, tema,
  HTML) no implica adoptar Vite en el pipeline e2e.
