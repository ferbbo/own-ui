import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import button from "../button.js";
import loader from "../loader.js";

/**
 * "El contrato manda" (`@docs/BUILD-BATCHES.md`): toda clase declarada en
 * `variants/<name>.ts` tiene que existir como selector en `css/<name>.css`.
 *
 * Hasta el lote 5 nada verificaba esa regla, y por eso convivieron
 * `variant.solid` (sin `.btn-solid` en el CSS) y `.btn-square`/`.btn-wide`
 * (en el CSS, sin entrada en el contrato). Este test es la red: si alguien
 * añade una prop sin su CSS, o borra una clase que el contrato promete,
 * falla aqui y no en silencio en el navegador del consumidor.
 *
 * El contrato de `dropdown` queda fuera a proposito: hoy declara clases que
 * `dropdown.css` no define (`AGENTS.md` §9.7) y repararlo es el lote 6.
 */

/**
 * Directorio del CSS de componente. Misma resolucion que
 * `src/__tests__/surfaces.test.ts`: desde `process.cwd()` y no con
 * `__dirname` ni `import.meta.url`, porque el proyecto declara el preset ESM
 * pero ts-jest acaba emitiendo CJS. Las dos rutas cubren los dos sitios desde
 * los que se lanza la suite (raiz del monorepo y raiz del paquete).
 */
const CSS_DIR = [
  join(process.cwd(), "packages", "tw-theme", "src", "css"),
  join(process.cwd(), "src", "css"),
].find((candidate) => existsSync(candidate)) as string;

/** Extrae los selectores de clase de un archivo CSS, incluidos los de `:where()`. */
function cssClassNames(file: string): Set<string> {
  const css = readFileSync(join(CSS_DIR, file), "utf8");
  const names = new Set<string>();
  // `.foo`, `.foo:hover`, `.foo-bar` — tambien dentro de :where()/:not().
  for (const match of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
    names.add(match[1]);
  }
  return names;
}

/** Aplana `{ theme: { primary: "btn-primary" } }` a `["theme.primary", "btn-primary"]`. */
function contractEntries(
  contract: Record<string, Record<string, string>>
): Array<[string, string]> {
  return Object.entries(contract).flatMap(([group, map]) =>
    Object.entries(map).map(([key, cls]): [string, string] => [`${group}.${key}`, cls])
  );
}

describe("contrato de clases de los componentes", () => {
  describe("button", () => {
    const classNames = cssClassNames("button.css");
    const entries = contractEntries(button);

    test("el CSS declara la clase base .btn", () => {
      expect(classNames.has("btn")).toBe(true);
    });

    test.each(entries)("%s -> .%s existe en button.css", (_path, cls) => {
      expect(classNames.has(cls)).toBe(true);
    });

    test("no quedan clases del contrato sin CSS", () => {
      const missing = entries.filter(([, cls]) => !classNames.has(cls)).map(([path]) => path);

      expect(missing).toEqual([]);
    });

    test("`solid` no es un tratamiento: no existe .btn-solid", () => {
      // Era la entrada que rompia el contrato antes del lote 5.
      expect(classNames.has("btn-solid")).toBe(false);
      expect(button.variant).not.toHaveProperty("solid");
    });

    test("`ghost` es un rol, no un tratamiento (no esta duplicado)", () => {
      expect(button.theme).toHaveProperty("ghost");
      expect(button.variant).not.toHaveProperty("ghost");
    });

    test("los modificadores de layout del CSS estan expuestos en el contrato", () => {
      const exposed = entries.map(([, cls]) => cls);

      expect(exposed).toEqual(
        expect.arrayContaining(["btn-square", "btn-circle", "btn-wide", "btn-block", "btn-active"])
      );
    });
  });

  describe("loader", () => {
    const classNames = cssClassNames("loader.css");
    const entries = contractEntries(loader);

    test("el CSS declara la clase base .loader y su spinner", () => {
      expect(classNames.has("loader")).toBe(true);
      expect(classNames.has("loader-spinner")).toBe(true);
    });

    test.each(entries)("%s -> .%s existe en loader.css", (_path, cls) => {
      expect(classNames.has(cls)).toBe(true);
    });

    test("no quedan clases del contrato sin CSS", () => {
      const missing = entries.filter(([, cls]) => !classNames.has(cls)).map(([path]) => path);

      expect(missing).toEqual([]);
    });

    test("`current` hereda el color del contexto, no un token semantico", () => {
      // Es la clase que permite al spinner del Button contrastar con cualquier
      // rol: sin ella habria que mapear rol de boton -> color de loader.
      const css = readFileSync(join(CSS_DIR, "loader.css"), "utf8");

      expect(loader.color.current).toBe("loader-current");
      expect(css).toMatch(/\.loader-current\s*\{\s*--loader-color:\s*currentColor;/);
    });
  });
});
