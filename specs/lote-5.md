# Lote 5 — Button: contrato, loading e iconos

## 1. Meta

| Campo           | Valor                                                                              |
| --------------- | ---------------------------------------------------------------------------------- |
| Lote            | **L5** — Button: contrato, loading e iconos (`@docs/BUILD-BATCHES.md` §L5)         |
| Rama base       | `develop` (en `0afe779`, que ya integra los lotes 0–4)                             |
| Rama de trabajo | `claude/lote-5`                                                                    |
| Estado general  | **COMPLETO** — 8 tasks, 0 bloqueadas, 12/12 criterios cumplidos                     |
| Fecha           | 2026-11-20                                                                         |

> **Nota sobre el número de lote.** El prompt programado llegó por **quinta** vez con el
> marcador `{{N}}` sin sustituir. `develop` ya contiene los lotes 0–4 (el último merge es
> el PR #31, del lote 4) y no existe rama `claude/lote-5`, así que el marcador se resuelve a
> **N = 5**, el siguiente lote del backlog. Registrado como **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt (igual que en los lotes 0–4):

- **Slice** = unidad mínima verificable y testeable por sí sola (un componente, o una
  variante/estado/comportamiento suyo), con criterios de aceptación propios.
- **Task** = agrupación de slices cohesivos (mismo componente o módulo, archivos compartidos o
  criterios acoplados). **Una task = un commit.**

Reglas de oro de `@docs/BUILD-BATCHES.md` que condicionan este lote:

- **El contrato manda.** `variants/button.ts` ⇄ `css/button.css` ⇄ `Button.types.ts` deben decir
  lo mismo. Este lote es, literalmente, el lote de reconciliar esas tres capas; se convierte la
  regla en un **test automático** que cruza el contrato contra el CSS (S05).
- **CSS antes que React.** Por eso el plugin (`variants/*`, `css/*`) se toca primero (T1–T3) y
  el componente después (T4–T6).
- **Cambio en el plugin ⇒ fixture e2e.** La clase nueva `.loader-current` se verifica sobre CSS
  compilado en Chromium (T3), no leyendo el archivo.
- **Tests reales.** Ningún stub; cada criterio se cubre con RTL o Playwright.

### Criterios de aceptación del lote (del backlog §L5)

| ID  | Criterio                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------- |
| AC1 | Test: para cada `variant ∈ {outline, dash, soft}`, el nodo tiene la clase `btn-<variant>`                  |
| AC2 | Test: para los 10 `theme`, clase `btn-<theme>`                                                            |
| AC3 | Test: `loading` ⇒ children siguen en el DOM **y** existe `[role="status"]` **y** `aria-busy="true"`        |
| AC4 | Test: `startIcon`/`endIcon` renderizan el nodo en el orden correcto                                       |
| AC5 | Test: `as="a"` + `href` renderiza `<a href>`; `disabled` no es aceptado por TS en `as="a"` (`@ts-expect-error`) |
| AC6 | `grep -n "button.theme\[variant\]" packages/ui` → sin resultados                                          |
| AC7 | Stories: `AllVariants` muestra diferencia visual real de las 3 variantes                                  |

Criterios adicionales que el lote arrastra por gaps abiertos en lotes previos (ver §5):

| ID  | Criterio                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------- |
| AC8 | **G-03**: ninguna prop de configuración del botón (`loading`, `variant`, `theme`, iconos…) llega al DOM    |
| AC9 | **G-02**: `as="a"` + `href` expone el rol `link`, no `button`                                             |
| AC10 | **G-05**: `useButton` sigue devolviendo `domRef` y el forwarding de ref sigue cubierto por test           |
| AC11 | El spinner del botón hereda tamaño y color del botón (no es siempre `primary`/`md`)                       |
| AC12 | Un botón icon-only con `loading` muestra **sólo** el spinner (respuesta del dueño a Q-03)                 |

---

## 3. Tabla de SLICES

| ID  | Descripción | Criterios | Archivos afectados | Depende de | Estado |
| --- | ----------- | --------- | ------------------ | ---------- | ------ |
| S01 | `variants/button.ts`: `variant: {outline, dash, soft}` (fuera `solid`, que no existe en CSS, y fuera el `ghost` duplicado) | AC1, AC6 | `packages/tw-theme/src/variants/button.ts` | — | HECHO |
| S02 | `variants/button.ts`: exponer los modificadores de layout que el CSS ya tiene (`btn-square`, `btn-circle`, `btn-wide`, `btn-block`, `btn-active`) | AC1 | `packages/tw-theme/src/variants/button.ts` | S01 | HECHO |
| S03 | Test unitario que cruza **cada clase del contrato** contra `css/button.css` (y el de loader contra `loader.css`) | AC1, AC6 | `packages/tw-theme/src/variants/__tests__/contract.test.ts` (nuevo) | S01, S02 | HECHO |
| S04 | `.loader-current` en `loader.css` (`--loader-color: currentColor`) + entrada `current` en `variants/loader.ts` + tipo `LoaderColor` | AC11 | `packages/tw-theme/src/css/loader.css`, `src/variants/loader.ts`, `packages/ui/src/Loader/src/Loader.types.ts` | — | HECHO |
| S05 | Test de `Loader` con `color="current"` | AC11 | `packages/ui/src/Loader/__test__/Loader.test.tsx` | S04 | HECHO |
| S06 | Fixture e2e de `.loader-current`: el spinner toma el color del contenedor (y dentro de un `.btn-primary` toma `--btn-fg`) | AC11 | `packages/tw-theme/e2e/fixtures/component-styles/index.html`, `e2e/tests/component-styles.spec.ts` | S04 | HECHO |
| S07 | `ButtonVariant` sin `solid`; `startIcon`/`endIcon` retipados a `ReactNode`; `icon` como botón icon-only con `aria-label` obligatorio; props `shape`/`width`/`active` | AC1, AC4 | `packages/ui/src/Button/src/Button.types.ts` | S01, S02 | HECHO |
| S08 | `useButton`: `button.variant[variant]` (no `button.theme[variant]`), modificadores de layout, y **ninguna prop de configuración al DOM** | AC1, AC6, AC8, AC10 | `packages/ui/src/Button/src/useButton.tsx` | S07 | HECHO |
| S09 | `as="a"` expone el rol `link`: se retira el `role="button"` que React Aria fuerza sobre el ancla | AC5, AC9 | `packages/ui/src/Button/src/useButton.tsx` | S08 | HECHO |
| S10 | `loading`: `aria-busy="true"`, interacción bloqueada, spinner **junto** al contenido | AC3 | `packages/ui/src/Button/src/useButton.tsx`, `Button.tsx` | S08 | HECHO |
| S11 | El spinner hereda tamaño (mapa `ButtonSize → LoaderSize`) y color (`color="current"`) | AC11 | `packages/ui/src/Button/src/useButton.tsx`, `Button.tsx` | S04, S10 | HECHO |
| S12 | Render de `startIcon`/`endIcon` en orden, y de `icon` como único contenido con `.btn-square` | AC4 | `packages/ui/src/Button/src/Button.tsx`, `useButton.tsx` | S07, S10 | HECHO |
| S13 | Tests de Button: variantes, themes, loading, iconos, modificadores, fuga de props, rol del ancla | AC1–AC6, AC8–AC11 | `packages/ui/src/Button/__test__/Button.test.tsx` | S08–S12 | HECHO |
| S14 | Stories: `AllVariants`, `AllSizes`, `WithIcons`, `IconOnly`, `Modifiers`, `Loading`; + limpieza de los ~40 warnings de Prettier preexistentes (**G-07**) | AC7 | `packages/ui/src/Button/src/Button.stories.tsx` | S07–S12 | HECHO |
| S15 | Documentación: `AGENTS.md` §4.7, §5.6, §9.4, §9.5 y §9.10 al día + changesets | — | `AGENTS.md`, `.changeset/*` | S01–S14 | HECHO |
| S16 | Un botón icon-only con `loading` renderiza sólo el spinner (sin el icono) | AC12 | `packages/ui/src/Button/src/useButton.tsx`, `__test__/Button.test.tsx`, `Button.stories.tsx`, `AGENTS.md` | S12 | HECHO |

---

## 4. Tabla de TASKS

| ID  | Slices | Predecesora(s) | Modo + justificación | Commit | Estado |
| --- | ------ | -------------- | -------------------- | ------ | ------ |
| T1 | S01, S02, S03 | — | **SECUENCIAL** (primera). Toca el contrato del plugin, del que depende todo lo demás. | `9a9f3a0` | HECHO |
| T2 | S04, S05 | — | **PARALELO posible** con T1: archivos disjuntos (`loader.css`/`variants/loader.ts`/tipos de Loader vs `variants/button.ts`). Se ejecutó después por el orden de commit, no por dependencia. | `d96611b` | HECHO |
| T3 | S06 | T2 | **SECUENCIAL**: el fixture e2e verifica el CSS que añade T2. | `a095548` | HECHO |
| T4 | S07–S13 | T1, T2 | **SECUENCIAL**, y **reagrupada** respecto al plan inicial (ver **D-03**): tipos, hook, render y tests van en un commit porque el retorno del hook *es* el contrato del componente. Partirlos dejaba un commit intermedio en el que `Button.tsx` ignoraba la mitad de lo que el hook devuelve: un commit que no pasa sus propios criterios. | `aa0c03d` | HECHO |
| T5 | S14 | T4 | **SECUENCIAL**: las stories consumen la API final. | `b752486` | HECHO |
| T6 | S15 (docs) | T5 | **SECUENCIAL**: cierre documental con la evidencia de todo lo anterior. | `82a5cf4` | HECHO |
| T7 | S15 (spec + changesets) | T6 | **SECUENCIAL**: cierre de la spec con la verificación final de la suite completa. | `74b3204` | HECHO |
| T8 | S16 | T7 | **SECUENCIAL**: toca `useButton`/tests/stories, los mismos archivos de T4–T6. Abierta **después** del PR, al responder el dueño las tres preguntas de §8. | este commit | HECHO |

---

## 5. Checklist de criterios de aceptación

Verificados sobre la rama ya integrada con `develop` (`git merge` = *Already up to date*),
con la suite completa en verde: **193 tests unitarios** (11 suites), **119 e2e** en Chromium y
**6/6 paquetes construidos**.

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| AC1 | ✅ CUMPLIDO | `aa0c03d` · `Button.test.tsx` → `describe("contrato de clases")`, `test.each(VARIANTS)` cubre `outline`/`dash`/`soft`. Además `9a9f3a0` · `contract.test.ts` cruza las tres clases contra `button.css`. |
| AC2 | ✅ CUMPLIDO | `aa0c03d` · `test.each(THEMES)` (10 roles) → `btn-<theme>`. |
| AC3 | ✅ CUMPLIDO | `aa0c03d` · `describe("loading")` → "conserva los children junto al spinner y declara aria-busy": children en el DOM + `[role="status"]` + `aria-busy="true"` + el spinner es `firstElementChild`. |
| AC4 | ✅ CUMPLIDO | `aa0c03d` · `describe("iconos")` → "startIcon y endIcon renderizan en el orden correcto" compara la lista de hijos con `["start", "Texto", "end"]`. |
| AC5 | ✅ CUMPLIDO | `aa0c03d` · `describe("polimorfismo")`: `<a href>` con las clases del contrato, y `@ts-expect-error` sobre `disabled`. `tsc --noEmit -p tsconfig.jest.json` no reporta directivas sin usar, así que el error de tipos existe de verdad. |
| AC6 | ✅ CUMPLIDO | `grep -rn "button.theme\[variant\]" packages/ui` → **sin resultados** (los dos comentarios que citaban el bug se reescribieron en este commit para que el criterio sea literal). |
| AC7 | ✅ CUMPLIDO | `b752486` · story `AllVariants`: cuatro botones por fila (sólido = sin `variant`, `outline`, `dash`, `soft`) en dos roles distintos. La diferencia es real porque el CSS define los tres tratamientos y el hook ya emite su clase. |
| AC8 | ✅ CUMPLIDO | `aa0c03d` · `describe("higiene de props")`: ningún atributo de configuración en el nodo, `data-*` sí pasa, y `console.error` **no** se llama (es lo que delataba la fuga de `loading`). |
| AC9 | ✅ CUMPLIDO | `aa0c03d` · "as=\"a\" renderiza un `<a>` con href y expone el rol link" → `getByRole("link")` + `not.toHaveAttribute("role")`, y el ancla sigue accionable con Enter. |
| AC10 | ✅ CUMPLIDO | `aa0c03d` · `describe("ref")`: ref al `<button>` y al `<a>`. El hook sigue devolviendo `domRef` y `Button.tsx` lo monta. |
| AC11 | ✅ CUMPLIDO | `aa0c03d` · `test.each` del mapa `size → loader-*` (5 casos) + "el spinner hereda el color de contenido del botón". Y `a095548` lo mide **en Chromium**: dentro de un `.btn-primary`, el `border-top-color` del spinner es igual al `color` del botón (`--btn-fg`), no al relleno. |
| AC12 | ✅ CUMPLIDO | T8 · `Button.test.tsx` → "un botón icon-only que carga muestra sólo el spinner" (el nodo del icono no está en el DOM, el botón tiene un único hijo y `aria-busy="true"`) y "al dejar de cargar, el botón icon-only recupera su icono". |

### Comandos de verificación

```bash
pnpm install --frozen-lockfile
pnpm test                          # 193 passed, 11 suites
pnpm build                         # 6/6 paquetes
pnpm --filter @ownui/tw-theme e2e  # 119 passed (3 nuevos de .loader-current)
pnpm lint                          # 4 errores, todos preexistentes en Dropdown.stories.tsx (G-02)
grep -rn "button.theme\[variant\]" packages/ui   # sin resultados
```

---

## 6. Decisiones tomadas

| ID | Contexto | Opciones | Decisión | Razón | Reversibilidad |
| -- | -------- | -------- | -------- | ----- | -------------- |
| D-01 | El prompt llega con `{{N}}` sin sustituir. | (a) Terminar pidiendo el número; (b) inferirlo del estado del repo. | **(b) N = 5.** | El prompt prohíbe preguntar. `develop` ya integra L0–L4 y no hay rama `claude/lote-5`; L5 es el siguiente del backlog. | Trivial. |
| D-02 | `useButton` emitía `opacity-50 cursor-not-allowed` para `disabled`: utilidades de Tailwind, no clases del plugin. | (a) Dejarlas; (b) emitir `.btn-disabled`, que el CSS ya define. | **(b)**, y el contrato expone `state.disabled`. | Esas utilidades sólo existen si el consumidor escanea nuestro bundle con Tailwind, y no lo hace: el estilo de deshabilitado no llegaba. Además `<a>` no acepta `:disabled`, así que la clase es la única vía para un enlace deshabilitado. Rompe la regla "ninguna utilidad de Tailwind en el componente". | Un test cambió de aserción; revertir es una línea. |
| D-03 | El plan separaba hook (T4), loading (T5) e iconos (T6) en tres commits sobre los mismos tres archivos. | (a) Tres commits, con uno intermedio donde el render ignora medio hook; (b) un commit con tipos + hook + render + tests. | **(b)**: T4 absorbe S07–S13. | "Una task = un commit" y cada task debe salir con lint y tests en verde. Partir el contrato del hook del render produce commits que no pasan sus propios criterios. | No aplica (es organización del historial). |
| D-04 | El backlog dejaba abierto si `icon` se elimina o se define como botón icon-only. | (a) Eliminarla (es redundante con `children`); (b) icon-only con `aria-label` obligatorio y `.btn-square`. | **(b)**. | El botón icon-only es un caso real y recurrente (toolbars), y es justo donde se olvida el nombre accesible. Tipar `aria-label` como obligatorio lo convierte en un error de compilación en vez de un hallazgo de auditoría. Coste: `ButtonProps` pasa a ser una unión de 4 miembros (elemento × contenido). | Media: quitar `icon` rompería a quien ya la use. |
| D-05 | Orden del contenido con `loading` + iconos. | (a) El spinner sustituye a `startIcon`; (b) orden fijo `[spinner] [startIcon] [children] [endIcon]`. | **(b)**. | Es predecible y no esconde información: el usuario sigue viendo el icono que identifica la acción. El `gap` de `.btn` ya separa los nodos. | Trivial (una línea de JSX). |
| D-06 | Cómo hace el spinner para contrastar con los 10 roles. | (a) Mapear en React rol de botón → color de loader (10 entradas que se desincronizan con la paleta); (b) `className="loader-current"` desde el Button; (c) entrada `current` en el contrato del Loader + `.loader-current` en el CSS. | **(c)**. | (a) duplica la paleta en JS, que es exactamente lo que el sistema de tokens evita. (b) deja dos clases peleando por `--loader-color` según el orden del archivo. (c) es aditivo, está tipado y se verifica en el navegador. | Alta: es aditivo, los 8 roles no cambian. |
| D-07 | React Aria fuerza `role="button"` en el ancla (gap G-02 del lote 2). | (a) Aceptarlo y documentarlo; (b) no pasar `elementType` (perder el teclado de React Aria); (c) retirar el `role` cuando hay `href`. | **(c)**. | Un `<a href>` que se anuncia como botón miente al lector de pantalla: no dice que navega. Retirar sólo el `role` conserva el resto (foco, teclado, `onPress`). | Trivial. |
| D-08 | Tamaño del spinner dentro del botón. | (a) Un tamaño fijo; (b) mapa explícito `ButtonSize → LoaderSize`. | **(b)**: `xs→2xs, sm→xs, md→sm, lg→md, xl→lg`. | Las dos escalas son independientes (el botón va en múltiplos de `--size-field`, el loader en `rem` propios): un `loader-md` (24 px) no cabe en un `btn-xs` (24 px de alto). Con mapa explícito el desajuste se ve en una tabla y se testea. | Trivial. |
| D-09 | La versión de Playwright del repo busca un build de Chromium que este contenedor no tiene (trae uno preinstalado en otra ruta). | (a) `playwright install` (prohibido en este entorno); (b) tocar `e2e/playwright.config.ts`; (c) config de override fuera del repo. | **(c)**: config en el scratchpad que extiende la del repo y fija `executablePath`. | (b) metería configuración de esta máquina en el repo y rompería CI, que instala su propio Chromium. La suite e2e se ejecutó completa y sin modificar nada versionado. | No aplica (nada versionado cambió). |
| D-10 | Impacto de versión de `@ownui/button`: el lote retira `variant="solid"`/`"ghost"` y retipa `startIcon`/`endIcon`. | (a) `minor` (el proyecto se declara pre-1.0 en `AGENTS.md`); (b) `major` (los paquetes están publicados en 1.x). | **(b) `major`**. | El `package.json` dice `1.0.0` y el workflow publica; con una versión 1.x, retirar valores de una prop es un cambio incompatible. Si el dueño prefiere tratar la línea 1.x como pre-release, el changeset se edita en un minuto. | Trivial (una palabra en `.changeset/lote-5-button-api.md`). **Decisión que conviene confirmar.** |
| D-12 | **Respuesta del dueño a Q-03**: ¿el botón icon-only con `loading` debe ocultar el icono? | (a) Mantener spinner + icono; (b) sólo spinner. | **(b) sólo spinner** (decisión del dueño, 2026-11-21). | En un `.btn-square` el ancho es igual a la altura (`--size`): spinner e icono no caben sin deformar el botón, y el icono no aporta nada que el spinner tape. Es la única excepción a D-05: en un botón con texto el spinner sigue acompañando al contenido. | Trivial: una expresión ternaria en el retorno del hook. |
| D-11 | `@docs/BUILD-BATCHES.md` no lleva marcas de lote cerrado. | (a) Marcar L5 como hecho allí; (b) dejarlo como backlog y reflejar el estado en `AGENTS.md`. | **(b)**, igual que los lotes 0–4. | Un backlog con estado duplicado se desincroniza; `AGENTS.md` §9 ya es el registro de deuda viva. | Trivial. |

---

## 7. Bloqueantes

**Ninguno.** Ninguna task quedó bloqueada y los 11 criterios están cubiertos con evidencia.

---

## 8. Preguntas abiertas, objeciones y gaps

### Preguntas — **las tres respondidas por el dueño el 2026-11-21**

| ID | Pregunta | Respuesta | Efecto |
| -- | -------- | --------- | ------ |
| Q-01 | **¿`@ownui/button` sube a `2.0.0`?** El lote retira `variant="solid"` y `variant="ghost"` (ninguno aplicaba clase: `solid` no existe en el CSS y `ghost` es un rol) y retipa `startIcon`/`endIcon` de `boolean` a `ReactNode`. | **Sí, `major`.** | Ninguno: `.changeset/lote-5-button-api.md` ya lo declaraba `major` (**D-10**, ahora confirmada). |
| Q-02 | **¿`active` es la API correcta para un botón de estado?** Es un booleano que emite `.btn-active`; un toggle accesible querría `aria-pressed`, que es semántica distinta y la decide el consumidor. | **Sí: se queda como modificador visual**, y `aria-pressed` se trata en un futuro `ToggleButton`. | Ninguno en el código. Queda anotado como **G-10** para que el lote de `ToggleButton` no lo reinvente. |
| Q-03 | **¿El botón icon-only con `loading` debería ocultar el icono?** Mostraba spinner + icono dentro de un `.btn-square`, que queda justo de espacio. | **Sólo spinner.** | Implementado en **T8** (**D-12**), con dos tests y la story documentada. |

### Gaps (fuera del alcance de este lote)

| ID | Gap | Dónde |
| -- | --- | ----- |
| G-01 | **El Dropdown sigue filtrando props al DOM**: la suite imprime `React does not recognize the \`defaultOpen\` prop`. Es el mismo defecto que este lote arregló en el Button (§9.8). | L7 |
| G-02 | `pnpm lint` sigue en rojo por **4 errores preexistentes** en `Dropdown.stories.tsx` (`useState` dentro de las funciones `render`, `react-hooks/rules-of-hooks`). Con lint en rojo de base nadie puede usarlo como puerta de calidad. Los archivos de este lote están limpios de errores (quedan warnings de `no-explicit-any` heredados del estilo del hook). | L6 |
| G-03 | **`pnpm --filter @ownui/button typecheck` falla sin un `pnpm build` previo**: los imports `@ownui/loader` y `@ownui/dom-utils` resuelven a `dist/*.d.ts`, que no existe en limpio. Candidato a project references de TS, o a que `turbo` haga que `typecheck` dependa de `^build`. | L8/L9 |
| G-04 | Errores de tipos preexistentes al correr `tsc -p tsconfig.jest.json` sobre todo el repo: `TS2307` por `import ... from "src/types.ts"` en dos funciones de `tw-theme`, `Loader as="span"` (`TS2322`) y un `Ref` mal tipado en el test de `dom-utils`. Ninguno afecta a la suite (ts-jest es `isolatedModules`), pero el typecheck global no es usable como puerta. | L9 |
| G-05 | **El polimorfismo del Loader está roto en los tipos**: `LoaderProps<T>` es genérico, pero `forwardRef<HTMLDivElement, LoaderProps>` fija `"div"`, así que `as="span"` no compila aunque funcione en runtime. Es el patrón polimórfico divergente que el backlog ya quería unificar. | L8 (plantillas) |
| G-06 | `Loader.variants.ts` sigue vacío (el contrato vive en `@ownui/tw-theme/variants`). Borrarlo o usarlo. | L8 |
| G-07 | `@ownui/ui` sigue importando los componentes por ruta relativa sin declarar `@ownui/loader` ni `@ownui/dom-utils` en sus `dependencies` (§9.10). | L9 |
| G-08 | `AGENTS.md` no pasa `prettier --check` (ya era así). Reformatearlo es un commit de formato aparte. | L9 |
| G-10 | **`active` es sólo visual, a propósito** (respuesta a Q-02): no emite `aria-pressed`. Un botón de estado accesible necesita esa semántica, y es decisión del consumidor. Si llega un `ToggleButton`, que parta de aquí en vez de redefinir `active`. | Lote de `ToggleButton` |
| G-09 | El botón no expone todavía `.btn-noise` ni los tokens `--btn-gap`/`--btn-font-weight` como props; el CSS los tiene parametrizados. No hace falta hasta que haya un caso. | — |

---

## 9. Log cronológico

- **2026-11-20 · Fase 0.** `develop` confirmada en `0afe779` (contiene L0–L4). Creada
  `claude/lote-5` desde ella. `pnpm install --frozen-lockfile` OK. Baseline: 54 tests en el
  proyecto `components`, con 3 `test.failing` que los lotes 2 y 4 dejaron apuntando a este lote.
  Spec abierta con 15 slices en 8 tasks (`b16876c`).
- **T1 (`9a9f3a0`).** Contrato del plugin: `variant: {outline, dash, soft}`, fuera `solid` y el
  `ghost` duplicado, y expuestos `shape`/`width`/`state`. Test nuevo que cruza cada clase del
  contrato contra `button.css`: 29 casos. `dropdown` queda fuera del test porque hoy promete
  clases que su CSS no define (lote 6).
- **T2 (`d96611b`).** `.loader-current` + entrada `current` en el contrato del Loader + tipo.
  Aditivo: los 8 roles no cambian.
- **T3 (`a095548`).** Fixture e2e de `.loader-current` con tres casos, incluido el control
  negativo. 119 e2e passed (116 antes). Para ejecutarlos hizo falta una config de Playwright
  fuera del repo (**D-09**).
- **T4 (`aa0c03d`).** La API del Button: tipos, hook y render. Los tres `test.failing` pasan a
  tests normales y la suite de Button crece de 30 a **54 tests**. Reagrupación documentada en
  **D-03**.
- **T5 (`b752486`).** Stories: `AllVariants`, `AllSizes`, `WithIcons`, `IconOnly`, `Modifiers`,
  `Disabled`, `AsLink` y tres de carga. Resuelto el gap G-07 del lote 2 (los ~40 warnings de
  Prettier del archivo).
- **T6 (`82a5cf4`).** `AGENTS.md`: §4.7 (contrato verificado), §9.4 y §9.5 cerradas, §5.6, §4.8,
  §9.10 y §11.3 al día.
- **T7 (este commit).** Verificación final sobre la rama ya al día con `develop`
  (*Already up to date*): **193 tests unitarios**, **119 e2e**, **6/6 builds**, `pnpm lint` con
  los 4 errores preexistentes del Dropdown. Reescritos dos comentarios que contenían la cadena
  literal `button.theme[variant]` para que el criterio AC6 se verifique con el `grep` de la
  ficha. Changeset de `@ownui/button` pasado a `major` (**D-10**).
- **2026-11-21 · T8.** El dueño respondió las tres preguntas de §8: `major` confirmado (Q-01),
  `active` se queda visual (Q-02) y el botón icon-only con `loading` muestra **sólo** el spinner
  (Q-03). Lo único que requería código era Q-03: una ternaria en el retorno del hook, dos tests
  nuevos (56 en la suite de Button, 195 en el repo) y la story `LoadingWithVariants`
  documentada. Q-02 queda registrada como **G-10** para el futuro `ToggleButton`.
