import tailwindThemePlugin from "../theme.js";
import { CssStyles, PluginOptions } from "../types.js";

/**
 * Tests del plugin de temas custom (`@ownui/tw-theme/theme`).
 *
 * El parseo de `name` ("<nombre> [--flag]") no se exporta, asi que se verifica a
 * traves del comportamiento observable del plugin: que selectores recibe `addBase`.
 * Eso es lo que acaba en el CSS compilado, y es lo que el bug de `getThemeNameConfig`
 * rompia (todo tema custom se registraba como `--default` y `--prefersdark` se ignoraba).
 */

/** Invoca el plugin con unas opciones y devuelve el objeto que recibio `addBase`. */
const runPlugin = (options: PluginOptions): CssStyles => {
  const captured: CssStyles[] = [];
  const { handler } = tailwindThemePlugin(options) as unknown as {
    handler: (api: { addBase: (styles: CssStyles) => void }) => void;
  };

  handler({ addBase: (styles) => captured.push(styles) });

  expect(captured).toHaveLength(1);
  return captured[0];
};

const PREFERS_DARK_QUERY = "@media (prefers-color-scheme: dark)";

describe("plugin de tema custom", () => {
  describe("flag --prefersdark", () => {
    it("registra el tema dentro de @media (prefers-color-scheme: dark)", () => {
      const styles = runPlugin({
        name: "midnight --prefersdark",
        "--color-primary": "#111111",
      });

      expect(Object.keys(styles)).toContain(PREFERS_DARK_QUERY);
      expect(styles[PREFERS_DARK_QUERY]).toEqual({
        ":root": { "--color-primary": "#111111" },
      });
    });

    it("tambien registra el selector [data-theme] para activacion manual", () => {
      const styles = runPlugin({
        name: "midnight --prefersdark",
        "--color-primary": "#111111",
      });

      expect(styles['[data-theme="midnight"]']).toEqual({
        "--color-primary": "#111111",
      });
    });

    it("no pinta la raiz fuera de la media query", () => {
      const styles = runPlugin({
        name: "midnight --prefersdark",
        "--color-primary": "#111111",
      });

      expect(Object.keys(styles)).not.toContain(':where(:root),[data-theme="midnight"]');
    });

    it("tolera espacios de mas entre el nombre y el flag", () => {
      const styles = runPlugin({
        name: "midnight   --prefersdark",
        "--color-primary": "#111111",
      });

      expect(Object.keys(styles)).toContain(PREFERS_DARK_QUERY);
    });
  });

  describe("flag --default y ausencia de flag", () => {
    it("con --default aplica a la raiz y al selector [data-theme]", () => {
      const styles = runPlugin({
        name: "brand --default",
        "--color-primary": "#7c3aed",
      });

      expect(styles[':where(:root),[data-theme="brand"]']).toEqual({
        "--color-primary": "#7c3aed",
      });
      expect(Object.keys(styles)).not.toContain(PREFERS_DARK_QUERY);
    });

    it("sin flag se comporta como --default", () => {
      const styles = runPlugin({
        name: "brand",
        "--color-primary": "#7c3aed",
      });

      expect(styles[':where(:root),[data-theme="brand"]']).toEqual({
        "--color-primary": "#7c3aed",
      });
    });

    it("respeta un `root` personalizado", () => {
      const styles = runPlugin({
        name: "brand --default",
        root: "#app",
        "--color-primary": "#7c3aed",
      });

      expect(styles[':where(#app),[data-theme="brand"]']).toEqual({
        "--color-primary": "#7c3aed",
      });
    });
  });

  describe("configuraciones invalidas", () => {
    it("aborta si el flag es desconocido, en vez de degradarse a --default", () => {
      expect(() => runPlugin({ name: "brand --bogus", "--color-primary": "#7c3aed" })).toThrow(
        "Invalid theme name configuration"
      );
    });

    it("aborta si no hay nombre de tema", () => {
      expect(() => runPlugin({ "--color-primary": "#7c3aed" })).toThrow(
        "Invalid theme name configuration"
      );
    });
  });

  describe("extraccion de variables", () => {
    it("solo recoge las claves que empiezan por -- y tienen valor string", () => {
      const styles = runPlugin({
        name: "brand --default",
        "--color-primary": "#7c3aed",
        "--color-primary-focus": "#6d28d9",
        "--color-primary-content": "#ffffff",
      });

      expect(styles[':where(:root),[data-theme="brand"]']).toEqual({
        "--color-primary": "#7c3aed",
        "--color-primary-focus": "#6d28d9",
        "--color-primary-content": "#ffffff",
      });
    });
  });
});
