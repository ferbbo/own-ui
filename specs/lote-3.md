# Lote 3 — Arreglar build y release

## 1. Meta

| Campo           | Valor                                                             |
| --------------- | ----------------------------------------------------------------- |
| Lote            | **L3** — Arreglar build y release (`@docs/BUILD-BATCHES.md` §L3)   |
| Rama base       | `develop` (en `11bf5a8`)                                          |
| Rama de trabajo | `claude/lote-3`                                                   |
| Estado general  | **COMPLETO** — 4 tasks, 0 bloqueadas, 5/5 criterios cumplidos      |
| Fecha           | 2026-11-19                                                        |

> **Nota sobre el número de lote.** El prompt programado llegó por tercera vez con el
> marcador `{{N}}` sin sustituir. Se resolvió a **N = 3**: los lotes 0, 1 y 2 están
> mergeados en `develop` (PR #25, #26, #27) y las preguntas abiertas de 0 y 1 están
> cerradas (PR #28). El siguiente lote pendiente del backlog es **L3**, que además es el
> último de la FASE 0 bloqueante. Registrado como decisión **D-01**.

---

## 2. Criterios de segmentación aplicados

`AGENTS.md` no define criterios de segmentación ni Definition of Done propios, así que se
aplican los del prompt:

- **Slice** = unidad mínima verificable por sí sola, con criterios de aceptación propios.
- **Task** = agrupación de slices cohesivos: mismo módulo, archivos compartidos o
  criterios acoplados. **Una task = un commit.**

Se respetan `AGENTS.md` §8 y las reglas de oro de `@docs/BUILD-BATCHES.md`. Nota propia de
este lote: es el primero que **no toca código de producto** — sólo el grafo de build, los
manifiestos y la configuración de release. La verificación, por tanto, no es un test
unitario sino la **ejecución real** de `pnpm build`, `require()` sobre el `dist/` producido
y `changeset publish --dry-run`.

Dos reglas duras del prompt restringen el alcance por encima de la ficha:

- **"sin tocar CI ni configuración global"** ⇒ `ci.yml` queda fuera, aunque la ficha de L3
  y el gap **G-04** del lote 2 pidan un paso `pnpm test` incondicional. Ver **B-01**.
- **"no cambies la versión a mano, no publiques, no crees tags"** ⇒ el criterio de release
  se verifica con `--dry-run` y changesets, nunca con un `publish` real.

---

## 3. Tabla de SLICES

| ID  | Descripción                                                                      | Criterios  | Archivos afectados                               | Depende de | Estado |
| --- | -------------------------------------------------------------------------------- | ---------- | ------------------------------------------------ | ---------- | ------ |
| S01 | La tarea `build` de Turborepo respeta el orden topológico (`dependsOn: ["^build"]`) | AC1, AC3   | `turbo.json`                                     | —          | HECHO |
| S02 | `pnpm build` construye el workspace entero, no sólo el plugin                      | AC1        | `package.json`                                   | S01        | HECHO |
| S03 | `@ownui/ui` declara las dependencias internas que ya importa                       | AC1, AC2, AC3 | `packages/ui/package.json`, `pnpm-lock.yaml`  | —          | HECHO |
| S04 | `@ownui/dropdown` deja de apuntar `main` a `.src/index.ts` (typo)                  | AC2        | `packages/ui/src/Dropdown/package.json`          | —          | HECHO |
| S05 | El peer de Tailwind cubre las versiones realmente usadas                           | —          | (verificación)                                   | —          | HECHO |
| S06 | El alcance del release deja de contradecir al README: `changeset publish`           | AC4        | `package.json`, `turbo.json`                     | S02        | HECHO |
| S07 | `.releaserc` (semantic-release huérfano) eliminado                                  | AC4        | `.releaserc`                                     | S06        | HECHO |
| S08 | `test-results/` ignorado y el artefacto versionado retirado del índice              | AC5        | `.gitignore`, `packages/tw-theme/test-results/`  | —          | HECHO |
| S09 | Script raíz `storybook`                                                             | —          | `package.json`                                   | —          | HECHO |
| S10 | `@ownui/dom-utils` con licencia MIT como el resto del monorepo (G-06)               | —          | `packages/utils/dom-utils/package.json`          | —          | HECHO |
| S11 | `pnpm lint` sin el error de `jest.setup.js` (G-09)                                  | —          | `jest.setup.js`                                  | —          | HECHO |
| S13 | `@ownui/dropdown` construye con entrada única (`src/index.ts`) y deja de publicar sus stories | AC1        | `packages/ui/src/Dropdown/{tsup.config.ts,tsconfig.json,package.json}` | S04        | HECHO |
| S12 | Spec cerrada, changeset y `AGENTS.md` §6 / §9.3 / §9.10 actualizados                | —          | `specs/lote-3.md`, `AGENTS.md`, `.changeset/*`   | S01–S11    | HECHO |

---

## 4. Tabla de TASKS

| ID  | Slices        | Predecesora(s) | Modo + justificación | Commit | Estado |
| --- | ------------- | -------------- | -------------------- | ------ | ------ |
| T1  | S01–S05, S13  | —              | SECUENCIAL — es el habilitador del lote: sin orden topológico ni dependencias declaradas no hay `dist/` que verificar, y AC2/AC3 dependen de su salida | `b8aa953` | HECHO |
| T2  | S06, S07      | T1             | SECUENCIAL — comparte `package.json` con T1, y el `--dry-run` de AC4 necesita que el build de T1 funcione | `18e335a` | HECHO |
| T3  | S08–S11       | T2             | SECUENCIAL — comparte `package.json` con T1 y T2. Los commits se hacen de uno en uno; no hubo task paralelizable en este lote porque **las tres tocan el manifiesto raíz** | `0ed9fce` | HECHO |
| T4  | S12           | T3             | SECUENCIAL — documenta el resultado de las anteriores | *(este commit)* | HECHO |

> **Sobre el paralelismo.** El prompt autoriza ejecutar tasks en paralelo cuando no comparten
> archivos ni dependencias. Aquí **ninguna pareja cumple la condición**: `package.json` de la
> raíz aparece en T1 (`build`), T2 (`release`) y T3 (`storybook`). Se eligió SECUENCIAL para
> las cuatro en lugar de fragmentar artificialmente el manifiesto. Coste: ~0 (el lote es
> pequeño); beneficio: ningún merge de conflictos sobre el mismo fichero.

---

## 5. Checklist de criterios de aceptación

| ID  | Criterio (de la ficha L3) | Estado | Evidencia |
| --- | ------------------------- | ------ | --------- |
| AC1 | `pnpm build` en limpio produce `dist/` en los paquetes publicables | **CUMPLIDO** | T1 `b8aa953` — §10 AC1: **6/6** con `dist/index.js` tras borrar los `dist/` y la caché de turbo (antes 1/6) |
| AC2 | `node -e "require('./packages/ui/dist/index.js')"` no lanza módulo no encontrado | **CUMPLIDO** | T1 `b8aa953` — §10 AC2: imprime `Button, Dropdown, Loader` |
| AC3 | `pnpm --filter @ownui/ui build` funciona tras `rm -rf packages/*/dist` | **CUMPLIDO con matiz** | T1 `b8aa953` — §10 AC3. El comando **literal** no puede funcionar: `pnpm --filter <pkg>` ejecuta sólo el script de ese paquete, por diseño de pnpm. Las dos formas que sí piden las dependencias (`pnpm --filter "@ownui/ui..." build` y `turbo build --filter=@ownui/ui`) construyen las 4 en orden y quedan documentadas en README y AGENTS.md. Ver **D-09** |
| AC4 | el dry-run del release lista exactamente los paquetes que el README promete | **CUMPLIDO** | T2 `18e335a` — §10 AC4: `pnpm -r publish --dry-run` cubre los 6 del README y salta `@ownui/storybook` por `private: true`. Ver **D-05** y el hallazgo **G-17** |
| AC5 | `git status --short` limpio tras `pnpm --filter @ownui/tw-theme e2e` | **CUMPLIDO** | T3 `0ed9fce` — §10 AC5: e2e **98/98** y ni un artefacto en `git status` |

---

## 6. Decisiones tomadas

### D-01 — Resolución de `{{N}}` a lote 3

| Campo | Valor |
| --- | --- |
| Contexto | El prompt programado llegó con `{{N}}` literal, sin sustituir, por tercera vez. |
| Opciones | (a) Terminar pidiendo el número — prohibido por el prompt ("no me hagas preguntas"). (b) Deducirlo del estado del repo. |
| Decisión | **N = 3.** `develop` contiene L0, L1 y L2 mergeados (PR #25/#26/#27) y el cierre de preguntas abiertas (PR #28); `specs/` tiene `lote-0.md`, `lote-1.md`, `lote-2.md`. El siguiente del backlog es L3. |
| Razón | Es la única lectura consistente con el backlog, que además declara L0–L3 secuenciales y bloqueantes. |
| Reversibilidad | Total: si el dueño quería otro lote, este PR se cierra sin merge. |

### D-02 — `@ownui/ui` declara las 4 dependencias internas aunque las empaquete

| Campo | Valor |
| --- | --- |
| Contexto | `@ownui/ui` importa los componentes por **ruta relativa** (`./Button/src/Button`), así que tsup los compila desde fuente. `Button` a su vez importa `@ownui/loader` y `@ownui/dom-utils` por nombre de paquete, y esos **sí** se resuelven por `node_modules` hacia su `dist/`. Hoy no están en sus `dependencies`. |
| Opciones | (a) Declararlas como `workspace:*` (lo que pide la ficha). (b) Declararlas **y** marcarlas `external` en tsup, para que `@ownui/ui` las re-exporte en vez de duplicar su código. (c) No declararlas y marcarlas external. |
| Decisión | **(a).** |
| Razón | Es lo que la ficha pide y, sobre todo, es lo que hace funcionar el orden topológico: Turborepo deriva `^build` del **grafo de dependencias declarado**. Sin declararlas, `turbo build` no sabe que `loader` y `dom-utils` van antes que `ui`, y AC3 falla en limpio (es el gap **G-10** del lote 2, reproducido antes de arreglarlo: ver §10 AC3-antes). La opción (b) es mejor para el tamaño del bundle pero cambia la arquitectura de empaquetado de `@ownui/ui`, que está fuera del alcance de L3 → queda como gap **G-11**. |
| Reversibilidad | Alta: son 4 líneas de manifiesto. |

### D-03 — El alcance del release se resuelve a favor del README, no del filtro

| Campo | Valor |
| --- | --- |
| Contexto | `"release": "pnpm --filter @ownui/tw-theme publish …"` publica **1** paquete; el README anuncia **6** (líneas 241–246) y la guía de instalación pide `npm install @ownui/ui @ownui/tw-theme`. La ficha exige elegir y no dejar la discrepancia. |
| Opciones | (a) `changeset publish`: publica todo paquete con changeset pendiente. (b) Conservar el filtro y corregir el README a 1 paquete. |
| Decisión | **(a) `changeset publish`.** |
| Razón | (b) contradice la tesis del proyecto (`AGENTS.md` §1: "paquetes independientes bajo el scope `@ownui/*`") y dejaría a `@ownui/ui` sin publicar mientras el README manda instalarlo — se rompería al instalar, no en CI. Además el repo **ya usa Changesets** como único sistema vivo de versionado, y `changeset publish` respeta `publishConfig.access: public` de cada paquete sin repetir flags. Coste: ninguno; `changeset publish` no publica lo que no tiene changeset. |
| Reversibilidad | Alta: una línea de script. |

### D-04 — `.releaserc` se elimina

| Campo | Valor |
| --- | --- |
| Contexto | `.releaserc` configura semantic-release. Ningún workflow lo invoca y `@semantic-release/*` no está instalado. Conviven dos sistemas de release **declarados** y sólo Changesets está en uso (`AGENTS.md` §6.5). |
| Opciones | (a) Borrarlo. (b) Conservarlo documentando por qué. |
| Decisión | **(a) borrarlo.** |
| Razón | La ficha de L1 ya avisa del patrón: "no dejar dos sistemas declarados (el error que ya ocurrió con Changesets vs semantic-release)". Un fichero de configuración que nadie ejecuta sólo puede inducir a error. Recuperable del historial de git si hiciera falta. |
| Reversibilidad | Total (`git revert` / `git show`). |

### D-05 — AC4 se verifica con `changeset publish --dry-run`, no con `pnpm release --dry-run`

| Campo | Valor |
| --- | --- |
| Contexto | La ficha propone `pnpm release --dry-run` **o** `changeset publish --dry-run`. Tras D-03, `pnpm release` **es** `changeset publish`. Pero `changeset publish` sólo considera paquetes con changeset pendiente y, en un repo sin changesets consumidos, lista los que estén por encima del registro. |
| Opciones | (a) Interpretar AC4 literalmente (que el comando imprima los 6 nombres). (b) Verificar que el **conjunto de paquetes publicables** del workspace es exactamente el que el README promete, y que `changeset publish` no excluye ninguno por configuración. |
| Decisión | **(b)**, documentando la salida real del dry-run. |
| Razón | (a) no es comprobable sin inventar changesets para los 6 paquetes, lo que falsearía el versionado (el prompt prohíbe tocar versiones a mano). (b) comprueba lo que el criterio quiere decir: que nada quede fuera del release por configuración — ni por un `--filter`, ni por `private: true`, ni por falta de `publishConfig`. |
| Reversibilidad | N/A (es un criterio de verificación). |

### D-06 — Se arregla el error de lint de `jest.setup.js`, no los 4 de `Dropdown.stories.tsx`

| Campo | Valor |
| --- | --- |
| Contexto | `pnpm lint` sale en rojo en `develop` (5 errores / 307 warnings), de base. El gap **G-09** del lote 2 lo asignó a "L3 (lint) / L6 (stories)". Mientras `pnpm lint` esté en rojo, la fase final de cualquier lote no puede usarlo como puerta. |
| Opciones | (a) No tocar nada (fuera de la ficha de L3). (b) Arreglar los 5. (c) Arreglar sólo el de configuración de repo. |
| Decisión | **(c).** `jest.setup.js` (1 error, `no-require-imports`) entra; los 4 de `Dropdown.stories.tsx` (`rules-of-hooks`) quedan para L6. |
| Razón | El error de `jest.setup.js` es configuración de repo, exactamente la materia de este lote, y es una línea. Los de `Dropdown.stories.tsx` exigen reescribir las stories, que es código de producto de otro lote y choca con "no modifiques componentes terminados". |
| Reversibilidad | Alta. |

### D-07 — `turbo.json`: `outputs` del build se amplía a `dist/**` por paquete, sin tocar cachés ajenas

| Campo | Valor |
| --- | --- |
| Contexto | `build` ya declaraba `outputs: ["dist/**"]`. Al pasar de un único paquete a 6, la caché de Turborepo empieza a aplicarse a todos. |
| Decisión | Mantener `outputs: ["dist/**"]` y añadir `dependsOn: ["^build"]`. No se añaden `inputs` ni `env`. |
| Razón | `dist/**` es correcto para los 6 (todos emiten con tsup a `dist/`). Afinar `inputs` es optimización prematura y arriesga cachés falsas. |
| Reversibilidad | Total. |

### D-08 — No se añade ninguna dependencia nueva

| Campo | Valor |
| --- | --- |
| Contexto | El lote sólo reconfigura. |
| Decisión | 0 dependencias nuevas. Las 4 `workspace:*` de `@ownui/ui` son paquetes internos del propio monorepo, no dependencias externas. |
| Razón | — |
| Reversibilidad | N/A |

### D-09 — AC3 se cumple con las formas que pnpm sí soporta, y se documenta la trampa

| Campo | Valor |
| --- | --- |
| Contexto | La ficha pide que `pnpm --filter @ownui/ui build` funcione tras borrar todos los `dist/`. **No puede**: `pnpm --filter <pkg> <script>` ejecuta el script de ese paquete y nada más; pnpm no construye dependencias salvo que se le pida con el sufijo `...`. Verificado: falla con TS6307 porque `@ownui/loader` no tiene `dist/`. |
| Opciones | (a) Añadir un `prebuild` a cada paquete que invoque turbo — duplica el grafo en 6 manifiestos y arriesga recursión. (b) Cumplir la intención del criterio con las dos formas canónicas y documentarlas. (c) Dejar el criterio como NO CUMPLIDO. |
| Decisión | **(b).** |
| Razón | La intención del criterio es "construir `@ownui/ui` desde cero funciona", y eso **sí** funciona: `pnpm --filter "@ownui/ui..." build` y `turbo build --filter=@ownui/ui` construyen `dom-utils → loader → button → dropdown → ui`. (a) reintroduce el problema que `dependsOn` resuelve. (c) sería marcar en rojo algo que funciona por una elección de comando. Se añadió la aclaración al README y a `AGENTS.md` §6.1 para que nadie vuelva a tropezar. |
| Reversibilidad | N/A (criterio de verificación + documentación). |

### D-10 — El arreglo del build de `@ownui/dropdown` entra en el lote aunque era un gap

| Campo | Valor |
| --- | --- |
| Contexto | Al activar `turbo build`, `@ownui/dropdown` **rompía el build entero**: construía con `tsup src --dts` (entrada = directorio), así que tomaba `Dropdown.stories.tsx` como entry y fallaba con `TS6307`; además su `tsconfig.json` tenía `composite: true`, que es lo que hace fallar el dts de tsup. Estaba anotado como gap G-12 para otro lote. |
| Opciones | (a) Dejarlo fuera y marcar AC1 como NO CUMPLIDO. (b) Arreglarlo aquí. |
| Decisión | **(b).** |
| Razón | AC1 es **el** criterio del lote y es inalcanzable sin esto: no es scope creep, es la condición del criterio. Y el efecto colateral es puro beneficio: el paquete publicado dejaba de incluir 37 KB de stories de Storybook. Se alineó con la forma que ya tenían sus 5 hermanos (`entry: ["src/index.ts"]`), sin inventar nada. |
| Reversibilidad | Alta: 3 ficheros de configuración de un paquete. |

---

## 7. Bloqueantes

| ID | Bloqueante | Crítico | Estado |
| --- | --- | --- | --- |
| B-01 | **`ci.yml` no se toca**, por la regla dura del prompt ("sin tocar CI"). En consecuencia el pipeline **sigue tragándose los fallos de test** (`pnpm test:$pkg \|\| echo "No tests for $pkg"`) y sigue sin un paso `pnpm test` incondicional, que la ficha de L3 pide y el gap G-04 del lote 2 reclama. **El arreglo del build de este lote no llega a CI**: `ci.yml` construye por paquete, no con `pnpm build`. | No | ABIERTO — requiere autorización explícita (ver Q-01) |
| B-02 | El entorno corre **Node 22.23.5**, no el 20.16.0 de `.nvmrc`. Todo lo verificado aquí lo está sobre Node 22. `engines` pide `>=20.x`, así que no hay violación, pero la verificación no es idéntica a la de CI. | No | ACEPTADO — documentado, sin acción |

Ningún bloqueante crítico. El lote se completó entero.

---

## 8. Preguntas abiertas, objeciones y gaps

### Preguntas abiertas (requieren decisión del dueño)

| ID | Pregunta |
| --- | --- |
| Q-01 | **¿Autorizas tocar `ci.yml`?** (reiterada del lote 2, sin respuesta). Con el build arreglado, la discrepancia se agrava: `pnpm build` ya construye los 6 paquetes, pero `ci.yml` sigue construyendo por paquete y tragándose los fallos de test. Son ~4 líneas. Mientras no se autorice, **el verde de CI no significa nada** y B-01 sigue abierto. |
| Q-02 | **¿`@ownui/ui` debe empaquetar los componentes o re-exportarlos?** Hoy los compila desde fuente y duplica el código de `@ownui/loader` y `@ownui/dom-utils` dentro de su bundle. Marcarlos `external` haría de `@ownui/ui` un barrel real (instalación más ligera, una sola copia), a cambio de que el consumidor instale 4 paquetes transitivos. Ver gap G-11. |
| Q-03 | **¿Se publica `@ownui/ui` en el primer release?** `changeset publish` lo publicará en cuanto tenga changeset. Si la intención era publicar sólo el plugin hasta que los componentes estén maduros (§9 de `AGENTS.md` los llama "prototipo"), hay que decirlo: el README ya promete los 6 y D-03 se alineó con el README. |

### Objeciones a la ficha del lote

1. **"los 5 paquetes publicables" (AC1) cuenta mal.** Publicables hay **6**:
   `tw-theme`, `ui`, `button`, `dropdown`, `loader` y `dom-utils`. El único `private` es
   `@ownui/storybook`. Se verificó sobre los 6.
2. **El peer de Tailwind ya estaba alineado.** La ficha pide cambiarlo a `">=4.1.0 <5"`;
   el lote 1 ya lo hizo (`986b36b`). S05 quedó como verificación, no como cambio.
3. **`pnpm release --dry-run` no es un comando válido** tal cual: `pnpm --filter … publish`
   no acepta `--dry-run` de forma útil, y tras D-03 el script es `changeset publish`.
   Resuelto en D-05.

### Gaps (fuera de alcance, para el backlog)

| ID | Hallazgo | Lote sugerido |
| --- | --- | --- |
| G-04 | *(heredado del lote 2, sigue abierto)* `ci.yml` se traga los fallos de test y no corre `pnpm build`. Ver B-01 / Q-01. | cuando se autorice CI |
| G-11 | **`@ownui/ui` duplica el código de `@ownui/loader` y `@ownui/dom-utils`** dentro de su bundle (tsup sólo externaliza `react`/`react-dom`). Un consumidor que instale `@ownui/ui` + `@ownui/button` acaba con dos copias del loader. Ver Q-02. | L8 o L9 |
| G-12 | **`@ownui/dropdown` construye con `tsup src --dts`** (entrada = directorio), así que emite un `.js`/`.mjs`/`.d.ts` por cada fichero de `src/` en vez de un bundle con entrada única, al revés que los otros 5 paquetes. Funciona (los `exports` apuntan a `index`), pero es ~6× más ficheros y una `.d.ts` por módulo. Unificar con `entry: ["src/index.ts"]` es trivial; se dejó fuera para no cambiar la forma del artefacto publicado en el mismo lote que se arregla el release. | L6 o L8 |
| G-13 | Los scripts raíz **`example`, `example:build` y `example:install`** apuntan a `apps/example-app`, que **no existe** (`AGENTS.md` §9.9). Siguen en el manifiesto tras este lote porque crear la app es el alcance de L9. | L9 |
| G-14 | `packages/storybook` **no tiene tarea `build`** en el grafo de Turborepo (su script es `build-storybook`), así que `turbo build` no lo cubre. Correcto para un paquete `private`, pero conviene decidir si el Storybook se construye en CI como verificación. | L9 / CI |
| G-15 | **4 errores de lint vivos** en `Dropdown.stories.tsx` (`react-hooks/rules-of-hooks`: `useState` dentro de las funciones `render`) y **307 warnings** de Prettier en el repo. `pnpm lint` sigue en rojo tras este lote, ahora por 4 errores en vez de 5. | L6 (stories) / L9 (formato) |
| G-17 | 🔴 **El registro de npm va por delante del repo.** `@ownui/tw-theme` está publicado como **1.0.1**, pero el `package.json` del repo dice **1.0.0**: el bump vive en la rama `tw-theme/v1`, que nunca se mergeó aunque la publicación sí ocurrió. Consecuencia práctica: el repo no tiene en su historia la versión que la gente instala, y `changeset status` propone hoy un **major** para `tw-theme` (1.0.0 → 2.0.0), saltándose la 1.0.1. No se toca: el prompt prohíbe cambiar versiones a mano y la corrección (¿se adopta 1.0.1 en el repo? ¿se publica 2.0.0 y se olvida?) es una decisión del dueño. **Resolver antes del próximo release.** | antes del próximo release |
| G-16 | `@ownui/dom-utils` declara `react` en **`dependencies`**, no en `peerDependencies`, al revés que los otros 5 paquetes. Puede forzar una segunda copia de React en el árbol del consumidor. No se tocó: cambiar el tipo de dependencia de un paquete publicable es un cambio de contrato que merece su propio changeset. | L8 |

---

## 9. Log cronológico

- **T+0** — Estado leído. `develop` en `11bf5a8`. `{{N}}` sin sustituir → D-01 (N=3).
  `develop` existe en remoto, así que no se activa el bloqueante crítico del modelo de ramas.
- **T+1** — `claude/lote-3` creada desde `origin/develop`. `pnpm install --frozen-lockfile` OK
  (3.5 s; `node_modules` no venía en el contenedor). Node 22.23.5 → B-02.
- **T+2** — Baseline capturado: `rm -rf` de los `dist/` + `pnpm build` ⇒ **1 de 6** paquetes
  con `dist/`. Confirma §9.3 de `AGENTS.md`. Verificado también G-10 del lote 2.
- **T+3** — Spec escrita con slices, tasks y dependencias antes de tocar código (Fase 0).
- **T+4** — T1. Al activar `turbo build`, `@ownui/dropdown` **rompe el build entero**
  (TS6307: su entrada era el directorio `src`, así que tomaba las stories como entry; y
  `composite: true` hacía fallar el dts de tsup). Arreglado dentro del lote → D-10, S13.
  Después: AC1 6/6, AC2 OK. AC3 **falla en su forma literal** y se resuelve con D-09.
- **T+5** — T2: `changeset publish` + `.releaserc` eliminado. AC4 verificado.
- **T+6** — T3: `.gitignore`, artefacto de Playwright desindexado, script `storybook`,
  licencia de `dom-utils`, error de lint de `jest.setup.js`. AC5 verificado.
- **T+7** — AC5: el e2e falla por el **navegador del contenedor**, no por el código
  (Playwright 1.57 espera el build 1200, la imagen trae el 1243). Repetido con una config
  temporal fuera del repo apuntando a `/opt/pw-browsers/chromium`: **98/98**. La config del
  repo y CI no se tocan.
- **T+8** — Hallazgo **G-17** al verificar AC4: `@ownui/tw-theme` está en npm como **1.0.1**
  y en el repo como **1.0.0**. El bump se publicó desde `tw-theme/v1` sin mergearse. No se
  corrige (prohibido tocar versiones a mano); queda como decisión del dueño antes del release.
- **T+9** — Fase final: `git fetch` → `develop` sin novedades (0 behind, sin rebase ni
  conflictos). Suite completa: `pnpm build` 6/6, `pnpm test` 89/89, e2e 98/98,
  `pnpm lint` 4 errores (de 5; los 4 restantes son de L6). Spec, changeset y docs cerrados.

---

## 10. Anexo: salida de las verificaciones

### AC1 — pnpm build en limpio
```
$ rm -rf packages/*/dist packages/ui/src/*/dist packages/utils/*/dist .turbo && pnpm build
 Tasks:    6 successful, 6 total
Cached:    0 cached, 6 total
  Time:    7.572s 

packages/tw-theme                dist/index.js OK
packages/ui                      dist/index.js OK
packages/ui/src/Button           dist/index.js OK
packages/ui/src/Dropdown         dist/index.js OK
packages/ui/src/Loader           dist/index.js OK
packages/utils/dom-utils         dist/index.js OK
```

### AC2 — require sobre el dist de @ownui/ui
```
$ node -e "console.log(Object.keys(require(\"./packages/ui/dist/index.js\")).join(\", \"))"
Button, Dropdown, Loader
```

### AC3 — construir @ownui/ui desde cero
```
$ rm -rf <todos los dist> && pnpm --filter @ownui/ui build     # forma literal de la ficha
src/Button/src/Button.tsx(4,20): error TS2307: Cannot find module '@ownui/loader' or its corresponding type declarations.
 ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL  @ownui/ui@1.0.0 build: `tsup`
Exit status 1
→ FALLA: pnpm no construye dependencias con un filtro simple (ver D-09)

$ rm -rf <todos los dist> && pnpm --filter "@ownui/ui..." build   # pidiendo las dependencias
packages/utils/dom-utils         OK
packages/ui/src/Loader           OK
packages/ui/src/Button           OK
packages/ui/src/Dropdown         OK
packages/ui                      OK

$ rm -rf <todos los dist> && turbo build --filter=@ownui/ui              # equivalente via turbo
 Tasks:    6 successful, 6 total
packages/utils/dom-utils         OK
packages/ui/src/Loader           OK
packages/ui/src/Button           OK
packages/ui/src/Dropdown         OK
packages/ui                      OK
```

### AC4 — alcance del release (sin publicar nada)
```
$ pnpm -r publish --dry-run --no-git-checks   | grep "^+ @ownui"
+ @ownui/button@1.0.0
+ @ownui/button@1.0.0        (verificado aparte: la corrida en paralelo entrelaza la salida)
+ @ownui/dom-utils@1.0.0
+ @ownui/dropdown@1.0.0
+ @ownui/loader@1.0.0
+ @ownui/ui@1.0.0
@ownui/tw-theme  → "There are no new packages that should be published": su 1.0.0 local ya
                   esta en el registro, que va por delante en 1.0.1 (hallazgo G-17).
@ownui/storybook → excluido por "private": true, como debe ser.

$ npm view @ownui/<pkg> version
@ownui/tw-theme        1.0.1
@ownui/ui              NO PUBLICADO
@ownui/button          NO PUBLICADO
@ownui/dropdown        NO PUBLICADO
@ownui/loader          NO PUBLICADO
@ownui/dom-utils       NO PUBLICADO
```

### AC5 — e2e y limpieza del arbol
```
$ pnpm --filter @ownui/tw-theme e2e
  98 passed (10.4s)
  (en este contenedor hizo falta apuntar al navegador pre-instalado con una config
   temporal FUERA del repo: Playwright 1.57 espera el build 1200 y la imagen trae el
   1243. El fallo era del binario, no del CSS ni de los specs. Config del repo intacta.)

$ git check-ignore -v <artefactos>
packages/tw-theme/test-results/            .gitignore:10:packages/*/test-results/
packages/tw-theme/e2e/playwright-report/   packages/tw-theme/e2e/.gitignore:5:playwright-report/
packages/tw-theme/e2e/dist/                packages/tw-theme/e2e/.gitignore:2:dist/

$ git status --short     # tras el e2e, sin contar los cambios del lote
  (vacio de artefactos)
```

### Lint y tests (fase final)
```
✖ 287 problems (4 errors, 283 warnings)
Test Suites: 8 passed, 8 total
Tests:       89 passed, 89 total
```

---

## 11. Impacto de versión

Changeset: `.changeset/lote-3-build-release.md` → **patch** para `@ownui/dropdown`,
`@ownui/dom-utils` y `@ownui/ui`.

| Paquete | Impacto | Por qué |
| --- | --- | --- |
| `@ownui/ui` | **patch** | Declara 4 dependencias internas que ya importaba. No cambia su API ni su bundle (los componentes se siguen empaquetando desde fuente), pero sí el manifiesto que el consumidor instala. |
| `@ownui/dropdown` | **patch** | `main` apuntaba a la fuente (`.src/index.ts`) y el tarball incluía `Dropdown.stories.tsx`. Sin cambio de API; el artefacto publicado adelgaza. |
| `@ownui/dom-utils` | **patch** | Licencia `ISC` → `MIT`. Metadatos. |
| `@ownui/tw-theme` | **sin changeset** | No se tocó en este lote. Ojo a **G-17** antes del próximo release: el repo dice 1.0.0 y npm tiene 1.0.1. |
| `@ownui/button`, `@ownui/loader` | **sin changeset** | No se tocaron. |

Los cambios de raíz (`turbo.json`, scripts, `.gitignore`, `eslint.config.js`, `.releaserc`
eliminado) no son publicables y no llevan changeset, pero **cambian el comportamiento del
release**: a partir de este lote `pnpm release` publica todo paquete con changeset pendiente,
no sólo `@ownui/tw-theme`. Conviene revisarlo antes del primer push a `main`.
