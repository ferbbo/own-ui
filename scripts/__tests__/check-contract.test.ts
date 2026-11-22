import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Tests de `scripts/check-contract.mjs` (lote 8).
 *
 * El checker es el gate de la regla de oro del repo, así que tiene que cumplir
 * dos cosas opuestas: estar en verde sobre el árbol real y ponerse en rojo en
 * cuanto alguien reintroduce un desajuste. Lo segundo se prueba de verdad —
 * copiando las tres capas a un árbol temporal y rompiéndolo— y no leyendo el
 * código del script: es el criterio AC2 del lote
 * ("detecta los desajustes conocidos de L5 y L6 si se reintroducen").
 *
 * Se invoca el CLI con `execFileSync` en vez de importar el módulo: así se
 * verifica también el código de salida, que es lo que convierte al script en
 * puerta de CI, y no hace falta que Jest cargue un `.mjs`.
 */

/** Jest corre desde la raíz del monorepo (`rootDir` de `jest.config.js`). */
const ROOT = process.cwd();
const SCRIPT = join(ROOT, "scripts", "check-contract.mjs");

const PATHS = {
  cssDir: join("packages", "tw-theme", "src", "css"),
  variantsDir: join("packages", "tw-theme", "src", "variants"),
  uiDir: join("packages", "ui", "src"),
};

interface Finding {
  component: string;
  rule: string;
  message: string;
  detail?: string;
}

interface Result {
  report: Array<{ component: string; prefix: string; contrato: number; emitidas: number }>;
  errors: Finding[];
  warnings: Finding[];
  status: number;
}

/** Ejecuta el checker y devuelve su JSON + el código de salida. */
function run(args: string[] = []): Result {
  let status = 0;
  let stdout = "";

  try {
    stdout = execFileSync("node", [SCRIPT, "--json", ...args], { encoding: "utf8" });
  } catch (error) {
    const failure = error as { status?: number; stdout?: string };
    status = failure.status ?? 1;
    stdout = failure.stdout ?? "";
  }

  return { ...JSON.parse(stdout), status };
}

/**
 * Copia a un directorio temporal las tres capas que el checker lee, para poder
 * romperlas sin tocar el repo. Se excluyen `node_modules` (son enlaces de pnpm)
 * y `dist`.
 */
function sandbox(): string {
  const dir = mkdtempSync(join(tmpdir(), "ownui-contract-"));

  for (const relative of Object.values(PATHS)) {
    cpSync(join(ROOT, relative), join(dir, relative), {
      recursive: true,
      filter: (source) => !/(node_modules|dist|\.turbo)/.test(source),
    });
  }

  return dir;
}

/** Reescribe un archivo del sandbox aplicando una transformación al texto. */
function patch(dir: string, file: string, transform: (source: string) => string): void {
  const path = join(dir, file);
  const before = readFileSync(path, "utf8");
  const after = transform(before);

  // Si la mutación no cambia nada, el test siguiente daría un falso verde.
  expect(after).not.toBe(before);
  writeFileSync(path, after);
}

const rulesOf = (findings: Finding[]): string[] => [...new Set(findings.map((f) => f.rule))];

const messagesOf = (findings: Finding[]): string => findings.map((f) => f.message).join("\n");

describe("check-contract", () => {
  describe("sobre el árbol real", () => {
    const result = run();

    test("no hay errores y el código de salida es 0", () => {
      expect(messagesOf(result.errors)).toBe("");
      expect(result.status).toBe(0);
    });

    test("descubre los tres componentes sin lista escrita a mano", () => {
      expect(result.report.map((row) => row.component)).toEqual(["button", "dropdown", "loader"]);
    });

    test("deduce el prefijo de clase de cada componente (button → btn)", () => {
      const prefixes = Object.fromEntries(result.report.map((row) => [row.component, row.prefix]));

      expect(prefixes).toEqual({ button: "btn", dropdown: "dropdown", loader: "loader" });
    });

    test("`--component` limita el informe a un componente", () => {
      expect(run(["--component", "button"]).report.map((row) => row.component)).toEqual(["button"]);
    });
  });

  describe("detecta los desajustes conocidos si se reintroducen", () => {
    let dir: string;

    beforeEach(() => {
      dir = sandbox();
    });

    afterEach(() => {
      rmSync(dir, { recursive: true, force: true });
    });

    test("L5: una entrada de contrato sin selector en el CSS (`variant.solid`)", () => {
      patch(dir, join(PATHS.variantsDir, "button.ts"), (source) =>
        source.replace('outline: "btn-outline"', 'solid: "btn-solid",\n    outline: "btn-outline"')
      );

      const result = run(["--root", dir]);

      expect(rulesOf(result.errors)).toContain("C2");
      expect(messagesOf(result.errors)).toMatch(/btn-solid/);
      expect(result.status).toBe(1);
    });

    test("L5: un valor de unión de tipos sin entrada en el contrato", () => {
      patch(dir, join(PATHS.uiDir, "Button", "src", "Button.types.ts"), (source) =>
        source.replace(
          /export type ButtonVariant =[^;]+;/,
          'export type ButtonVariant = "outline" | "dash" | "soft" | "solid";'
        )
      );

      const result = run(["--root", dir]);

      expect(rulesOf(result.errors)).toContain("C3");
      expect(messagesOf(result.errors)).toMatch(/ButtonVariant = "solid"/);
      expect(result.status).toBe(1);
    });

    test("L6: clases emitidas por los hooks sin un solo selector detrás", () => {
      // Era el estado de `main`: `useDropdown.tsx` emitía `dropdown-menu*` y
      // `dropdown.css` no tenía ningún selector de menú.
      patch(dir, join(PATHS.cssDir, "dropdown.css"), (source) =>
        source.replace(/\.dropdown-menu/g, ".dropdown-panel")
      );

      const result = run(["--root", dir]);
      const c1 = result.errors.filter((finding) => finding.rule === "C1");

      expect(messagesOf(c1)).toMatch(/dropdown-menu/);
      expect(result.status).toBe(1);
    });

    test("L1: un CSS de componente que no viaja en `css/index.css`", () => {
      patch(dir, join(PATHS.cssDir, "index.css"), (source) =>
        source.replace('@import "./loader.css";', "")
      );

      const result = run(["--root", dir]);
      const c4 = result.errors.filter((finding) => finding.rule === "C4");

      expect(messagesOf(c4)).toMatch(/loader\.css/);
      expect(result.status).toBe(1);
    });

    test("una clase emitida que no existe en ningún CSS", () => {
      patch(dir, join(PATHS.uiDir, "Loader", "src", "Loader.tsx"), (source) =>
        source.replace('className="loader-spinner"', 'className="loader-spinner loader-glow"')
      );

      const result = run(["--root", dir]);

      expect(rulesOf(result.errors)).toContain("C1");
      expect(messagesOf(result.errors)).toMatch(/loader-glow/);
      expect(result.status).toBe(1);
    });

    test("un selector del CSS que nadie emite ni declara es aviso, no error", () => {
      patch(dir, join(PATHS.cssDir, "loader.css"), (source) =>
        source.concat("\n.loader-glow {\n  --loader-glow: 1;\n}\n")
      );

      const result = run(["--root", dir]);

      expect(result.errors).toEqual([]);
      expect(rulesOf(result.warnings)).toContain("W1");
      expect(result.status).toBe(0);
      // Con `--strict` el mismo aviso sí es puerta.
      expect(run(["--root", dir, "--strict"]).status).toBe(1);
    });
  });
});
