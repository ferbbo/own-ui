import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import button from "../variants/button.js";
import dropdown from "../variants/dropdown.js";

/**
 * Test de contrato del Dropdown (lote 6).
 *
 * Convierte en gate automático la regla de oro del repo ("el contrato manda",
 * `@docs/BUILD-BATCHES.md`): las tres capas — los literales que emiten los
 * hooks de `useDropdown.tsx`, el contrato de `variants/dropdown.ts` y los
 * selectores de `css/dropdown.css` — tienen que decir exactamente lo mismo.
 *
 * Es el test que habría impedido la deuda de `AGENTS.md` §9.7: los hooks
 * emitían `dropdown-trigger`, `dropdown-menu`, `dropdown-open` y las ocho
 * variantes semánticas mientras el CSS sólo definía cuatro variantes y ningún
 * selector de trigger ni de menú.
 *
 * El criterio **no** se comprueba contra una lista escrita a mano: las clases
 * se extraen del hook real (literales y plantillas `dropdown-${variant}`
 * expandidas con las uniones de `Dropdown.types.ts`), así que si mañana
 * alguien añade una variante al tipo o una clase al hook, este test falla sin
 * que haya que acordarse de actualizarlo.
 */

/**
 * Las rutas se resuelven desde `process.cwd()` y no con `import.meta.url` ni
 * `__dirname`: el proyecto `tw-theme` de Jest declara el preset ESM pero
 * ts-jest acaba emitiendo CJS, así que `import.meta` revienta en ejecución.
 * Mismo criterio que `src/__tests__/surfaces.test.ts` (lote 4).
 */
const resolveFirst = (...candidates: string[]): string | undefined =>
  candidates.find((candidate) => existsSync(candidate));

const cssFile = (name: string): string | undefined =>
  resolveFirst(
    join(process.cwd(), "packages", "tw-theme", "src", "css", name),
    join(process.cwd(), "src", "css", name)
  );

const CSS_FILE = cssFile("dropdown.css");

/** El trigger se pinta con `button.css` desde el lote 6 (D-08). */
const BUTTON_CSS_FILE = cssFile("button.css");

/** El Dropdown de React vive en otro paquete: `@ownui/dropdown`. */
const DROPDOWN_SRC = resolveFirst(
  join(process.cwd(), "packages", "ui", "src", "Dropdown", "src"),
  join(process.cwd(), "..", "ui", "src", "Dropdown", "src")
);

const read = (file: string): string => readFileSync(file, "utf8");

/** Aplana el contrato de `variants/dropdown.ts` a la lista de clases. */
const flattenContract = (node: unknown): string[] => {
  if (typeof node === "string") return [node];
  if (node && typeof node === "object") {
    return Object.values(node as Record<string, unknown>).flatMap(flattenContract);
  }
  return [];
};

/**
 * Selectores de clase presentes en `dropdown.css`.
 *
 * Basta con la presencia del selector: que la regla pinte lo que debe es
 * trabajo de los specs e2e (`e2e/tests/dropdown.spec.ts`), que miden estilos
 * computados en Chromium. Aquí sólo se verifica que ninguna clase emitida se
 * quede sin CSS detrás.
 */
