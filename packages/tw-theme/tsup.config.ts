import { defineConfig } from "tsup";

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
});
