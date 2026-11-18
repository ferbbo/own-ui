# Lote 2 — Arreglar la ejecución de tests

## 1. Meta

| Campo           | Valor                                                                  |
| --------------- | ---------------------------------------------------------------------- |
| Lote            | **L2** — Arreglar la ejecución de tests (`@docs/BUILD-BATCHES.md` §L2) |
| Rama base       | `develop` (en `6aa40a1`)                                               |
| Rama de trabajo | `claude/lote-2`                                                        |
| Estado general  | **COMPLETO** — 5 tasks, 0 bloqueadas, 4/4 criterios cumplidos          |
| Fecha           | 2026-11-18                                                             |

> **Nota sobre el número de lote.** El prompt programado llegó otra vez con el marcador
> `{{N}}` sin sustituir. Se resolvió a **N = 2**: el lote 0 está mergeado en `develop`
> (PR #25) y el lote 1 está entregado y en revisión (PR #26, `claude/lote-1`, 5 commits
> ahead de `develop`). El siguiente lote pendiente del backlog es L2. Registrado como
> decisión **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt:

- **Slice** = unidad mínima verificable y testeable por sí sola, con criterios de
  aceptación propios.
- **Task** = agrupación de slices cohesivos: mismo módulo, archivos compartidos o
  criterios acoplados. **Una task = un commit.**

Se respetan las reglas de `AGENTS.md` §8 y las reglas de oro de `@docs/BUILD-BATCHES.md`,
en particular la regla **"tests reales o nada"**: `Button.test.tsx` (el antipatrón del
repo, que redefine `describe`/`test`/`expect`/`render` con `console.log`) se reescribe
completo con React Testing Library, no se parchea.

---

## 3. Tabla de SLICES

| ID  | Descripción                                                                         | Criterios (IDs) | Archivos afectados                                     | Depende de | Estado   |
| --- | ----------------------------------------------------------------------------------- | --------------- | ------------------------------------------------------ | ---------- | -------- |
| S01 | `testMatch` del proyecto `components` apunta a `packages/ui/**` (ruta real)          | AC1             | `jest.config.js`                                       | —          | HECHO |
| S02 | `collectCoverageFrom` apunta a `packages/ui/**` y `packages/utils/**`                | AC3             | `jest.config.js`                                       | S01        | HECHO |
| S03 | Resolución de los paquetes `@ownui/*` a su fuente (runtime y tipos) sin build previo | AC1             | `jest.config.js`, `tsconfig.jest.json`                 | S01        | HECHO |
| S04 | `collectCoverage` deja de ser global: sólo en `pnpm test:coverage`                   | AC4             | `jest.config.js`                                       | S01        | HECHO |
| S05 | `Button.test.tsx` reescrito con RTL real (render, theme, size, disabled, click)      | AC1, AC2, AC3   | `packages/ui/src/Button/__test__/Button.test.tsx`       | S01, S03   | HECHO |
| S06 | Tests de Button para polimorfismo `as="a"`, forwarding de ref y `loading`            | AC2, AC3        | `packages/ui/src/Button/__test__/Button.test.tsx`       | S05        | HECHO |
| S07 | Suite de Dropdown ejecutándose en verde (expectativas corregidas o hallazgo abierto) | AC1             | `packages/ui/src/Dropdown/__test__/Dropdown.test.tsx`   | S01, S03   | HECHO |
| S08 | Suite de Loader ejecutándose en verde                                               | AC1             | — (verificación)                                       | S01, S03   | HECHO |
| S09 | Tests de `useDOMRef` (`@ownui/dom-utils`): nodo expuesto, ref callback y `null`      | AC1             | `packages/utils/dom-utils/__test__/dom.test.tsx`        | S01, S03   | HECHO |
| S10 | Spec cerrada, changeset y actualización de `AGENTS.md` §6.3/§9.2                     | —               | `specs/lote-2.md`, `AGENTS.md`, `.changeset/*`         | S05–S09    | HECHO |

---

## 4. Tabla de TASKS

