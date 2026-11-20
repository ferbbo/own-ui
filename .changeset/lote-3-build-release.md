---
"@ownui/dropdown": patch
"@ownui/dom-utils": patch
"@ownui/ui": patch
---

Arreglo del build y del alcance del release (lote 3).

Antes de este lote, `pnpm build` construía **sólo** `@ownui/tw-theme` y `pnpm release`
publicaba **sólo** ese paquete, mientras el README anuncia 6 y su guía de instalación manda
hacer `npm install @ownui/ui @ownui/tw-theme`. Los otros cinco paquetes podían llegar al
registro sin `dist/`.

## Arreglado

- **`@ownui/ui` declara las dependencias internas que ya importaba.** `@ownui/button`,
  `@ownui/dropdown`, `@ownui/loader` y `@ownui/dom-utils` entran como `workspace:*`. No es
  cosmético: el orden topológico de Turborepo (`dependsOn: ["^build"]`) se deriva del grafo
  **declarado**, así que sin esto no había garantía de que `@ownui/loader` estuviera
  construido antes que `@ownui/ui`.
- **`@ownui/dropdown`: `"main"` apuntaba a `.src/index.ts`** (typo con punto inicial, hacia la
  fuente) y ahora apunta a `dist/index.js`.
- **`@ownui/dropdown` ya no publica sus stories.** Construía con `tsup src --dts` (entrada =
  directorio), lo que metía `Dropdown.stories.tsx` en el paquete (~37 KB) y rompía el build de
  tipos. Ahora usa `entry: ["src/index.ts"]` como el resto de los componentes, así que el
  tarball baja a un único bundle por formato.
- **`@ownui/dom-utils` pasa de `ISC` a `MIT`**, la licencia del resto del monorepo. Es un
  cambio de metadatos del paquete, sin efecto en el código.

Sin cambios de API en ninguno de los tres paquetes.
