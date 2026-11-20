import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { builtInThemes, darkTheme, lightTheme } from "../themes/index.js";
import { surfaceColorNames } from "../utilities/colors.js";
import { ThemeColors } from "../types.js";

/**
 * Tests de contrato de la escala de superficies (lote 4).
 *
 * El primer bloque es el que convierte en gate automatico la regla de oro del
 * repo ("el contrato manda"): **todo token `--color-base-*` que el CSS de
 * componente referencie tiene que existir en los dos temas built-in.** Es el
 * test que habria impedido el bug de `--color-base-100`, que estuvo
 * referenciado tres veces en `dropdown.css` sin existir en ningun tema, con el
 * fondo del dropdown sin resolver a `transparent`.
 *
 * El criterio no se comprueba leyendo una lista escrita a mano, sino
 * **extrayendo las referencias del CSS real**: si manana alguien escribe
 * `var(--color-base-400)` en un componente, este test falla sin que haya que
 * acordarse de actualizarlo.
 */

/**
 * Directorio del CSS de componente.
 *
 * Se resuelve desde `process.cwd()` y no con `import.meta.url` ni `__dirname`:
 * el proyecto `tw-theme` de Jest declara el preset ESM, pero ts-jest acaba
 * emitiendo CJS, asi que `import.meta` revienta en tiempo de ejecucion. Las dos
 * rutas candidatas cubren los dos sitios desde los que se lanza la suite:
 * `pnpm test` en la raiz del monorepo y `pnpm test` dentro del paquete.
 */
const CSS_DIR = [
  join(process.cwd(), "packages", "tw-theme", "src", "css"),
  join(process.cwd(), "src", "css"),
].find((candidate) => existsSync(candidate));

/** Todas las referencias `--color-base-*` que aparecen en `src/css/*.css`. */
const collectCssSurfaceReferences = (): Map<string, string[]> => {
  const byToken = new Map<string, string[]>();

  if (!CSS_DIR) return byToken;

  readdirSync(CSS_DIR)
    .filter((file) => file.endsWith(".css"))
    .forEach((file) => {
      const contents = readFileSync(join(CSS_DIR, file), "utf8");
      const matches = contents.match(/--color-base-[a-z0-9-]+/g) ?? [];

      new Set(matches).forEach((token) => {
        byToken.set(token, [...(byToken.get(token) ?? []), file]);
      });
    });

  return byToken;
};

// ─── Contraste WCAG 2.1 ──────────────────────────────────────────────────────
// Duplicado a proposito respecto a `scripts/check-contrast.mjs`, que audita las
// 8 familias semanticas pero no las superficies y es entregable del lote 22.
// Ver specs/lote-4.md D-09 y G-02.

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? [...h].map((c) => c + c).join("") : h;

  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
};

/** Luminancia relativa segun WCAG 2.1. */
const relativeLuminance = (hex: string): number => {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.03928 ? srgb / 12.92 : Math.pow((srgb + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrastRatio = (a: string, b: string): number => {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [lighter, darker] = la >= lb ? [la, lb] : [lb, la];

  return (lighter + 0.05) / (darker + 0.05);
};

/** Umbral de texto normal de WCAG 2.1 AA. */
const AA_NORMAL_TEXT = 4.5;

const THEMES: Array<[string, ThemeColors]> = [
  ["light", lightTheme],
  ["dark", darkTheme],
];

/** Las 3 superficies, sin `base-content` (que es el color de texto). */
const SURFACES = ["base-100", "base-200", "base-300"] as const;

describe("escala de superficies: contrato con el CSS de componente", () => {
  const referenced = collectCssSurfaceReferences();

  it("el CSS de componente referencia al menos un token de superficie", () => {
    // Guarda contra un falso verde: si la ruta no resolviera o el regex dejara
    // de encontrar nada, los it.each de abajo no generarian ningun caso y la
    // suite pasaria vacia.
    expect(CSS_DIR).toBeDefined();
    expect(referenced.size).toBeGreaterThan(0);
  });

  it.each([...referenced.entries()])(
    "%s (usado en %s) existe en los dos temas built-in",
    (token, files) => {
      expect(files.length).toBeGreaterThan(0);
      expect(lightTheme[token]).toBeDefined();
      expect(darkTheme[token]).toBeDefined();
    }
  );

  it("ningun token de superficie quedo en el tema root (seria global y ganaria al tema)", () => {
    // `root` se inyecta en `:root` (especificidad 0,1,0) y el tema por defecto
    // en `:where(:root)` (0,0,0): un color de superficie que sobreviviera en
    // `root` venceria al del tema y reintroduciria el bug.
    const colorTokensInRoot = Object.keys(builtInThemes.root).filter((token) =>
      token.startsWith("--color-")
    );

    expect(colorTokensInRoot).toEqual([]);
  });

  it.each(surfaceColorNames)("--color-%s esta definido en light y en dark", (name) => {
    expect(lightTheme[`--color-${name}`]).toMatch(/^#[0-9a-f]{6}$/i);
    expect(darkTheme[`--color-${name}`]).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe("escala de superficies: legibilidad (AC4)", () => {
  describe.each(THEMES)("tema %s", (themeName, theme) => {
    it.each(SURFACES)(`%s contra base-content pasa WCAG AA (>= ${AA_NORMAL_TEXT}:1)`, (surface) => {
      const ratio = contrastRatio(theme[`--color-${surface}`], theme["--color-base-content"]);

      expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
    });

    it("la escala va de la superficie mas clara a la mas oscura (100 -> 300)", () => {
      // Invariante del sistema, no una inversion entre temas: tambien en dark
      // base-100 es la superficie principal y base-300 la mas hundida.
      const [l100, l200, l300] = SURFACES.map((s) => relativeLuminance(theme[`--color-${s}`]));

      expect(l100).toBeGreaterThan(l200);
      expect(l200).toBeGreaterThan(l300);
    });

    it(`el par superficie/texto de ${themeName} esta orientado como el tema`, () => {
      const surfaceLuminance = relativeLuminance(theme["--color-base-200"]);
      const contentLuminance = relativeLuminance(theme["--color-base-content"]);

      if (themeName === "light") {
        // AC4 literal: "fondo claro + texto oscuro en light".
        expect(surfaceLuminance).toBeGreaterThan(contentLuminance);
      } else {
        expect(surfaceLuminance).toBeLessThan(contentLuminance);
      }
    });
  });

  it("las superficies cambian de verdad entre light y dark", () => {
    // El bug original era precisamente que no cambiaban: eran globales.
    surfaceColorNames.forEach((name) => {
      expect(lightTheme[`--color-${name}`]).not.toBe(darkTheme[`--color-${name}`]);
    });
  });
});
