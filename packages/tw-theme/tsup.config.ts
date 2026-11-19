import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

const here = dirname(fileURLToPath(import.meta.url));
const cssSrc = resolve(here, "src/css");
const cssOut = resolve(here, "dist/css");

/**
 * Copia el CSS de componentes a `dist/css`.
 *
 * tsup no procesa CSS: sin esta copia los archivos de `src/css` no llegan al
 * tarball (`files: ["dist"]`) y las clases `.btn`, `.dropdown` y `.loader`
 * quedan sin definir en el paquete publicado — el bug raiz del repo
 * (`AGENTS.md` §9.1). Se usa `node:fs` en vez de `cp -R` para no depender de
 * un shell POSIX ni anadir una dependencia de copia.
 */
const copyComponentCss = () => {
  if (!existsSync(cssSrc)) {
    throw new Error(`[tw-theme] No existe ${cssSrc}: no hay CSS de componentes que publicar`);
  }
  rmSync(cssOut, { recursive: true, force: true });
  cpSync(cssSrc, cssOut, { recursive: true });
};

export default defineConfig({
  entry: ["src/index.ts", "src/theme.ts", "src/variants/*.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  skipNodeModulesBundle: true, // no empacar Oxide
  external: ["tailwindcss", "@tailwindcss/oxide"],
  onSuccess: async () => {
    copyComponentCss();
  },
});
