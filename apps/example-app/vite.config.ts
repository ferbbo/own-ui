import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Configuración mínima a propósito.
 *
 * La app existe para comprobar el **consumo real** de los paquetes: no declara
 * alias al fuente de los paquetes, así que `@ownui/ui` y `@ownui/tw-theme` resuelven
 * por el symlink de pnpm a lo que cada paquete publica en `exports` — su
 * `dist/`. Si un paquete deja de publicar algo (el bug raíz del lote 1: el CSS
 * de componentes nunca llegaba al bundle), esta app se rompe.
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