| ID  | Slices   | Predecesora(s) | Modo + justificación | Commit | Estado |
| --- | -------- | -------------- | -------------------- | ------ | ------ |
| T1  | S01–S04  | —              | SECUENCIAL — habilitador de todo el lote: sin `testMatch` corregido no hay ninguna suite que ejecutar | `a43c6b7` | HECHO |
| T2  | S05, S06 | T1             | SECUENCIAL — necesita la config de T1 para ejecutar lo que escribe | `bdcf147` | HECHO |
| T3  | S07, S08 | T1             | SECUENCIAL por elección — archivos disjuntos de T2 (`Dropdown.test.tsx` vs `Button.test.tsx`), luego paralelizable; en serie porque orquestar worktrees/subagentes cuesta más que el beneficio en dos archivos de test | `dd99369` | HECHO |
| T4  | S09      | T1             | SECUENCIAL por elección — igual que T3: archivos disjuntos (`packages/utils/**`), paralelizable en teoría, serie por coste | `939f1b4` | HECHO |
| T5  | S10      | T2, T3, T4     | SECUENCIAL — consolida la evidencia de las tasks anteriores en spec, changeset y `AGENTS.md` | ver §9 | HECHO |

---

## 5. Checklist de criterios de aceptación

| ID  | Criterio (de `@docs/BUILD-BATCHES.md` §L2)                                  | Estado      | Evidencia |
| --- | --------------------------------------------------------------------------- | ----------- | --------- |
| AC1 | `pnpm test:components` ejecuta **>0 suites** y las tres pasan               | ✅ CUMPLIDO | `a43c6b7`+`bdcf147`+`dd99369`+`939f1b4`. `pnpm test:components` → **4 suites / 54 tests**, todas en verde (las 3 del enunciado — Button, Dropdown, Loader — más la nueva de `useDOMRef`). Antes: 0 suites. |
| AC2 | `grep -rn "const describe\|const expect\|const render" packages/ui` → vacío | ✅ CUMPLIDO | `bdcf147`. Salida vacía (ver §10). El stub de `Button.test.tsx` se reescribió completo con RTL. |
| AC3 | Cobertura de `packages/ui/src/**` reportada (no 0%); Button ≥90% líneas     | ✅ CUMPLIDO | `pnpm test:coverage`: proyecto `components` **98.43 % de líneas**; `Button.tsx` 100 %, `useButton.tsx` 100 % de líneas (90.32 % de ramas). |
| AC4 | `pnpm test` verde en limpio                                                 | ✅ CUMPLIDO | **8 suites / 89 tests** en verde (4 de componentes + 4 del plugin), sin cobertura activada. |

### Verificación adicional (no pedida por la ficha)

| Comprobación | Resultado |
| --- | --- |
| Las suites corren sin `pnpm build` previo (no hay `dist/` en el repo) | ✅ — por el mapeo a `src/` (D-03) |
| `npx eslint` sobre los archivos tocados | ✅ sin errores ni warnings (los warnings de `Button.stories.tsx` son preexistentes) |
| `npx prettier --check` sobre los archivos tocados | ✅ |
| Marcadores de defecto de otros lotes | 4 `test.failing` (3 de L5, 1 de L7) — pasan mientras el bug exista y avisarán al arreglarse |

---

## 6. Decisiones tomadas

### D-01 — Resolución de `{{N}}` a lote 2

