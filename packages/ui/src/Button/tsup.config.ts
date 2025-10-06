import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  // target: "es2019",
  format: ["cjs", "esm"],
  banner: { js: '"use client";' },
  dts: true,
  minify: true,
  external: ["react", "react-dom"],
});
