import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * Tests de `scripts/create-component.mjs` (lote 8).
 *
 * El criterio AC1 del lote es que el andamio produzca un paquete que compila,
 * pasa lint, tiene un test que pasa y una story que renderiza **sin edición
 * manual**. Eso sólo se puede verificar de verdad generando y ejecutando, así
 * que la comprobación es doble:
 *
 *   - aquí: se genera sobre un árbol temporal y se exige que las tres capas
 *     queden alineadas (`check-contract` en verde) y que los registros se
 *     hagan solos;
 *   - en el PR del lote: la generación real de `Demo` y `Panel` en el repo,
 *     con typecheck, lint, test y build. Queda registrada en `specs/lote-8.md`.
 */

/** Jest corre desde la raíz del monorepo (`rootDir` de `jest.config.js`). */
const ROOT = process.cwd();
const CREATE = join(ROOT, "scripts", "create-component.mjs");
const CHECK = join(ROOT, "scripts", "check-contract.mjs");

const CSS_DIR = join("packages", "tw-theme", "src", "css");
const VARIANTS_DIR = join("packages", "tw-theme", "src", "variants");
const UI_DIR = join("packages", "ui", "src");

/** Las tres capas más los archivos donde el generador registra el paquete. */
const SANDBOX_DIRS = [CSS_DIR, VARIANTS_DIR, UI_DIR];
const SANDBOX_FILES = [join("packages", "ui", "package.json"), "tsconfig.jest.json"];

function sandbox(): string {
  const dir = mkdtempSync(join(tmpdir(), "ownui-create-"));

  for (const relative of SANDBOX_DIRS) {
    cpSync(join(ROOT, relative), join(dir, relative), {
      recursive: true,
      filter: (source) => !/(node_modules|dist|\.turbo)/.test(source),
    });
  }

  for (const relative of SANDBOX_FILES) {
    cpSync(join(ROOT, relative), join(dir, relative));
  }

  return dir;
}

interface Run {
  stdout: string;
  status: number;
}

function node(script: string, args: string[]): Run {
  try {
    return { stdout: execFileSync("node", [script, ...args], { encoding: "utf8" }), status: 0 };
  } catch (error) {
    const failure = error as { status?: number; stdout?: string; stderr?: string };

    return { stdout: `${failure.stdout ?? ""}${failure.stderr ?? ""}`, status: failure.status ?? 1 };
  }
}

const create = (dir: string, args: string[]): Run => node(CREATE, [...args, "--root", dir]);

const checkContract = (dir: string): Run => node(CHECK, ["--root", dir, "--json"]);

const read = (dir: string, relative: string): string => readFileSync(join(dir, relative), "utf8");

