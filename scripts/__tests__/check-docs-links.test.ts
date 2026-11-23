import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Tests de `scripts/check-docs-links.mjs` (lote 9).
 *
 * El checker existe para que el criterio AC5 ("ningún enlace relativo roto en
 * los .md") deje de depender de que alguien mire. Se prueba igual que el
 * checker de contrato del lote 8: montando árboles temporales con enlaces
 * rotos de verdad y exigiendo error **y código de salida 1**, que es lo que lo
 * convierte en puerta.
 *
 * Se invoca el CLI con `execFileSync` en vez de importar el módulo para
 * verificar también ese código de salida sin que Jest tenga que cargar un
 * `.mjs`.
 */

/** Jest corre desde la raíz del monorepo (`rootDir` de `jest.config.js`). */
const ROOT = process.cwd();
const SCRIPT = join(ROOT, "scripts", "check-docs-links.mjs");

interface Broken {
  file: string;
  line: number;
  target: string;
  resolved: string;
}

interface Result {
  files: number;
  checked: number;
  broken: Broken[];
  status: number;
}

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

/** Crea un árbol temporal con los archivos indicados y lo devuelve. */
function tree(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "ownui-docs-"));

  for (const [relative, content] of Object.entries(files)) {
    const absolute = join(dir, relative);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, content, "utf8");
  }

  return dir;
}

describe("check-docs-links", () => {
  const sandboxes: string[] = [];

  function sandbox(files: Record<string, string>): string {
    const dir = tree(files);
    sandboxes.push(dir);
    return dir;
  }

  afterAll(() => {
    for (const dir of sandboxes) rmSync(dir, { recursive: true, force: true });
  });

  it("sale en verde cuando todos los destinos existen", () => {
    const dir = sandbox({
      "README.md": "Ver [la guía](./docs/guia.md) y [el paquete](packages/ui).",
      "docs/guia.md": "Volver al [README](../README.md).",
      "packages/ui/index.md": "hola",
    });

    const result = run(["--root", dir]);

    expect(result.status).toBe(0);
    expect(result.broken).toEqual([]);
    expect(result.checked).toBeGreaterThan(0);
  });

  it("detecta un enlace en línea roto y sale con código 1", () => {
    const dir = sandbox({ "README.md": "Ver [la guía](./docs/NO-EXISTE.md)." });

    const result = run(["--root", dir]);

    expect(result.status).toBe(1);
    expect(result.broken).toHaveLength(1);
    expect(result.broken[0]).toMatchObject({
      file: "README.md",
      line: 1,
      target: "./docs/NO-EXISTE.md",
    });
  });

  it("detecta una definición de referencia rota", () => {
    const dir = sandbox({
      "README.md": ["Ver [la guía][guia].", "", "[guia]: ./docs/NO-EXISTE.md"].join("\n"),
    });

    const result = run(["--root", dir]);

    expect(result.status).toBe(1);
    expect(result.broken.map((item) => item.target)).toContain("./docs/NO-EXISTE.md");
    expect(result.broken.map((item) => item.line)).toContain(3);
  });

  it("detecta un href de HTML roto y una imagen rota", () => {
    const dir = sandbox({
      "README.md": ['<a href="./falta.md">x</a>', "", "![diagrama](./falta.png)"].join("\n"),
    });

    const result = run(["--root", dir]);

    expect(result.status).toBe(1);
    expect(result.broken.map((item) => item.target).sort()).toEqual(["./falta.md", "./falta.png"]);
  });

  it("ignora URLs absolutas, anclas puras y protocolos", () => {
    const dir = sandbox({
      "README.md": [
        "[web](https://example.com/x.md)",
        "[correo](mailto:a@example.com)",
        "[seccion](#una-seccion)",
        "[protocolo](//example.com/x.md)",
      ].join("\n"),
    });

    const result = run(["--root", dir]);

    expect(result.status).toBe(0);
    expect(result.checked).toBe(0);
  });

  it("recorta el ancla antes de resolver la ruta", () => {
    const dir = sandbox({
      "README.md": "[a la guía](./docs/guia.md#instalacion)",
      "docs/guia.md": "x",
    });

    expect(run(["--root", dir]).status).toBe(0);
  });

  it("resuelve una ruta que empieza por / desde la raíz del árbol, no del disco", () => {
    const dir = sandbox({
      "docs/guia.md": "[al readme](/README.md)",
      "README.md": "x",
    });

    expect(run(["--root", dir]).status).toBe(0);
  });

  it("no mira dentro de bloques de código vallados ni de código en línea", () => {
    const dir = sandbox({
      "README.md": [
        "```bash",
        "[esto](./no-existe.md) es un ejemplo, no un enlace",
        "```",
        "",
        "Y `[tampoco](./no-existe.md)` en código en línea.",
      ].join("\n"),
    });

    const result = run(["--root", dir]);

    expect(result.status).toBe(0);
    expect(result.checked).toBe(0);
  });

  it("no recorre node_modules, dist ni el archivo histórico @docs/salvage", () => {
    const dir = sandbox({
      "node_modules/paquete/README.md": "[roto](./no-existe.md)",
      "dist/README.md": "[roto](./no-existe.md)",
      "@docs/salvage/viejo.md": "[roto](./no-existe.md)",
      "README.md": "ok",
    });

    const result = run(["--root", dir]);

    expect(result.status).toBe(0);
    expect(result.files).toBe(1);
  });

  it("acepta un destino que es un directorio", () => {
    const dir = sandbox({
      "README.md": "[el paquete](./packages/ui)",
      "packages/ui/index.md": "x",
    });

    expect(run(["--root", dir]).status).toBe(0);
  });

  it("el repo real no tiene ningún enlace relativo roto", () => {
    // Regresión del criterio AC5 del lote 9: los 7 enlaces muertos de
    // `e2e/README.md` que documentaba `AGENTS.md` §9.9, más los tres que
    // encontró el checker al escribirlo. Si alguien vuelve a enlazar un
    // documento que no existe, esto se pone rojo sin esperar a CI.
    const result = run();

    expect(result.broken).toEqual([]);
    expect(result.status).toBe(0);
  });

  it("--help sale con 0 y explica el uso", () => {
    const stdout = execFileSync("node", [SCRIPT, "--help"], { encoding: "utf8" });
    expect(stdout).toContain("--root");
    expect(stdout).toContain("--json");
  });
});
