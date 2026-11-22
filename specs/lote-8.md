# Lote 8 — Generador de componentes y plantillas

## 1. Meta

| Campo           | Valor                                                                                 |
| --------------- | ------------------------------------------------------------------------------------- |
| Lote            | **L8** — Generador de componentes y plantillas (`@docs/BUILD-BATCHES.md` §L8)          |
| Rama base       | `develop` (en `368b3fe`, merge del PR #33 / lote 6)                                    |
| Rama de trabajo | `claude/lote-8`                                                                        |
| Estado general  | EN CURSO                                                                               |
| Fecha           | 2026-11-22                                                                             |
| PR              | pendiente                                                                              |

> **Nota sobre el número de lote.** El prompt programado llegó otra vez con el marcador
> `{{N}}` sin sustituir. Se resuelve a **N = 8**. Justificación en **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt (igual que en los lotes 0–7):

- **Slice** = unidad mínima verificable y testeable por sí sola, con criterios de aceptación
  propios.
- **Task** = agrupación de slices cohesivos (mismo módulo, archivos compartidos o criterios
  acoplados). **Una task = un commit.**

Reglas de oro de `@docs/BUILD-BATCHES.md` que condicionan este lote:

- **El contrato manda.** Este lote construye justamente la herramienta que lo verifica
  (`pnpm check:contract`), así que la regla deja de depender de que alguien se acuerde.
- **CSS antes que React.** El generador emite el CSS y el contrato *antes* del paquete de
  React, y registra el `@import` en `css/index.css`: un componente generado no puede nacer sin
  estilos publicados (el bug raíz del lote 1).
- **Tests reales.** La plantilla de test es RTL de verdad, nunca stubs de `console.log`.

### Criterios de aceptación del lote (del backlog)

| ID  | Criterio                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------ |
| AC1 | `pnpm create-component Demo` produce un paquete que compila, pasa lint, tiene un test que pasa y una story que renderiza — sin edición manual |
| AC2 | `pnpm check:contract` detecta los desajustes conocidos de L5 y L6 si se reintroducen (probarlo revirtiendo un cambio en una rama scratch) |
| AC3 | `check:contract` corre en CI y falla el build cuando debe                                                     |

---

## 3. Tabla de SLICES

| ID  | Descripción | Criterios | Archivos afectados | Depende de | Estado |
| --- | ----------- | --------- | ------------------ | ---------- | ------ |
| S01 | Descubrimiento automático de componentes (paquete React ⇄ `variants/<name>.ts` ⇄ `css/<name>.css`) sin registro manual | AC2 | `scripts/check-contract.mjs` | — | HECHO |
| S02 | Extracción de las clases que emiten los hooks: literales y plantillas `` `x-${variant}` `` expandidas con las uniones de `<Name>.types.ts` | AC2 | `scripts/check-contract.mjs` | S01 | HECHO |
| S03 | Regla C1: toda clase emitida existe como selector en el CSS del componente (o en el de un contrato importado, p. ej. el trigger `.btn`) | AC2 | `scripts/check-contract.mjs` | S02 | HECHO |
| S04 | Regla C2: toda clase del contrato existe en el CSS (el desajuste de L5: `variant.solid`) | AC2 | `scripts/check-contract.mjs` | S01 | HECHO |
| S05 | Regla C3: todo valor de unión de tipos tiene entrada en el contrato o clase emitida | AC2 | `scripts/check-contract.mjs` | S02 | HECHO |
| S06 | Regla C4: el CSS de todo componente con contrato está importado en `css/index.css` | AC2 | `scripts/check-contract.mjs` | S01 | HECHO |
| S07 | CLI del checker: `--root`, `--component`, `--json`, `--strict`, `--help` y código de salida 1 | AC2, AC3 | `scripts/check-contract.mjs` | S03–S06 | HECHO |
| S08 | Script raíz `pnpm check:contract` | AC2, AC3 | `package.json` | S07 | HECHO |
| S09 | Tests del checker: verde en el repo real y rojo al reintroducir los desajustes de L5 y L6 sobre un árbol temporal | AC2 | `scripts/__tests__/check-contract.test.ts`, `jest.config.js` | S07 | HECHO |
| S10 | Generador: paquete React completo del patrón A (composición) | AC1 | `scripts/create-component.mjs` | — | HECHO |
| S11 | Generador: CSS esqueleto con la cascada de `AGENTS.md` §4.8 + contrato `variants/<name>.ts` | AC1 | `scripts/create-component.mjs` | S10 | HECHO |
| S12 | Generador: registro automático en `variants/index.ts`, `css/index.css` y `packages/ui/src/index.ts` | AC1 | `scripts/create-component.mjs` | S11 | HECHO |
| S13 | Generador: `--compound` (patrón B, Provider + subcomponentes) | AC1 | `scripts/create-component.mjs` | S10 | HECHO |
| S14 | Generador: plantillas de test RTL real y de stories (`Default`, `AllVariants`, `AllSizes`, `Disabled`) | AC1 | `scripts/create-component.mjs` | S10 | HECHO |
| S15 | CLI del generador: `--prefix`, `--dry-run`, `--force`, `--help` y mensajes de próximos pasos | AC1 | `scripts/create-component.mjs` | S10–S14 | HECHO |
| S16 | Script raíz `pnpm create-component` | AC1 | `package.json` | S15 | HECHO |
| S17 | Tests del generador: genera sobre un árbol temporal y el resultado pasa `check:contract` | AC1 | `scripts/__tests__/create-component.test.ts` | S09, S15 | HECHO |
| S18 | Verificación end-to-end de AC1: generar `Demo` en el repo, typecheck + lint + test + story, y borrarlo | AC1 | — (evidencia en esta spec) | S16 | PENDIENTE |
| S19 | `check:contract` como paso de CI | AC3 | `.github/workflows/ci.yml` | S08 | PENDIENTE |
| S20 | `AGENTS.md`: §7 pasa a apoyarse en el generador y en el checker; §6.1 lista los scripts nuevos | — | `AGENTS.md` | S16, S19 | PENDIENTE |
| S21 | Changeset con el impacto de versión | — | `.changeset/` | S20 | PENDIENTE |

---

## 4. Tabla de TASKS

| ID  | Slices | Predecesora | Modo + justificación | Commit | Estado |
| --- | ------ | ----------- | -------------------- | ------ | ------ |
| T1 | S01–S09 | — | SECUENCIAL. Es la primera. | `e002cc0` | HECHO |
| T2 | S10–S17 | T1 | SECUENCIAL: lo que genera T2 tiene que pasar el checker de T1, y sus tests lo invocan. Archivos compartidos: `package.json` raíz, `scripts/__tests__/`. | (este commit) | HECHO |
| T3 | S18–S21 | T2 | SECUENCIAL: la verificación end-to-end y la documentación describen lo que T1 y T2 dejan en el árbol. | — | PENDIENTE |

Ninguna task es paralelizable en este lote: las tres tocan `package.json` raíz y las dos
primeras comparten el directorio de tests. Registrado como decisión **D-02**.

---

## 5. Checklist de criterios de aceptación

| ID  | Estado | Evidencia |
| --- | ------ | --------- |
| AC1 | PENDIENTE | — |
| AC2 | PENDIENTE | — |
| AC3 | PENDIENTE | — |

---

## 6. Decisiones tomadas

### D-01 — El lote es el 8

| Campo | Valor |
| --- | --- |
| Contexto | El prompt programado llegó con `{{N}}` sin sustituir, así que el número de lote no viene dado. |
| Opciones | (a) Terminar pidiendo el número — prohibido por el prompt. (b) Repetir un lote ya hecho. (c) Deducirlo del estado del repo. |
| Decisión | **(c)**. `origin/develop` tiene mergeados los lotes 0–6 (último merge: PR #33), `specs/` contiene `lote-0.md`…`lote-6.md`, y `origin/claude/lote-7` existe con 3 commits propios y una spec `lote-7.md` esperando revisión humana. El siguiente lote sin empezar es **L8**. |
| Razón | Es el único número que no duplica trabajo ni salta el orden del backlog. L8 abre la FASE 2 y el backlog lo declara paralelizable respecto a L7, así que no depende de que el PR del lote 7 se mergee. |
| Reversibilidad | Alta: la rama y la spec se renombran si el gate humano quería otro número. |

### D-02 — Las tres tasks van en secuencial

| Campo | Valor |
| --- | --- |
| Contexto | El prompt permite ejecutar tasks en paralelo si no comparten archivos ni dependencias. |
| Opciones | (a) Paralelizar T1 y T2 en worktrees. (b) Secuencial. |
| Decisión | **(b)**. |
| Razón | T2 genera código que tiene que pasar el checker de T1 y sus tests lo invocan; y las tres tasks escriben en `package.json` raíz. El coste de integrar dos worktrees supera el ahorro en un lote de tres commits. |
| Reversibilidad | Total: no deja rastro en el código. |

### D-03 — El checker descubre los componentes en vez de leer una lista

| Campo | Valor |
| --- | --- |
| Contexto | `check-contract` tiene que saber qué componentes existen y con qué prefijo de clase (`button` → `btn`). |
| Opciones | (a) Registro escrito a mano en el script. (b) Descubrir cruzando `packages/ui/src/<Name>/` con `variants/<name>.ts` y deducir el prefijo del propio contrato. |
| Decisión | **(b)**. |
| Razón | Con (a), el primer componente de los lotes 10–19 se queda fuera del gate hasta que alguien se acuerde de añadirlo — exactamente el fallo que este lote existe para cerrar. El prefijo se deduce como el token más repetido antes del primer guion en las clases del contrato, que resuelve `btn` sin excepciones escritas. |
| Reversibilidad | Alta: es una función de 10 líneas. |

### D-04 — C1 se verifica contra todo el CSS publicado, y de las stories sólo cuenta `className`

| Campo | Valor |
| --- | --- |
| Contexto | Un componente reutiliza legítimamente el CSS de otro (el trigger del Dropdown es un `.btn` desde el lote 6) y las stories pintan botones alrededor del componente que documentan. Además el bloque de documentación de una story cita clases en prosa, incluidas las que se eliminaron a propósito (`.btn-solid`). |
| Opciones | (a) Exigir que cada clase emitida esté en el CSS de su propio componente. (b) Permitir cualquier clase que exista en el CSS publicado. (c) Excluir las stories del análisis. |
| Decisión | **(b)** para el conjunto permitido, y de las stories se extraen **sólo** los valores de `className`, no el archivo entero. |
| Razón | (a) daba falsos positivos en cuanto un componente reutiliza otro, que es el patrón que el repo quiere. (c) dejaría sin gate las clases que las stories pintan a mano. Lo que la regla persigue es la clase que no existe en ninguna parte — el bug del lote 6 (`dropdown-menu` sin un solo selector). |
| Reversibilidad | Alta: es el conjunto `allowed` del script. |

### D-05 — Los tests de los scripts van en un tercer proyecto de Jest

| Campo | Valor |
| --- | --- |
| Contexto | Los scripts son `.mjs` sin dependencias y hay que probarlos, incluido su código de salida. Los dos proyectos de Jest existentes apuntan a `packages/**`. |
| Opciones | (a) `node --test` con un script `test:scripts` aparte. (b) Tercer proyecto de Jest (`displayName: "scripts"`, entorno node) que invoca los CLIs con `execFileSync`. |
| Decisión | **(b)**. |
| Razón | (a) mete un segundo runner de tests en el repo — el error que ya se cometió con Changesets vs semantic-release. Con (b), `pnpm test` sigue siendo el único comando y CI no cambia. Invocarlos como proceso verifica además el código de salida, que es lo que los hace utilizables como puerta. |
| Reversibilidad | Alta: es un bloque de `jest.config.js`. |

### D-06 — `prettier` pasa a ser devDependency de la raíz

| Campo | Valor |
| --- | --- |
| Contexto | El andamio generaba código con 43 avisos de `prettier/prettier`, porque la indentación de una plantilla no puede depender de lo que mida el nombre del componente. Para formatear al escribir hace falta `prettier` resolvible desde la raíz, y **no lo era**: sólo existía 2.8.8 como transitiva (el script `pnpm format` de la raíz tampoco funcionaba). |
| Dependencia nueva | `prettier@2.8.8` (devDependency de la raíz). |
| Motivo | Dejar el andamio en verde de lint sin tocar a mano cada archivo generado, y arreglar de paso `pnpm format`. |
| Alternativa considerada | Subir a `prettier@3` (lo que pide el peer de `eslint-plugin-prettier@5`). Descartada: cambiaría el formato esperado de **todo** el repo, que hoy se valida con la 2.8.8 que resuelve el plugin. Queda como gap G-03. |
| Reversibilidad | Alta: el script escribe sin formatear si no encuentra Prettier (y lo avisa). |

### D-07 — El compound generado trae teclado parcial y lo dice

| Campo | Valor |
| --- | --- |
| Contexto | Un `role="menu"` sin navegación por teclado miente al lector de pantalla (`AGENTS.md` §9.8). El teclado completo del Dropdown es el lote 7, que está en revisión y no mergeado. |
| Opciones | (a) Generar el menú sin teclado. (b) Copiar aquí la implementación del lote 7. (c) Generar `Esc` + retorno de foco y un aviso en el código apuntando al lote 7 / `@react-aria/menu`. |
| Decisión | **(c)**. |
| Razón | (b) duplicaría trabajo sin mergear y crearía dos implementaciones que divergen. (a) deja un andamio que nace mintiendo. (c) cubre lo que no depende de decisiones del componente y deja el resto marcado donde se va a leer: en el hook generado. |
| Reversibilidad | Total: cuando el lote 7 se mergee, la plantilla se actualiza con su implementación. |

---

## 7. Bloqueantes

Ninguno hasta ahora.

---

## 8. Preguntas abiertas, objeciones y gaps

### Gaps (fuera del alcance del lote, no tocados)

| ID | Gap |
| --- | --- |
| G-01 | `pnpm format` de la raíz apunta a `src/**/*`, una ruta que no existe en el monorepo: el script no formatea nada aunque ahora Prettier sí esté instalado. |
| G-02 | `packages/ui/src/{Button,Loader,Dropdown}/package.json` no pasan `prettier --check` (preexistente). Lo generado sí. |
| G-03 | `eslint-plugin-prettier@5` pide `prettier >=3` y el repo resuelve 2.8.8 (unmet peer preexistente). Subir a 3 es un lote propio: cambia el formato esperado de todo el repo. |
| G-04 | El paso `Lint` de CI sigue con `continue-on-error` (gap G-15 del lote 3). Con el lote 6 mergeado habría que comprobar si ya puede ser puerta. |
| G-05 | `useDOMRef` tal y como lo usan `Button` y `Dropdown` deja `innerRef.current` en `null`: montan en el DOM la ref del `forwardRef`, y `useImperativeHandle` sólo copia en la dirección contraria. Funciona porque React Aria no necesita el nodo, pero nada que dependa del nodo (devolver el foco, medir) puede usarlo. El andamio del lote 8 lo hace bien (monta el `buttonRef` del hook); arreglarlo en los dos componentes existentes es trabajo de otro lote. |
| G-06 | El registro de `@ownui/<name>` en las dependencias de `@ownui/ui` se inserta antes de `@ownui/tw-theme`, así que la lista deja de estar en orden alfabético. Cosmético. |


---

## 9. Log cronológico

| Momento | Evento |
| --- | --- |
| Fase 0 | `git fetch` + inventario de ramas. `develop` existe (`368b3fe`) y tiene los lotes 0–6. Rama `claude/lote-8` creada desde ahí. |
| Fase 0 | Spec inicial con slices, tasks y dependencias. |
| T1 | `scripts/check-contract.mjs` + tercer proyecto de Jest + `pnpm check:contract`. 10 tests; verde sobre el árbol real y rojo al reintroducir los desajustes de los lotes 1, 5 y 6. Commit `e002cc0`. |
| T2 | `scripts/create-component.mjs` (+ `--compound`, `--prefix`, `--dry-run`, `--force`, `--root`) + 13 tests. Verificado generando `Demo` (composición) y `Panel` (compound) en el repo real: `check:contract` en verde, 109 tests de componentes en verde, typecheck sin errores, build con `.d.ts` correcto, lint y `prettier --check` limpios. Los dos componentes de prueba se borraron después. |