- **Contexto.** El scheduler entregó el prompt con `{{N}}` literal, sin sustituir.
- **Opciones.** (a) Terminar pidiendo el número — prohibido por el prompt ("sin hacerme
  ninguna pregunta"). (b) Repetir el último lote. (c) Deducir el siguiente pendiente del
  estado real del repo.
- **Decisión.** (c): L2. `specs/lote-0.md` está en `develop` y su PR #25 está mergeada;
  `claude/lote-1` existe con PR #26 abierta. L2 es el siguiente del backlog y además
  `@docs/BUILD-BATCHES.md` lo marca bloqueante de Fase 0.
- **Razón.** Es la única lectura que avanza el plan sin rehacer trabajo ya entregado.
- **Reversibilidad.** Total: el trabajo vive en su propia rama y PR.

### D-02 — L2 parte de `develop`, no de `claude/lote-1`

- **Contexto.** El lote 1 no está mergeado (PR #26 en revisión). Sus cambios tocan
  `packages/tw-theme` (CSS publicado), no la ejecución de tests.
- **Opciones.** (a) Ramificar de `claude/lote-1` para evitar conflictos futuros.
  (b) Ramificar de `develop` como manda el prompt.
- **Decisión.** (b). Los archivos de L2 (`jest.config.js`, tests de `packages/ui`,
  `packages/utils`) son disjuntos de los de L1 (`packages/tw-theme/**`, `README.md`),
  así que el merge posterior no debería conflictuar.
- **Razón.** El modelo de ramas del prompt es explícito: trabajo desde la última `develop`.
- **Reversibilidad.** Total.

### D-03 — Los paquetes `@ownui/*` se resuelven a `src/`, no a `dist/`

- **Contexto.** `useButton.tsx` importa `@ownui/tw-theme/variants` y `@ownui/dom-utils`;
  `Button.tsx` importa `@ownui/loader`. Los `exports` de esos paquetes apuntan a `dist/`,
  que **no existe** hasta construir (y `pnpm build` sólo construye el plugin — eso es L3).
  Sin mapeo, las suites fallan con `Cannot find module`.
- **Opciones.** (a) Exigir `pnpm build` antes de los tests: acopla los tests unitarios al
  build roto que arregla L3 y atribuye la cobertura al bundle. (b) Mapear a `src/` con
  `moduleNameMapper` (runtime) + `paths` de TypeScript (tipos).
- **Decisión.** (b), en `jest.config.js` y en un `tsconfig.jest.json` nuevo.
- **Razón.** Los tests unitarios deben correr en un clon limpio sin build previo, y la
  cobertura debe medirse sobre el fuente. Es también lo que hace Storybook vía Vite.
- **Reversibilidad.** Alta: son dos bloques de configuración contiguos y comentados como
  pareja ("deben moverse juntos").

### D-04 — El rojo intermedio de T1 es el resultado esperado, no una regresión

- **Contexto.** Al corregir `testMatch`, las tres suites se ejecutan por primera vez: una
  falla por ser falsa (`Button.test.tsx`) y dos tests de Dropdown fallan por expectativas
  equivocadas. Son fallos **preexistentes que la config ocultaba**.
- **Opciones.** (a) Meter todo en un único commit gigante para que ningún commit quede en
  rojo. (b) Commitear T1 (config) con el rojo visible y arreglarlo en T2–T4.
- **Decisión.** (b).
- **Razón.** El valor de L2 es precisamente dejar de tener falsa señal verde; un commit
  que muestra el rojo real documenta el bug mejor que un commit monolítico, y `main` nunca
  ve estados intermedios (el gate es la PR).
- **Reversibilidad.** Total.

### D-05 — Se añade `@testing-library/user-event` como devDependency

- **Contexto.** La ficha de L2 pide probar el click "con `userEvent`". El repo sólo tenía
  `@testing-library/react` y `jest-dom`.
- **Opciones.** (a) `fireEvent.click`: ya funciona con `usePress` de React Aria en jsdom (lo
  demuestra la suite de Dropdown), cero dependencias nuevas. (b) `@testing-library/user-event`:
  simula la secuencia real de eventos de puntero y teclado, y respeta `pointer-events: none`
  y el estado deshabilitado.
- **Decisión.** (b), `@testing-library/user-event@^14.6.12` como devDependency de la raíz.
- **Razón.** Es lo que pide la ficha, es dev-only (no entra en ningún bundle publicado) y es el
  único camino honesto para probar "no dispara onClick cuando está deshabilitado" y el accionado
  por teclado. **Alternativa descartada:** `fireEvent`, que prueba el handler, no la interacción.
- **Reversibilidad.** Alta: afecta a un único archivo de test.

### D-06 — El ref roto de `Button` se arregla dentro de L2

- **Contexto.** La ficha de L2 incluye explícitamente "forwarding de ref" entre los tests a
  escribir. Al escribirlo se descubre que `ref.current` es siempre `null`: `Button.tsx` montaba
  en el DOM el ref del consumidor mientras `useDOMRef` reflejaba en ese mismo ref un `innerRef`
  que nunca se asociaba a nada. React Aria tampoco veía el nodo.
- **Opciones.** (a) Dejarlo como `test.failing` y empujarlo al lote 5. (b) Arreglarlo aquí.
- **Decisión.** (b): `useButton` devuelve `domRef` y `Button` monta ese ref.
- **Razón.** La regla dura permite tocar un componente "cuando un test lo exija, registrándolo",
  y éste es justo el caso: el criterio de aceptación pide que el forwarding de ref se pruebe, y
  un criterio que sólo se puede cumplir con un marcador de fallo no es un criterio cumplido. El
  arreglo son 4 líneas y no cambia la API pública.
- **Reversibilidad.** Alta. Riesgo asumido: L5 reescribirá `useButton` y tendrá que conservar
  `domRef` (anotado en los gaps).

### D-07 — `ci.yml` no se toca

- **Contexto.** La ficha de L2 propone añadir un paso `pnpm test` incondicional en `ci.yml`,
  porque hoy el paso por paquete es `pnpm test:$pkg || echo "No tests for $pkg"` y se traga el
  fallo. Pero las reglas duras del encargo prohíben tocar CI.
- **Opciones.** (a) Cumplir la ficha y modificar el workflow. (b) Respetar la regla dura, dejar
  constancia y no tocarlo.
- **Decisión.** (b). Ninguno de los 4 criterios de aceptación de L2 depende de `ci.yml`.
- **Razón.** La prohibición es explícita y la pérdida es acotada y documentada (G-04); el arreglo
  es de dos líneas y se puede hacer en cuanto haya autorización.
- **Reversibilidad.** Total — no se cambió nada.

### D-08 — Los defectos de otros lotes se marcan con `test.failing`

- **Contexto.** Al correr por primera vez las suites afloran defectos ya inventariados que
  pertenecen a otros lotes: `variant` (§9.4 → L5), `loading` (§9.5 → L5), fuga de props del
  Dropdown (§9.8 → L7).
- **Opciones.** (a) No escribir nada sobre ellos: la suite queda verde pero muda. (b) Escribir
  tests que asserten el comportamiento roto actual: cementa el bug. (c) `test.failing`.
- **Decisión.** (c), con comentario que nombra el lote responsable.
- **Razón.** La suite queda verde sin mentir, el defecto queda escrito como test ejecutable, y
  en cuanto el lote responsable lo arregle el marcador falla y obliga a convertirlo en `test`.
- **Reversibilidad.** Total.

---

## 7. Bloqueantes

_Ninguno por ahora._ Acceso de escritura al repo verificado al inicio con un `push` de la
rama vacía (el lote 0 se quedó sin publicar por un 403 del proxy: ver `specs/lote-0.md`
B-03; esta sesión sí tiene permiso).

---

## 8. Preguntas abiertas, objeciones y gaps

### Preguntas abiertas (requieren decisión del dueño)

| ID | Pregunta |
| --- | --- |
| Q-01 | **¿Autorizas tocar `ci.yml`?** El pipeline sigue tragándose los fallos de test (`\|\| echo "No tests for $pkg"`). Mientras siga así, la señal verde de CI no garantiza que los tests pasen — justo el problema que L2 vino a resolver, pero del lado del pipeline. El arreglo son dos líneas. |
| Q-02 | **¿Un `Button` con `as="a"` debe anunciarse como enlace o como botón?** Hoy React Aria fuerza `role="button"` sobre el ancla, que pierde la semántica de enlace (abrir en pestaña nueva, lista de enlaces del lector de pantalla). El arreglo canónico es `useLink` para el caso `as="a"`. Afecta al lote 5. |
| Q-03 | **¿Umbral de cobertura con `--coverageThreshold`?** Hoy la cobertura se mide pero nada impide que baje. Con 98 % de líneas en componentes, poner el umbral en 90 % sería gratis. Fuera del alcance de L2. |

### Objeciones a la ficha del lote

1. **"las tres pasan" (AC1) se queda corto**: con la suite nueva de `useDOMRef` son cuatro
   suites. Se interpretó como "las tres del enunciado más lo que se añada", no como un máximo.
2. **La ficha pide corregir los tests que fallen "si la expectativa está mal"** sin decir qué
   hacer cuando el fallo revela un bug de otro lote. Resuelto con D-08 (`test.failing`).

### Gaps (fuera de alcance, para el backlog)

| ID | Hallazgo | Lote sugerido |
| --- | --- | --- |
| G-01 | El **trigger del Dropdown no hereda ningún estilo semántico**: `useDropdownTrigger` emite sólo `dropdown-trigger`, y variante/tamaño van al contenedor y al menú. Un trigger sin color ni tamaño no es usable como botón. El test original esperaba `btn-primary`/`btn-lg` ahí, señal de que la intención era otra. **Hay que decidir si el trigger reutiliza el contrato de `button` o tiene el suyo.** | L6 |
| G-02 | Con `as="a"`, React Aria fuerza `role="button"`: el ancla tiene `href` pero no expone el rol `link` (ver Q-02). | L5 |
| G-03 | `useButton` **no saca `loading` de `restProps`**, así que llega al DOM: `Received \`true\` for a non-boolean attribute \`loading\``. Es una fuga de props del mismo tipo que la del Dropdown (§9.8), en el botón. | L5 |
| G-04 | `ci.yml` sigue tragándose los fallos de test (ver Q-01) y no hay un paso `pnpm test` incondicional. | L3 o cuando se autorice tocar CI |
| G-05 | **El lote 5 debe conservar `domRef`** en el retorno de `useButton` al reescribir el hook, o el forwarding de ref volverá a romperse (ahora hay test que lo cubre). | L5 |
| G-06 | `@ownui/dom-utils` sigue con `license: ISC` mientras el resto del monorepo es MIT, y sin `tsconfig` propio de test (usa el `tsconfig.jest.json` de la raíz). | L3 |
| G-07 | `Button.stories.tsx` tiene ~40 warnings de Prettier preexistentes (`pnpm lint` los reporta como warning, no error). No se tocó para no mezclar ruido de formato con el diff de tests. | L5 |
| G-08 | `AGENTS.md` no pasa `prettier --check` (ya era así antes de este lote). Reformatearlo generaría un diff de miles de líneas; conviene hacerlo en un commit de formato aparte. | L9 |

---

## 9. Log cronológico

- **T+0** — Estado del repo leído: `develop` en `6aa40a1` (L0 mergeado, PR #25),
  `claude/lote-1` con PR #26 abierta. `{{N}}` resuelto a 2 (D-01).
- **T+1** — Rama `claude/lote-2` creada desde `origin/develop` y empujada para verificar
  acceso de escritura: OK (el lote 0 se había quedado sin publicar por un 403).
- **T+2** — **T1** (`a43c6b7`): `jest.config.js` reescrito (testMatch, coverage,
  mapeo del workspace) y `tsconfig.jest.json` nuevo. Primera ejecución real:
  **17 tests en 3 suites** (antes: 0). Loader verde; Dropdown con 2 fallos de
  expectativa; Button falla por ser un test falso.
- **T+3** — **T2** (`bdcf147`): `Button.test.tsx` reescrito (30 tests). La suite destapa
  dos defectos: el ref del consumidor siempre en `null` (arreglado aquí, D-06) y el
  `role="button"` que React Aria pone en el ancla (gap G-02). Cobertura de Button: 100 %
  de líneas. `variant` y `loading` quedan marcados con `test.failing` (D-08).
- **T+4** — **T3** (`dd99369`): las dos expectativas de Dropdown corregidas contra el
  contrato real (`dropdown-*` en el contenedor, no `btn-*` en el trigger) + marcador de la
  fuga de props. Loader pasa sin tocar nada. 3 suites / 48 tests verdes.
- **T+5** — **T4** (`939f1b4`): 6 tests de `useDOMRef`. 4 suites / 54 tests verdes.
- **T+6** — **T5**: `AGENTS.md` §5.6/§6.1/§6.3/§9.2/§9.10 al día, changeset de
  `@ownui/button` (patch) y cierre de esta spec.
- **T+7** — Fase final: `develop` traído a la rama, suite completa (**8 suites / 89
  tests**), lint y build verificados, push y PR hacia `develop`.

---

## 10. Anexo: salida de las verificaciones

### AC1 — `pnpm test:components`

```
Test Suites: 4 passed, 4 total
Tests:       54 passed, 54 total
```

### AC2 — stubs falsos en `packages/ui`

```
$ grep -rn "const describe\|const expect\|const render" packages/ui
(sin resultados)
```

### AC3 — cobertura del proyecto `components`

```
File                   | % Stmts | % Branch | % Funcs | % Lines
-----------------------|---------|----------|---------|---------
All files              |      98 |    83.51 |   94.59 |   98.43
 ui/src/Button/src     |     100 |    90.32 |     100 |     100
  Button.tsx           |     100 |      100 |     100 |     100
  useButton.tsx        |     100 |    89.65 |     100 |     100
```

### AC4 — `pnpm test`

```
Test Suites: 8 passed, 8 total
Tests:       89 passed, 89 total
Ran all test suites in 2 projects.
```

---

## 11. Impacto de versión

| Paquete | Impacto | Motivo |
| --- | --- | --- |
| `@ownui/button` | **patch** | Arreglo del forwarding de ref (changeset `lote-2-tests.md`). Sin cambios de API. |
| resto de paquetes | **ninguno** | Sólo configuración de tests, tests nuevos y documentación. |
