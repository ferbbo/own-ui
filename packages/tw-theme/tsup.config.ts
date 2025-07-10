import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: false,
  minify: false,
  skipNodeModulesBundle: true,       // no empacar Oxide
  external: ['tailwindcss', '@tailwindcss/oxide'] 
});