describe("create-component", () => {
  let dir: string;

  beforeEach(() => {
    dir = sandbox();
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  test("--dry-run no escribe nada", () => {
    const result = create(dir, ["Widget", "--dry-run"]);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/demo|widget\.css/);
    expect(existsSync(join(dir, CSS_DIR, "widget.css"))).toBe(false);
    expect(existsSync(join(dir, UI_DIR, "Widget"))).toBe(false);
  });

  test("rechaza un nombre que no es PascalCase", () => {
    const result = create(dir, ["mi-widget"]);

    expect(result.status).toBe(2);
    expect(result.stdout).toMatch(/PascalCase/);
  });

  describe("patrón de composición simple", () => {
    beforeEach(() => {
      expect(create(dir, ["Widget"]).status).toBe(0);
    });

    test("genera las tres capas y el paquete completo", () => {
      const expected = [
        join(CSS_DIR, "widget.css"),
        join(VARIANTS_DIR, "widget.ts"),
        join(UI_DIR, "Widget", "package.json"),
        join(UI_DIR, "Widget", "tsconfig.json"),
        join(UI_DIR, "Widget", "tsup.config.ts"),
        join(UI_DIR, "Widget", "src", "Widget.types.ts"),
        join(UI_DIR, "Widget", "src", "useWidget.tsx"),
        join(UI_DIR, "Widget", "src", "Widget.tsx"),
        join(UI_DIR, "Widget", "src", "index.ts"),
        join(UI_DIR, "Widget", "src", "Widget.stories.tsx"),
        join(UI_DIR, "Widget", "__test__", "Widget.test.tsx"),
      ];

      for (const relative of expected) {
        expect(existsSync(join(dir, relative))).toBe(true);
      }
    });

    test("el CSS generado viaja en el agregador que se publica", () => {
      expect(read(dir, join(CSS_DIR, "index.css"))).toContain('@import "./widget.css";');
    });

    test("registra el contrato, el agregador de React y las dependencias", () => {
      expect(read(dir, join(VARIANTS_DIR, "index.ts"))).toContain(
        'export { default as widget } from "./widget.ts";'
      );
      expect(read(dir, join(UI_DIR, "index.ts"))).toContain(
        'export { default as Widget } from "./Widget/src/Widget";'
      );
      expect(read(dir, join("packages", "ui", "package.json"))).toContain(
        '"@ownui/widget": "workspace:*"'
      );
      expect(read(dir, "tsconfig.jest.json")).toContain(
        '"@ownui/widget": ["packages/ui/src/Widget/src/index.ts"]'
      );
    });

    test("las tres capas quedan alineadas: check-contract en verde", () => {
      const result = checkContract(dir);
      const parsed = JSON.parse(result.stdout);

      expect(parsed.errors).toEqual([]);
      expect(parsed.warnings).toEqual([]);
      expect(result.status).toBe(0);
      expect(parsed.report.map((row: { component: string }) => row.component)).toContain("widget");
    });

    test("el CSS no trae ni un color literal (regla §8.2)", () => {
      const css = read(dir, join(CSS_DIR, "widget.css"));
      const literals = css.match(/#[0-9a-fA-F]{3,8}\b/g) ?? [];

      // Los únicos hex admitidos son los operandos de color-mix.
      expect(literals.every((literal) => ["#000", "#0000"].includes(literal))).toBe(true);
    });

    test("no sobrescribe sin --force", () => {
      const before = read(dir, join(CSS_DIR, "widget.css"));
      const result = create(dir, ["Widget"]);

      expect(result.stdout).toMatch(/sin tocar/);
      expect(read(dir, join(CSS_DIR, "widget.css"))).toBe(before);
    });
  });

  describe("patrón compound", () => {
    beforeEach(() => {
      expect(create(dir, ["Tray", "--compound"]).status).toBe(0);
    });

    test("genera el contexto y los subcomponentes", () => {
      expect(existsSync(join(dir, UI_DIR, "Tray", "src", "TrayContext.tsx"))).toBe(true);

      const component = read(dir, join(UI_DIR, "Tray", "src", "Tray.tsx"));

      expect(component).toContain("Tray.Trigger = MemoizedTrayTrigger;");
      expect(component).toContain("Tray.Panel = MemoizedTrayPanel;");
      expect(component).toContain("Tray.Item = MemoizedTrayItem;");
    });

    test("el contrato cubre trigger, panel e item", () => {
      const contract = read(dir, join(VARIANTS_DIR, "tray.ts"));

      for (const cls of [
        "tray-trigger",
        "tray-trigger-active",
        "tray-panel",
        "tray-panel-open",
        "tray-panel-closed",
        "tray-item",
        "tray-item-selected",
        "tray-item-disabled",
      ]) {
        expect(contract).toContain(`"${cls}"`);
      }
    });

    test("las tres capas quedan alineadas: check-contract en verde", () => {
      const result = checkContract(dir);
      const parsed = JSON.parse(result.stdout);

      expect(parsed.errors).toEqual([]);
      expect(result.status).toBe(0);
    });

    test("el panel respeta prefers-reduced-motion", () => {
      expect(read(dir, join(CSS_DIR, "tray.css"))).toMatch(
        /@media \(prefers-reduced-motion: reduce\)/
      );
    });
  });

  test("--prefix cambia el prefijo de clase de las tres capas", () => {
    expect(create(dir, ["Chip", "--prefix", "cp"]).status).toBe(0);

    expect(read(dir, join(CSS_DIR, "chip.css"))).toContain(".cp-primary");
    expect(read(dir, join(VARIANTS_DIR, "chip.ts"))).toContain('"cp-primary"');
    expect(read(dir, join(UI_DIR, "Chip", "src", "useChip.tsx"))).toContain('const base = "cp"');
    expect(checkContract(dir).status).toBe(0);
  });
});
