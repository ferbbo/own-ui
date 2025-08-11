    import { defineConfig } from 'tsup';

    export default defineConfig({
      entry: ['src/index.ts'], // Specify your entry point(s)
      format: ['cjs', 'esm'], // Specify the output format(s)
      splitting: false, // Disable code splitting if not needed
      sourcemap: true, // Generate sourcemaps for debugging
      clean: true, // Clean the output directory before each build
      // Add other options as required, such as format, target, dts, etc.
    });