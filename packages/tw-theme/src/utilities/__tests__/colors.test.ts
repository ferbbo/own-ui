import {
  generateColorUtilities,
  generateSurfaceUtilities,
  semanticColorNames,
  semanticColorVariants,
  surfaceColorNames,
} from "../colors.js";

/**
 * Tests de las utilidades generadas (`src/utilities/colors.ts`).
 *
 * Lo que se verifica aqui es el **contrato de clases**: que el generador emita
 * exactamente las clases que el sistema promete, que cada una apunte a un token
 * `var(--color-*)` y, sobre todo, que **no** emita clases para tokens que ningun
 * tema define. Esa ultima parte es la que importa: la deuda que arrastraba el
 * repo (40 utilidades `*-focus` apuntando al vacio en la rama `components`, y
 * `--color-base-100` referenciado sin existir) siempre fue del mismo tipo.
 */

/** Prefijos que emiten los colores semanticos. */
const SEMANTIC_PREFIXES = ["bg", "text", "border", "ring", "divide"] as const;

/** Prefijos que emiten las superficies: los mismos menos `ring` (ver D-04). */
const SURFACE_PREFIXES = ["bg", "text", "border", "divide"] as const;

describe("generateSurfaceUtilities", () => {
  const utilities = generateSurfaceUtilities();

  it("emite 4 tokens x 4 prefijos = 16 clases, y ni una mas", () => {
    expect(Object.keys(utilities)).toHaveLength(surfaceColorNames.length * SURFACE_PREFIXES.length);
    expect(Object.keys(utilities)).toHaveLength(16);
  });

  it("emite exactamente el conjunto de clases esperado", () => {
    const expected = surfaceColorNames
      .flatMap((token) => SURFACE_PREFIXES.map((prefix) => `.${prefix}-${token}`))
      .sort();

    expect(Object.keys(utilities).sort()).toEqual(expected);
  });

  it.each(surfaceColorNames)("%s apunta a su token var(--color-...) en los 4 prefijos", (token) => {
    const ref = `var(--color-${token})`;

    expect(utilities[`.bg-${token}`]).toEqual({ "background-color": ref });
    expect(utilities[`.text-${token}`]).toEqual({ color: ref });
    expect(utilities[`.border-${token}`]).toEqual({ "border-color": ref });
    expect(utilities[`.divide-${token}`]).toEqual({ "--tw-divide-color": ref });
  });

  it("NO emite prefijo ring para las superficies", () => {
    const ringClasses = Object.keys(utilities).filter((name) => name.startsWith(".ring-"));

    expect(ringClasses).toEqual([]);
  });

  it("NO emite variantes -content ni -focus sobre las superficies numeradas", () => {
    // `.bg-base-100-content` o `.border-base-300-focus` serian clases validas en
    // CSS apuntando a tokens inexistentes: el defecto que este lote evita.
    const bogus = Object.keys(utilities).filter((name) =>
      /base-(100|200|300)-(content|focus)$/.test(name)
    );

    expect(bogus).toEqual([]);
  });

  it("no referencia ningun token con doble prefijo --color-color-", () => {
    const declarations = Object.values(utilities).flatMap((decl) => Object.values(decl));

    declarations.forEach((value) => {
      expect(value).toMatch(/^var\(--color-[a-z0-9-]+\)$/);
      expect(value).not.toContain("--color-color-");
    });
  });
});

describe("generateColorUtilities", () => {
  const utilities = generateColorUtilities();

  it("incluye las 120 utilidades semanticas y las 16 de superficie", () => {
    const semanticCount =
      semanticColorNames.length * semanticColorVariants.length * SEMANTIC_PREFIXES.length;

    expect(semanticCount).toBe(120);
    expect(Object.keys(utilities)).toHaveLength(semanticCount + 16);
  });

  it("las clases de superficie llegan al objeto que recibe addUtilities()", () => {
    // El plugin hace una sola llamada a addUtilities(generateColorUtilities()),
    // asi que si las superficies no estan en este objeto no existen en el CSS.
    expect(utilities[".bg-base-100"]).toEqual({
      "background-color": "var(--color-base-100)",
    });
    expect(utilities[".text-base-content"]).toEqual({ color: "var(--color-base-content)" });
  });

  it("no pierde ninguna utilidad semantica al mezclar las de superficie", () => {
    expect(utilities[".bg-primary"]).toEqual({ "background-color": "var(--color-primary)" });
    expect(utilities[".ring-error"]).toEqual({ "--tw-ring-color": "var(--color-error)" });
    expect(utilities[".text-primary-content"]).toEqual({
      color: "var(--color-primary-content)",
    });
  });

  it("ninguna clase semantica y de superficie colisiona por nombre", () => {
    const surfaceNames = Object.keys(generateSurfaceUtilities());
    const total = Object.keys(utilities).length;

    // Si hubiera colision, el total seria menor que la suma de las partes.
    expect(total).toBe(120 + surfaceNames.length);
  });
});
