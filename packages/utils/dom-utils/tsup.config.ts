    import { defineConfig } from 'tsup';

    export default defineConfig({
      entry: ['src/index.ts'], // Specify your entry point(s)
      format: ['cjs', 'esm'], // Specify the output format(s)
      dts: true,
      splitting: false, 
      sourcemap: true,
      clean: true,
      minify: false,
    });