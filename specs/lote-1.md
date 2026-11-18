# Lote 1 — Publicar el CSS de componentes

## 1. Meta

| Campo           | Valor                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Lote            | **L1 — Publicar el CSS de componentes** (`@docs/BUILD-BATCHES.md`, Fase 0) |
| Severidad       | 🔴 Bug raíz (`AGENTS.md` §9.1)                                             |
| Rama base       | `develop` @ `6aa40a1` (merge de la PR #25, lote 0)                         |
| Rama de trabajo | `claude/lote-1`                                                            |
| Estado general  | EN CURSO                                                                   |
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

| ID   | Descripción                                                                          | AC            | Archivos                                               | Depende de | Estado    |
| ---- | ------------------------------------------------------------------------------------ | ------------- | ------------------------------------------------------ | ---------- | --------- |
| S-01 | `css/index.css` agregador que importa los CSS de componente                          | AC-4          | `packages/tw-theme/src/css/index.css`                  | —          | PENDIENTE |
| S-02 | Resolver `menu.css` (0 líneas): escribirlo o eliminarlo. No dejarlo vacío            | AC-4          | `packages/tw-theme/src/css/menu.css`                   | —          | PENDIENTE |
| S-03 | `package.json`: subpath exports `./css` y `./css/*`                                  | AC-4, AC-5    | `packages/tw-theme/package.json`                       | S-01       | PENDIENTE |
| S-04 | El build copia `src/css` → `dist/css`                                                | AC-4          | `packages/tw-theme/package.json` ó `tsup.config.ts`    | S-01       | PENDIENTE |
| S-05 | `npm pack --dry-run` incluye el CSS en el tarball                                    | AC-5          | —                                                      | S-04       | PENDIENTE |
| S-06 | Fixture e2e `component-styles/` que consume el export público del CSS                | AC-1          | `packages/tw-theme/e2e/fixtures/component-styles/*`    | S-03, S-04 | PENDIENTE |
| S-07 | Spec: `background-color` = `--color-primary`, `height` ≈ 2.5rem, `border-radius` ≠ 0 | AC-2          | `packages/tw-theme/e2e/tests/component-styles.spec.ts` | S-06       | PENDIENTE |
| S-08 | Caso `data-theme="dark"`: el `background-color` computado cambia                     | AC-3          | idem                                                   | S-07       | PENDIENTE |
| S-09 | Verificar el pipeline de `@apply` de `loader.css` sobre CSS compilado (no asumirlo)  | AC-2          | idem                                                   | S-06       | PENDIENTE |
| S-10 | Instalación real y verificada en `README.md` y `packages/tw-theme/README.md`         | AC-6          | `README.md`, `packages/tw-theme/README.md`             | S-05, S-07 | PENDIENTE |
| S-11 | Changeset del paquete publicable                                                     | regla release | `.changeset/*.md`                                      | S-03       | PENDIENTE |
| S-12 | Cerrar la pregunta abierta **P-01** del lote 0 con evidencia e2e                     | P-01          | `specs/lote-1.md`                                      | —          | PENDIENTE |

---

## 4. Tabla de TASKS

| ID  | Slices           | Predecesora | Modo + justificación                                                                                                                                                         | Commit | Estado    |
| --- | ---------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------- |
| T1  | S-01, S-02       | —           | **SECUENCIAL** (primera). Crea el artefacto (`index.css`) al que todo lo demás apunta.                                                                                       | —      | PENDIENTE |
| T2  | S-03, S-04, S-05 | T1          | **SECUENCIAL**. Los exports apuntan a `dist/css/index.css`: sin T1 el export resolvería a un archivo inexistente. Comparte `package.json` consigo misma, no con T1.          | —      | PENDIENTE |
| T3  | S-06..S-09       | T2          | **SECUENCIAL**. El fixture importa `@ownui/tw-theme/css`, es decir el export que T2 crea. Verificar antes de T2 daría un falso negativo.                                     | —      | PENDIENTE |
| T4  | S-10, S-11, S-12 | T3          | **SECUENCIAL**. AC-6 exige pasos de instalación **ejecutados y verificados**: documentar antes de T3 sería documentar lo no probado (el error que §9.9 ya reprocha al repo). | —      | PENDIENTE |

**Ninguna task se ejecuta en paralelo.** Las cuatro forman una cadena estricta
artefacto → publicación → verificación → documentación, y tres de ellas tocan
`packages/tw-theme/package.json` o dependen de su resultado. El prompt obliga a SECUENCIAL
ante dependencia o duda; aquí la dependencia es directa y no hay nada que ganar.

---

## 5. Checklist de criterios de aceptación

Los AC son los de la ficha L1 de `@docs/BUILD-BATCHES.md`.

| ID   | Criterio                                                                                                                                                  | Estado    | Evidencia |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | --------- |
| AC-1 | Nuevo fixture e2e `component-styles/` con un `<button class="btn btn-primary btn-md">`                                                                    | PENDIENTE | —         |
| AC-2 | El spec verifica sobre CSS compilado en Chromium: `background-color` = `--color-primary` (no `transparent`), `height` ≈ `2.5rem`, `border-radius` ≠ `0px` | PENDIENTE | —         |
| AC-3 | Un segundo caso con `data-theme="dark"` cambia el `background-color` computado                                                                            | PENDIENTE | —         |
| AC-4 | `pnpm --filter @ownui/tw-theme build && ls dist/css/` lista los `.css`                                                                                    | PENDIENTE | —         |
| AC-5 | `npm pack --dry-run` en `packages/tw-theme` incluye el CSS                                                                                                | PENDIENTE | —         |
| AC-6 | El README muestra los pasos de instalación **ejecutados y verificados**, no inventados                                                                    | PENDIENTE | —         |

---

## 6. Decisiones tomadas

(se rellena durante la ejecución)

---

## 7. Bloqueantes

| ID  | Severidad | Descripción | Estado |
| --- | --------- | ----------- | ------ |

---

## 8. Preguntas abiertas, objeciones y gaps

(se rellena durante la ejecución)

---

## 9. Log cronológico

| #   | Hecho                                                                                                                                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `develop` confirmada en `6aa40a1` (lote 0 mergeado vía PR #25). `claude/lote-1` creada de ahí.                                                        |
| 2   | `git push -u origin claude/lote-1` **funciona**: el bloqueante crítico B-03 del lote 0 (sin permiso de escritura) **no se reproduce** en esta sesión. |
| 3   | `pnpm install --frozen-lockfile` en verde (Node v22.23.5, pnpm 10.7.0).                                                                               |
| 4   | Re-verificado el bug raíz: `grep -rn "src/css\|/css/"` sobre `packages/` y `.github/` → **0 referencias** a los CSS de componente.                    |
| 5   | Spec creada con 12 slices y 4 tasks, todas SECUENCIALES.                                                                                              |