const selectorsIn = (file: string | undefined, prefix: string): Set<string> => {
  // Los comentarios se quitan antes de buscar: la cabecera del archivo cita
  // clases de ejemplo (`.dropdown-x, .dropdown-menu-x`) que no son selectores.
  const contents = file ? read(file).replace(/\/\*[\s\S]*?\*\//g, "") : "";
  const matches = contents.match(new RegExp(`\\.(${prefix}[a-z0-9-]*)`, "g")) ?? [];

  return new Set(matches.map((match) => match.slice(1)));
};

const cssSelectors = (): Set<string> => selectorsIn(CSS_FILE, "dropdown");

/** Miembros de una unión de literales de `Dropdown.types.ts`. */
const typeUnion = (types: string, name: string): string[] => {
  const declaration = new RegExp(`export type ${name}\\s*=([^;]+);`).exec(types);
  if (!declaration) return [];

  return [...declaration[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
};

/**
 * Clases que los hooks pueden emitir.
 *
 * Dos fuentes en `useDropdown.tsx`: los literales entre comillas
 * (`"dropdown-trigger"`) y las plantillas (`` `dropdown-${variant}` ``), que
 * se expanden con el dominio real de la prop según `Dropdown.types.ts`.
 */
const emittedClasses = (): { classes: Set<string>; templates: number } => {
  if (!DROPDOWN_SRC) return { classes: new Set(), templates: 0 };

  const hook = read(join(DROPDOWN_SRC, "useDropdown.tsx"));
  const types = read(join(DROPDOWN_SRC, "Dropdown.types.ts"));

  const domains: Record<string, string[]> = {
    variant: typeUnion(types, "DropdownVariant"),
    size: typeUnion(types, "DropdownSize"),
    styleVariant: typeUnion(types, "DropdownStyleVariant"),
  };

  const classes = new Set<string>();

  // 1) Literales: "dropdown", "dropdown-trigger-active", "dropdown-item"...
  for (const [, literal] of hook.matchAll(/"(dropdown[a-z0-9-]*)"/g)) {
    classes.add(literal);
  }

  // 2) Plantillas: `dropdown-${variant}`, `dropdown-menu-${size}`...
  let templates = 0;
  for (const [, prefix, prop] of hook.matchAll(/`(dropdown(?:-menu)?)-\$\{(\w+)\}`/g)) {
    templates += 1;
    const domain = domains[prop] ?? [];
    expect(domain.length).toBeGreaterThan(0);
    domain.forEach((value) => classes.add(`${prefix}-${value}`));
  }

  return { classes, templates };
};

describe("Contrato de clases del Dropdown", () => {
  it("encuentra los archivos del contrato", () => {
    expect(CSS_FILE).toBeDefined();
    expect(BUTTON_CSS_FILE).toBeDefined();
    expect(DROPDOWN_SRC).toBeDefined();
  });

  describe("AC2: ninguna clase emitida por los hooks carece de selector", () => {
    it("extrae clases de plantilla del hook (si no, el test no prueba nada)", () => {
      const { templates, classes } = emittedClasses();

      // 6 plantillas: variante/tamaño/estilo en el wrapper y en el menú.
      expect(templates).toBe(6);
      expect(classes.size).toBeGreaterThanOrEqual(38);
    });

    it("todas existen en dropdown.css", () => {
      const selectors = cssSelectors();
      const missing = [...emittedClasses().classes].filter((cls) => !selectors.has(cls));

      expect(missing).toEqual([]);
    });

    it("todas están declaradas en variants/dropdown.ts", () => {
      const declared = new Set(flattenContract(dropdown));
      const missing = [...emittedClasses().classes].filter((cls) => !declared.has(cls));

      expect(missing).toEqual([]);
    });
  });

  describe("El contrato declarado no promete clases inexistentes", () => {
    it("cada clase de variants/dropdown.ts tiene selector en dropdown.css", () => {
      const selectors = cssSelectors();
      const missing = flattenContract(dropdown).filter((cls) => !selectors.has(cls));

      // Era el estado anterior al lote 6: el contrato declaraba
      // dropdown-outline / dropdown-solid / dropdown-link, que no existían.
      expect(missing).toEqual([]);
    });

    it("el CSS no define clases que el contrato no declare (CSS muerto)", () => {
      const declared = new Set(flattenContract(dropdown));
      const orphans = [...cssSelectors()].filter((cls) => !declared.has(cls));

      expect(orphans).toEqual([]);
    });
  });

  describe("AC3: las 8 variantes semánticas están en los dos niveles", () => {
    it("el contrato declara las 8 en wrapper y en panel", () => {
      const roles = [
        "primary",
        "secondary",
        "accent",
        "neutral",
        "info",
        "success",
        "warning",
        "error",
      ];

      expect(Object.keys(dropdown.theme)).toEqual(roles);
      expect(Object.keys(dropdown.menu.theme)).toEqual(roles);
    });

    it("cada rol apunta a un token semántico distinto en el CSS", () => {
      const contents = CSS_FILE ? read(CSS_FILE) : "";

      Object.entries(dropdown.theme).forEach(([role, cls]) => {
        const block = new RegExp(
          `\\.${cls},\\s*\\.${dropdown.menu.theme[role as "primary"]}\\s*\\{([^}]+)\\}`
        );
        const match = block.exec(contents);

        expect(match).not.toBeNull();
        expect(match?.[1]).toContain(`var(--color-${role})`);
        expect(match?.[1]).toContain(`var(--color-${role}-content)`);
        expect(match?.[1]).toContain(`var(--color-${role}-focus)`);
      });
    });
  });

  describe("D-08: el trigger compone clases de `.btn`", () => {
    /**
     * El trigger dejó de tener superficie propia en `dropdown.css` y ahora
     * emite `btn btn-{rol} btn-{tamaño}`. Eso convierte el contrato en
     * **cruzado**: si alguien retira un rol o un tamaño de `button.css` o de
     * `variants/button.ts`, el trigger del Dropdown se queda sin estilo sin
     * que nada en `dropdown.css` cambie. Este bloque es el que lo caza.
     */
    const triggerButtonClasses = (): string[] => {
      const types = DROPDOWN_SRC ? read(join(DROPDOWN_SRC, "Dropdown.types.ts")) : "";
      const roles = typeUnion(types, "DropdownVariant");
      const sizes = typeUnion(types, "DropdownSize");

      return [
        "btn",
        ...roles.map((role) => button.theme[role as keyof typeof button.theme]),
        ...sizes.map((size) => button.size[size as keyof typeof button.size]),
      ];
    };

    it("el hook emite `btn` y lee los mapas del contrato de button", () => {
      const hook = DROPDOWN_SRC ? read(join(DROPDOWN_SRC, "useDropdown.tsx")) : "";

      expect(hook).toContain('"btn"');
      expect(hook).toContain("button.theme[variant]");
      expect(hook).toContain("button.size[size]");
    });

    it("cada rol y tamaño del Dropdown existe en el contrato de button", () => {
      const missing = triggerButtonClasses().filter((cls) => !cls);

      expect(missing).toEqual([]);
    });

    it("todas esas clases tienen selector en button.css", () => {
      const selectors = selectorsIn(BUTTON_CSS_FILE, "btn");
      const missing = triggerButtonClasses().filter((cls) => !selectors.has(cls));

      expect(missing).toEqual([]);
    });

    it("dropdown.css ya no reimplementa la superficie del trigger", () => {
      const contents = CSS_FILE ? read(CSS_FILE) : "";

      // Si vuelven los tokens propios del trigger es que se duplicó `.btn`.
      expect(contents).not.toContain("--dropdown-trigger-bg");
      expect(contents).not.toContain("--dropdown-trigger-size");
    });
  });

  describe("D-09: el rol es acento, no superficie", () => {
    it("ninguna variante redefine la superficie del panel", () => {
      const contents = CSS_FILE ? read(CSS_FILE).replace(/\/\*[\s\S]*?\*\//g, "") : "";

      Object.entries(dropdown.theme).forEach(([role, cls]) => {
        const block = new RegExp(
          `\\.${cls},\\s*\\.${dropdown.menu.theme[role as "primary"]}\\s*\\{([^}]+)\\}`
        );
        const body = block.exec(contents)?.[1] ?? "";

        expect(body).toContain("--dropdown-role:");
        // La superficie (`--dropdown-color`) tiene que quedarse neutra.
        expect(body).not.toContain("--dropdown-color:");
      });
    });

    it("el item activo consume el acento con caída a realce neutro", () => {
      const contents = CSS_FILE ? read(CSS_FILE) : "";
      const block = /\.dropdown-item-selected \{([^@]+?)\n\}/.exec(contents);

      expect(block).not.toBeNull();
      expect(block?.[1]).toContain("var(\n    --dropdown-role,");
      expect(block?.[1]).toContain("--dropdown-role-content");
    });
  });

  describe("AC4: la transición se anula con prefers-reduced-motion", () => {
    it("dropdown.css trae el bloque de movimiento reducido", () => {
      const contents = CSS_FILE ? read(CSS_FILE) : "";
      const block = /@media \(prefers-reduced-motion: reduce\) \{([^}]+)\}/.exec(contents);

      expect(block).not.toBeNull();
      expect(block?.[1]).toContain("transition: none");
    });
  });
});
