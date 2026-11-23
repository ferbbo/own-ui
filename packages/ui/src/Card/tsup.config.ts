import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  // Compatibilidad con RSC / Next: el banner va en todos los paquetes.
  banner: { js: '"use client";' },
  dts: true,
  minify: true,
  external: ["react", "react-dom"],
});
