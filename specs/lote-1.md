# Lote 1 — Publicar el CSS de componentes

## 1. Meta

| Campo           | Valor                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Lote            | **L1 — Publicar el CSS de componentes** (`@docs/BUILD-BATCHES.md`, Fase 0) |
| Severidad       | 🔴 Bug raíz (`AGENTS.md` §9.1)                                             |
| Rama base       | `develop` @ `6aa40a1` (merge de la PR #25, lote 0)                         |
| Rama de trabajo | `claude/lote-1`                                                            |
| Estado general  | **CERRADO** — listo para revisión                                          |
| Fecha           | 2026-11-18                                                                 |
| Gate            | revisión humana de la PR `claude/lote-1` → `develop`                       |

**Objetivo.** `packages/tw-theme/src/css/*.css` no se importa en ningún sitio del repo
(`grep`: 0 referencias, re-verificado hoy). El plugin sólo inyecta tokens (`addBase`) y
utilidades de color (`addUtilities`). Quien instale `@ownui/ui` + `@ownui/tw-theme` recibe
`class="btn btn-primary btn-md"` **sin una sola regla que las defina**. Este lote hace que el
CSS de componentes **se publique y resuelva** desde el paquete, y lo demuestra con un fixture
e2e que mide estilos computados en Chromium.

**Decisión de diseño heredada del lote 0 (D-05).** El mecanismo es la **opción (B)** de la
ficha: CSS plano publicado + subpath exports, con el snippet corregido
(`"./css/*": "./dist/css/*"`, no `"./css": "./dist/css"`, que Node no resuelve por apuntar a
un directorio).

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación propios, así que se aplican los del prompt:

- **Slice** = unidad mínima verificable por sí sola, con criterios de aceptación propios.
- **Task** = agrupación de slices cohesivos (mismo archivo o criterios acoplados). Una task =
  un commit.
- Regla de oro aplicable de `@docs/BUILD-BATCHES.md`: **"CSS antes que React"** y
  **"cambio en el plugin ⇒ fixture e2e"**. El fixture no es opcional: es la única evidencia
  admisible de que el CSS llega al consumidor.

---

## 3. Tabla de SLICES

| ID   | Descripción                                                                          | AC         | Archivos                                               | Depende de | Estado |
| ---- | ------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------ | ---------- | ------ |
| S-01 | `css/index.css` agregador que importa los CSS de componente                          | AC-4       | `packages/tw-theme/src/css/index.css`                  | —          | HECHO  |
| S-02 | Resolver `menu.css` (0 líneas): escribirlo o eliminarlo. No dejarlo vacío            | AC-4       | `packages/tw-theme/src/css/menu.css`                   | —          | HECHO  |
| S-03 | `package.json`: subpath exports `./css` y `./css/*`                                  | AC-4, AC-5 | `packages/tw-theme/package.json`                       | S-01       | HECHO  |
| S-04 | El build copia `src/css` → `dist/css`                                                | AC-4       | `packages/tw-theme/tsup.config.ts`                     | S-01       | HECHO  |
| S-05 | `npm pack --dry-run` incluye el CSS en el tarball                                    | AC-5       | —                                                      | S-04       | HECHO  |
| S-06 | Fixture e2e `component-styles/` que consume el export público del CSS                | AC-1       | `packages/tw-theme/e2e/fixtures/component-styles/*`    | S-03, S-04 | HECHO  |
| S-07 | Spec: `background-color` = `--color-primary`, `height` ≈ 2.5rem, `border-radius` ≠ 0 | AC-2       | `packages/tw-theme/e2e/tests/component-styles.spec.ts` | S-06       | HECHO  |
| S-08 | Caso `data-theme="dark"`: el `background-color` computado cambia                     | AC-3       | idem                                                   | S-07       | HECHO  |
| S-09 | Verificar el pipeline de `@apply` de `loader.css` sobre CSS compilado (no asumirlo)  | AC-2       | idem                                                   | S-06       | HECHO  |
| S-10 | Instalación real y verificada en `README.md` y `packages/tw-theme/README.md`         | AC-6       | `README.md`, `packages/tw-theme/README.md`             | S-05, S-07 | HECHO  |
| S-11 | Changeset del paquete publicable                                                     | release    | `.changeset/lote-1-css-publicado.md`                   | S-03       | HECHO  |
| S-12 | Cerrar la pregunta abierta **P-01** del lote 0 con evidencia e2e                     | P-01       | `specs/lote-1.md` (D-20)                               | —          | HECHO  |
| S-13 | **(no previsto)** Alinear el peer de Tailwind para que un consumidor pueda instalar  | AC-6       | `packages/tw-theme/package.json`                       | S-05       | HECHO  |

S-13 aparece durante la ejecución: no estaba en la ficha del lote (es un punto del alcance de
L3), pero AC-6 es inverificable sin él. Ver D-16.

## 4. Tabla de TASKS

| ID  | Slices           | Predecesora | Modo + justificación                                                                                                                                        | Commit    | Estado |
| --- | ---------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ------ |
| T1  | S-01, S-02       | —           | **SECUENCIAL** (primera). Crea el artefacto (`index.css`) al que todo lo demás apunta.                                                                      | `fa37a83` | HECHO  |
| T2  | S-03, S-04, S-05 | T1          | **SECUENCIAL**. Los exports apuntan a `dist/css/index.css`: sin T1 resolverían a un archivo inexistente.                                                    | `944e99d` | HECHO  |
| T3  | S-06..S-09       | T2          | **SECUENCIAL**. El fixture importa `@ownui/tw-theme/css`, el export que crea T2. Verificar antes daría un falso negativo.                                   | `9138e52` | HECHO  |
| T4  | S-10..S-13       | T3          | **SECUENCIAL**. AC-6 exige pasos de instalación **ejecutados**: documentar antes de T3 sería documentar lo no probado (el error que §9.9 reprocha al repo). | `986b36b` | HECHO  |

**Ninguna task se ejecutó en paralelo.** Las cuatro forman una cadena estricta
artefacto → publicación → verificación → documentación, y tres tocan
`packages/tw-theme/package.json` o dependen de su resultado. El prompt obliga a SECUENCIAL
ante dependencia o duda; aquí la dependencia es directa y no había nada que ganar.

## 5. Checklist de criterios de aceptación

| ID   | Criterio                                                                                                                          | Estado       | Evidencia                                                                                                                                                                                                                                                                     |
| ---- | --------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-1 | Fixture e2e `component-styles/` con un `<button class="btn btn-primary btn-md">`                                                  | **CUMPLIDO** | `9138e52` · `e2e/fixtures/component-styles/index.html` (`#btn-primary`). El `input.css` importa `@ownui/tw-theme/css`, el export público, no una ruta a `src/`.                                                                                                               |
| AC-2 | El spec verifica en Chromium: `background-color` = `--color-primary` (no `transparent`), `height` ≈ 2.5rem, `border-radius` ≠ 0px | **CUMPLIDO** | `9138e52` · `component-styles.spec.ts`: `rgb(59, 130, 246)`, `height: 40px`, `border-radius: 6px`. Más control negativo y cruce contra el token `--color-primary`.                                                                                                            |
| AC-3 | Un segundo caso con `data-theme="dark"` cambia el `background-color` computado                                                    | **CUMPLIDO** | `9138e52` · dos tests: ámbito local (`#dark-scope`) → `rgb(96, 165, 250)`, y `data-theme` en la raíz en runtime (con `expect.poll`, ver G-06).                                                                                                                                |
| AC-4 | `pnpm --filter @ownui/tw-theme build && ls dist/css/` lista los `.css`                                                            | **CUMPLIDO** | `944e99d` · salida: `button.css` (9964 B), `dropdown.css` (5652 B), `index.css` (1307 B), `loader.css` (2053 B).                                                                                                                                                              |
| AC-5 | `npm pack --dry-run` en `packages/tw-theme` incluye el CSS                                                                        | **CUMPLIDO** | `944e99d` · `dist/css/{button,dropdown,index,loader}.css` en el tarball; 23.8 kB, 25 archivos.                                                                                                                                                                                |
| AC-6 | El README muestra los pasos de instalación **ejecutados y verificados**, no inventados                                            | **CUMPLIDO** | `986b36b` · los pasos se ejecutaron: `npm pack` → instalación del tarball en un proyecto limpio **fuera del monorepo**, con **npm** (no pnpm) y Tailwind 4.1.11 → `npx @tailwindcss/cli` compila y la salida contiene `.btn { display: inline-flex; … }`. Requirió S-13/D-16. |

### Por qué el fixture no bastaba para AC-6

Dentro de `packages/tw-theme/e2e/fixtures/*`, `@import "@ownui/tw-theme/css"` resuelve por
**self-reference** de Node (el `package.json` del propio paquete está en la cadena de
directorios y tiene `exports`). Eso prueba el mapa de exports, pero **no** que un consumidor
real pueda instalar y resolver. Por eso AC-6 se verificó con el tarball en un proyecto limpio,
y fue ahí donde apareció el fallo de peer dependency de D-16 — invisible desde el monorepo.

## 6. Decisiones tomadas

### D-13 — `menu.css` se elimina, no se escribe

- **Contexto:** la ficha admite las dos salidas; el archivo tiene 0 líneas.
- **Opciones:** (a) escribir un `.menu` nuevo; (b) eliminarlo del repo y del agregador.
- **Decisión:** **(b)**.
- **Razón:** no existe componente `Menu` en `packages/ui/src/` (sólo Button, Dropdown, Loader)
  ni `variants/menu.ts`, así que no hay contrato que cumplir: escribir CSS para un componente
  inexistente es inventar API, y publicar el archivo vacío anuncia una capacidad que no existe.
  Las clases `.dropdown-menu*` que el Dropdown ya emite son alcance del lote 6, que es quien
  tiene el contrato delante.
- **Reversibilidad:** total (el archivo estaba vacío: no se pierde nada).

### D-14 — La copia a `dist/css` se hace con `node:fs` desde tsup, no con `cp -R`

- **Contexto:** `tw-theme/v1` prototipó `"build": "… && cp -R ./src/css dist/"`.
- **Opciones:** (a) `cp -R` en el script; (b) hook `onSuccess` de tsup con `node:fs`;
  (c) añadir `copyfiles`/`cpy-cli`.
- **Decisión:** **(b)**.
- **Razón:** (a) depende de un shell POSIX y rompe el build en Windows, donde el repo declara
  soportar sólo `node >=20` (nada de plataforma). (c) añade una dependencia para 4 líneas.
  (b) no añade dependencias, es cross-platform y falla ruidosamente si `src/css` desaparece
  (lanza en vez de publicar un `dist` mudo, que es exactamente el modo de fallo de §9.1).
- **Reversibilidad:** total.

### D-15 — `exports["./css"]` apunta al archivo, no al directorio

- **Contexto:** `tw-theme/v1` dejó `"./css": "./dist/css"`. La ficha del lote ya avisaba.
- **Decisión:** `"./css": "./dist/css/index.css"` + `"./css/*": "./dist/css/*"`.
- **Razón:** un export a un directorio no lo resuelve Node. Verificado con
  `createRequire().resolve()` sobre las tres rutas (`./css`, `./css/button.css`,
  `./css/loader.css`) y después contra el tarball instalado.
- **Reversibilidad:** total.

### D-16 — El rango de peer de Tailwind se arregla en este lote, aunque sea alcance de L3

- **Contexto:** AC-6 pide pasos de instalación verificados. Al instalar el tarball en un
  proyecto limpio con Tailwind 4.1.11, **npm falla**:
  `peer tailwindcss@">= 3.4.17 <4.1.1" from @ownui/tw-theme@1.0.0` → `ERESOLVE`.
- **Opciones:** (a) documentar `--legacy-peer-deps` como paso de instalación; (b) declarar AC-6
  NO CUMPLIDO y esperar a L3; (c) corregir el rango aquí a `">=4.1.0 <5"`.
- **Decisión:** **(c)**.
- **Razón:** (a) documentaría como normal un workaround para un defecto propio del paquete —
  justo lo que este lote intenta dejar de hacer. (b) dejaría el bug raíz "resuelto" en un
  paquete que no se puede instalar, es decir no resuelto. (c) es una línea, es el valor que el
  propio plan recomienda en L3, y **no quita ninguna configuración que funcionase**: el plugin
  usa la API de v4 (`@plugin`, `addBase` de v4), así que el tramo 3.4.x del rango anterior
  nunca fue real. L3 pierde este punto de su alcance (registrado aquí para que no se
  reimplemente).
- **Reversibilidad:** total (una línea de `package.json`).

### D-17 — `pnpm-lock.yaml` no se toca

- **Contexto:** tras cambiar `peerDependencies` se ejecutó `pnpm install --lockfile-only` por
  precaución. El diff resultante eran 9 inserciones y 38 borrados **ajenos al cambio**: eliminaba
  el _importer_ `packages/tw-theme/e2e/fixtures/react-components` (un directorio que **no existe**
  en `develop`, ver G-08) y añadía avisos `deprecated:` de metadatos del registro.
- **Opciones:** (a) commitear ese lockfile; (b) revertirlo y comprobar que el lockfile actual
  sigue siendo válido.
- **Decisión:** **(b)**. `pnpm install --frozen-lockfile` pasa en verde con el `package.json`
  modificado, luego el lockfile no necesitaba cambios: el peer de un paquete del workspace no
  se registra en los _importers_.
- **Razón:** meter 47 líneas de churn no relacionado en la PR de un lote que va de publicar CSS
  degrada la revisión y mezcla una limpieza (G-08) con un arreglo. Y romper el lockfile rompe
  `--frozen-lockfile` en CI.
- **Reversibilidad:** total.

### D-18 — No se reformatea con Prettier lo que ya estaba mal formateado

- **Contexto:** `dropdown.css`, `loader.css`, `README.md` y `packages/tw-theme/README.md`
  fallan `prettier --check` **antes** de este lote (los 307 warnings de B-02/G-01).
- **Decisión:** sólo se garantiza que **lo añadido** esté limpio; no se reformatean los archivos.
- **Razón:** el reformateo masivo escondería el diff real del lote. Verificado que mis bloques
  son idempotentes bajo Prettier comparando contra una copia formateada: cero cambios en las
  líneas nuevas.
- **Reversibilidad:** total.

### D-19 — Impacto de versión: `minor`

- **Contexto:** el lote añade exports (feature) y **estrecha** el rango de peer de Tailwind.
- **Opciones:** (a) `patch`; (b) `minor`; (c) `major`.
- **Decisión:** **(b)**, y la objeción queda escrita como P-04.
- **Razón:** hay funcionalidad nueva (descarta `patch`). Estrechar un peer es, en semver
  estricto, _breaking_; pero el tramo que se retira (`3.4.17`–`4.0.x`) **nunca funcionó** con
  este plugin, así que ninguna instalación que hoy funcione se rompe. Si el dueño prefiere ser
  estricto, cambiar el changeset a `major` es una palabra.
- **Reversibilidad:** total mientras el changeset no se consuma en un release.

### D-20 — P-01 resuelta: un tema custom `--default` **sigue** pintando la raíz

- **Contexto:** pregunta abierta del lote 0. `tw-theme/v1` proponía que un tema custom
  `--default` dejase de aplicar en `:where(<root>)` y sólo con `[data-theme="<name>"]`.
- **Opciones:** (a) adoptar el cambio de `tw-theme/v1`; (b) conservar la semántica actual.
- **Decisión:** **(b)**, conservar.
- **Razón:** el flag se llama `--default`; "el tema por defecto del sitio" es la lectura
  natural, es lo que `AGENTS.md` §4.6 documenta, y la alternativa deja `--default` sin ninguna
  diferencia observable frente a no poner flag salvo el nombre. Además **ya está fijada por
  e2e**: `custom-theme.spec.ts:15` ("should apply custom theme to `:root` with `--default`
  flag") afirma que `:root` recibe `--color-primary` del tema `brand`, y pasa. No hacía falta
  fixture nuevo: hacía falta leer el que ya existía. Un consumidor que quiera "existe pero hay
  que activarlo" lo consigue hoy omitiendo el flag… **no**: sin flag se registra también como
  `--default` (`getThemeNameConfig`), así que ese caso de uso **no tiene expresión** → pasa a
  P-05 como propuesta de flag nuevo, no como cambio de semántica del existente.
- **Reversibilidad:** total, pero adoptar (a) más tarde sería _breaking_ para los consumidores.

### D-21 — La config de Playwright del repo no se toca; el override vive fuera del repo

- **Contexto:** `playwright-core` 1.54.2 pide el Chromium 1200 y el contenedor trae el 1243
  (`/opt/pw-browsers/chromium`), así que `pnpm e2e` falla con "Executable doesn't exist".
- **Opciones:** (a) añadir `executablePath` a `e2e/playwright.config.ts`; (b) actualizar
  Playwright; (c) config de override fuera del repo, sólo para esta sesión.
- **Decisión:** **(c)**.
- **Razón:** (a) cablearía una ruta del contenedor en el repo y rompería a cualquiera con
  Playwright instalado normalmente. (b) es un bump de dependencia fuera del alcance del lote
  (y toca el lockfile, ver D-17). (c) no deja rastro: los 98 tests son los del repo, corridos
  con su misma `testDir`. Queda como G-09.
- **Reversibilidad:** total (el archivo está en el scratchpad de la sesión, no en el repo).

## 7. Bloqueantes

| ID   | Severidad | Descripción                                                                                                                                                                                            | Estado      |
| ---- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| B-03 | 🔴 → ✅   | Heredado del lote 0: la sesión no podía hacer `push` ni abrir PR (403, repo fuera del conjunto autorizado). **No se reproduce**: `git push -u origin claude/lote-1` funcionó al inicio de esta sesión. | **CERRADO** |

**Ningún bloqueante abierto en este lote.** Las 4 tasks se completaron en el primer intento
(ningún reintento consumido de los 3 permitidos).

## 8. Preguntas abiertas, objeciones y gaps

### Preguntas abiertas

- **P-01 → RESUELTA** en D-20: se conserva la semántica actual, ya cubierta por e2e.
  **Las cuatro vivas se respondieron y el dueño las aprobó el 2026-11-19.** Registradas en
  `@docs/BUILD-BATCHES.md` (L21, L22 y el protocolo de lote) y en `AGENTS.md` §4.3/§11 por la
  rama `claude/decisiones-lotes-0-1`. Se dejan aquí con su resolución para que no se reabran.

- **P-01 → RESUELTA** en D-20: se conserva la semántica actual, ya cubierta por e2e.
- **P-02 — ¿paleta de marca definitiva? → CERRADA el 2026-11-19.** La neutra se queda como
  tema built-in por defecto y la de marca se publica como par de temas opcionales (`ownui` /
  `ownui-dark`), activables con `themes: "ownui"`. **Los valores, que eran lo único que
  faltaba, ya están calculados, verificados y aprobados**: las dos tablas (24 tokens por tema,
  con sus 8 `-focus`, todos en AA 4.5:1 en reposo **y** en interacción) están en
  `@docs/BUILD-BATCHES.md` §L21, y `scripts/check-contrast.mjs` las reproduce. Único hex nuevo
  del sistema: `accent #6865D6`. Implementación: slice del lote 21.
- **P-03 — ¿se borran las ramas muertas? → SÍ, aprobado**, y el script se amplió a 12 ramas
  (`claude/lote-0` incluida) con detección por contenido para las squash-mergeadas. **No se pudo
  ejecutar**: `git push origin --delete` devuelve 403 desde el proxy git de la sesión en las 12
  (ver B-04 en `specs/lote-0.md`). No es falta de permiso del dueño: el mismo remoto acepta
  `git push` de commits nuevos. Queda una orden para el dueño.
- **P-04 — ¿`minor` o `major`? → `minor`, sin cambios.** El tramo de peer retirado
  (`3.4.17`–`4.0.x`) nunca funcionó con este plugin, así que no se rompe ninguna instalación que
  hoy funcione, y gastar el `2.0.0` en corregir un metadato no compra nada. El changeset de este
  lote ya dice `minor`: **no hay nada que cambiar en esta PR**.
- **P-05 — ¿flag "tema registrado pero no por defecto"? → SÍ, como flag nuevo y aditivo
  `--opt-in`, en el lote 21.** Hoy `--default` es decorativo (un tema sin flag se comporta
  igual), así que ese caso de uso no tiene forma de expresarse. Aditivo ⇒ no rompe a nadie, al
  contrario del cambio de semántica que P-01 rechaza. Coste: un valor en el enum `Flags`, una
  rama en `theme.ts` y un fixture e2e. Nombre aprobado: `--opt-in`.

### Objeciones

- **O-03 — AC-6 no se puede cumplir desde el monorepo.** La redacción "el README muestra los
  pasos de instalación ejecutados" es cumplible de forma trivial y falsa: dentro del paquete,
  `@import "@ownui/tw-theme/css"` resuelve por self-reference de Node. El único cierre honesto
  es el tarball en un proyecto limpio, y es el que descubrió D-16. Sugerencia para el plan:
  los lotes que toquen empaquetado deberían pedir explícitamente "instalación desde tarball
  fuera del monorepo".
- **O-04 — `pnpm e2e` no corre en este entorno con la config del repo** (G-09). Los 98 tests
  verdes se obtuvieron con un override. Quien revise la PR en otro entorno debería obtener lo
  mismo con `pnpm e2e` a secas, pero conviene saberlo.

### Gaps (fuera de alcance, para el backlog)

- **G-06 — `.btn` transiciona `background-color` 0.2s, así que medir color justo después de
  cambiar de tema da el valor viejo.** Descubierto al fallar el test de cambio en runtime: el
  token ya valía `#60a5fa` mientras `background-color` seguía en `rgb(59, 130, 246)`. No es un
  bug (la transición es deseada), pero **invalida cualquier assert de color inmediato** y es una
  fuente garantizada de flakes para los lotes 5, 6 y 23. Convendría un helper e2e compartido
  que espere el fin de la transición.
- **G-07 — `--color-base-100` sigue sin existir** y `dropdown.css` lo usa como color de
  superficie 3 veces: en el fixture, `.dropdown` tiene `position: relative` pero su fondo no
  resuelve. Por eso el spec **no** asertó el `background-color` del dropdown: acoplaría este
  lote al 4. Confirma G-05 del lote 0 (la base negra) y la urgencia del lote 4.
- **G-08 — El lockfile tiene un _importer_ obsoleto**:
  `packages/tw-theme/e2e/fixtures/react-components`, un directorio que no existe en `develop`
  (es el fixture de G-03, que vive en una rama copilot). Cualquier `pnpm install` que regenere
  el lockfile lo borrará y meterá ese diff en la PR que toque. Limpieza de una línea para L3.
- **G-09 — `pnpm e2e` no arranca con el Chromium del contenedor**: `playwright-core` 1.54.2
  pide el build 1200, el preinstalado es el 1243. Afecta a sesiones de agente, no a CI (que
  instala Chromium). Se resuelve con un bump de Playwright, propio de L3.
- **G-10 — `.btn-md` depende de que `--btn-p` y `--size` se redeclaren** en cada clase de
  tamaño, duplicando los valores de `.btn`. Funciona, pero `.btn` y `.btn-md` declaran lo mismo
  dos veces; candidato a limpieza cuando el lote 5 toque el contrato de Button.
- **G-02 (heredado) — `ci.yml` sólo se dispara en PRs hacia `main`**, así que **esta PR hacia
  `develop` no ejecutará CI**. Sigue siendo un agujero del modelo de ramas y el prompt prohíbe
  tocar CI. La verificación de esta PR es la de esta spec.
- **G-01 (heredado) — `pnpm lint` falla en `develop`** con 5 errores preexistentes
  (`jest.setup.js`, `Dropdown.stories.tsx`). Se verifica abajo que este lote no añade ninguno.

## 9. Log cronológico

| #   | Hecho                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `develop` confirmada en `6aa40a1` (lote 0 mergeado vía PR #25). `claude/lote-1` creada de ahí.                                                                                                                                                                                                               |
| 2   | `git push -u origin claude/lote-1` **funciona**: el bloqueante crítico B-03 del lote 0 no se reproduce.                                                                                                                                                                                                      |
| 3   | `pnpm install --frozen-lockfile` en verde (Node v22.23.5, pnpm 10.7.0).                                                                                                                                                                                                                                      |
| 4   | Re-verificado el bug raíz: `grep -rn "src/css\|/css/"` sobre `packages/` y `.github/` → **0 referencias**.                                                                                                                                                                                                   |
| 5   | Spec creada con 12 slices y 4 tasks, todas SECUENCIALES.                                                                                                                                                                                                                                                     |
| 6   | **T1** `fa37a83`: `index.css` + eliminación de `menu.css` (D-13) + comentario obsoleto de `button.css`.                                                                                                                                                                                                      |
| 7   | **T2** `944e99d`: exports `./css` y `./css/*` (D-15) + copia vía tsup `onSuccess` (D-14). `ls dist/css` → 4 archivos; `npm pack --dry-run` → 4 CSS en el tarball.                                                                                                                                            |
| 8   | Resolución verificada con `createRequire().resolve()` en las tres rutas: el prototipo `"./css": "./dist/css"` de `tw-theme/v1` habría fallado.                                                                                                                                                               |
| 9   | Fixture compilado a mano con `@tailwindcss/cli`: el `@apply` de `loader.css` resuelve a `display: inline-flex` en el CSS compilado.                                                                                                                                                                          |
| 10  | **T3** `9138e52`: 18 tests nuevos. 17 pasan al primer intento; falla el de cambio de tema en runtime.                                                                                                                                                                                                        |
| 11  | Depurado con Playwright a mano: el token ya era `#60a5fa` y `background-color` seguía en `rgb(59, 130, 246)` ⇒ es la transición de 0.2s de `.btn`, no un bug (G-06). Test rehecho con `expect.poll`.                                                                                                         |
| 12  | Suite e2e completa: **98/98 en verde** (80 preexistentes + 18 nuevos).                                                                                                                                                                                                                                       |
| 13  | Verificación de consumidor real: `npm install` del tarball en un proyecto limpio **falla** con `ERESOLVE` por el peer de Tailwind ⇒ D-16.                                                                                                                                                                    |
| 14  | Peer corregido a `">=4.1.0 <5"`. `--lockfile-only` produce churn ajeno ⇒ revertido; `--frozen-lockfile` sigue verde (D-17).                                                                                                                                                                                  |
| 15  | Reintentada la instalación limpia: 34 paquetes, `npx @tailwindcss/cli` compila y la salida contiene `.btn { display: inline-flex; … }` ⇒ **AC-6 cerrado con evidencia real**.                                                                                                                                |
| 16  | **T4** `986b36b`: READMEs reescritos con esos pasos, changeset `minor`, P-01 cerrada (D-20), `AGENTS.md` §9.1 marcada resuelta, spec al día.                                                                                                                                                                 |
| 17  | Fase final: `git fetch origin develop` → **0 behind**, nada que mergear, sin conflictos.                                                                                                                                                                                                                     |
| 18  | Suite de cierre: `pnpm lint` 5 errores / 307 warnings (**idéntico al baseline de `develop`**, ninguno en archivos del lote) · `tsc --noEmit` limpio en `packages/tw-theme/tsconfig.json` y `e2e/tsconfig.json` · `pnpm test` 4 suites / 35 tests · `pnpm build` OK con `dist/css/` completo · e2e **98/98**. |
| 19  | `turbo.json` declara `outputs: ["dist/**"]`, así que la caché de turbo también restaura `dist/css/`: no hace falta tocar turbo.                                                                                                                                                                              |
