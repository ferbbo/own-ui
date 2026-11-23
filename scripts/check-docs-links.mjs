#!/usr/bin/env node
/**
 * check-docs-links.mjs — gate de "la documentación no miente".
 *
 * Entregable del lote 9. El problema que resuelve está en `AGENTS.md` §9.9:
 * `e2e/README.md` enlazaba siete documentos que no existen, y un agente que
 * sigue un enlace muerto produce código roto. La documentación que miente es
 * peor que la ausente, así que los enlaces se verifican como se verifica el
 * contrato de clases: con un script que sale con código 1.
 *
 * Qué comprueba: todo destino **relativo** de todo `.md` del repo resuelve a un
 * archivo o directorio que existe. Formas reconocidas:
 *
 *   1. Enlaces en línea      `[texto](ruta)` e imágenes `![alt](ruta)`
 *   2. Definiciones de referencia  `[id]: ruta`
 *   3. Atributos HTML        `<a href="ruta">`, `<img src="ruta">`
 *
 * Qué ignora, a propósito:
 *
 *   - URLs absolutas (`http:`, `https:`, `mailto:`, `tel:`, `//host`).
 *   - Anclas puras (`#seccion`): comprobarlas exigiría replicar la
 *     slugificación de títulos de GitHub, que no está especificada. El ancla de
 *     un enlace a archivo sí se recorta antes de resolver la ruta.
 *   - Bloques de código vallados (``` y ~~~): ahí dentro una ruta es un
 *     ejemplo, no un enlace. Sin esto, cada `pnpm --filter ...` de un bloque
 *     bash daría un falso positivo.
 *
 *   node scripts/check-docs-links.mjs                 # todo el repo
 *   node scripts/check-docs-links.mjs --root /tmp/x   # otro árbol (tests)
 *   node scripts/check-docs-links.mjs --json          # salida para scripts
 *
 * No depende de nada: lee Markdown con expresiones regulares en vez de montar
 * un parser para una comprobación de existencia de ficheros. Mismo criterio que
 * `scripts/check-contract.mjs`.
 */

/* global console, process */
// `eslint.config.js` sólo declara globals para .{js,jsx,ts,tsx}, no para .mjs.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(SCRIPT_DIR, "..");

/** Directorios que nunca se recorren: ni son fuente ni son nuestros. */
const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  "coverage",
  ".turbo",
  "storybook-static",
  "playwright-report",
  "test-results",
  ".changeset",
]);

/**
 * Rutas concretas que se excluyen, con motivo.
 *
 * `@docs/salvage/` es material rescatado de ramas descartadas en el lote 0 y
 * transcrito **verbatim**: su propio README avisa de que no es documentación
 * vigente. Corregirle los enlaces lo convertiría en una copia editada, que es
 * justo lo que un archivo histórico no puede ser.
 */
const SKIP_PATHS = new Set([join("@docs", "salvage")]);

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

/** Lista recursiva de los `.md` del árbol. */
function findMarkdown(dir, root, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      if (SKIP_PATHS.has(relative(root, join(dir, entry.name)))) continue;
      findMarkdown(join(dir, entry.name), root, found);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      found.push(relative(root, join(dir, entry.name)));
    }
  }
  return found.sort();
}

/**
 * Marca las líneas que caen dentro de un bloque de código vallado.
 *
 * Se hace por línea y no con una regex sobre todo el texto porque el informe
 * necesita el número de línea de cada enlace de todas formas.
 */
function fencedLines(lines) {
  const inside = new Array(lines.length).fill(false);
  let fence = null;

  lines.forEach((line, index) => {
    const match = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (match) {
      if (fence === null) {
        fence = match[1][0];
        inside[index] = true;
        return;
      }
      if (match[1][0] === fence) {
        fence = null;
        inside[index] = true;
        return;
      }
    }
    inside[index] = fence !== null;
  });

  return inside;
}

/** Extrae los destinos enlazables de un Markdown, con su número de línea. */
export function extractTargets(source) {
  const lines = source.split("\n");
  const fenced = fencedLines(lines);
  const targets = [];

  const patterns = [
    // [texto](destino "título")  y  ![alt](destino)
    /!?\[[^\]]*\]\(\s*<?([^()<>\s]+)>?(?:\s+["'(][^)]*)?\s*\)/g,
    // [id]: destino
    /^\s{0,3}\[[^\]]+\]:\s*<?([^\s<>]+)>?/g,
    // href="destino" / src="destino"
    /(?:href|src)\s*=\s*["']([^"']+)["']/g,
  ];

  lines.forEach((line, index) => {
    if (fenced[index]) return;
    // Código en línea: `pnpm --filter x` no es un enlace.
    const clean = line.replace(/`[^`]*`/g, (match) => " ".repeat(match.length));

    for (const pattern of patterns) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(clean)) !== null) {
        targets.push({ target: match[1], line: index + 1 });
      }
    }
  });

  return targets;
}

/** Resuelve un destino relativo; devuelve null si no hay nada que comprobar. */
function resolvable(target) {
  if (!target || ABSOLUTE.test(target) || target.startsWith("#")) return null;

  const withoutAnchor = target.split("#")[0].split("?")[0];
  if (!withoutAnchor) return null;

  try {
    return decodeURIComponent(withoutAnchor);
  } catch {
    return withoutAnchor;
  }
}

/** Comprueba todos los enlaces relativos de los `.md` bajo `root`. */
export function checkDocsLinks(root) {
  const files = findMarkdown(root, root);
  const broken = [];
  let checked = 0;

  for (const file of files) {
    const absolute = join(root, file);
    const source = readFileSync(absolute, "utf8");

    for (const { target, line } of extractTargets(source)) {
      const path = resolvable(target);
      if (path === null) continue;

      checked += 1;
      // Una ruta que empieza por "/" es absoluta desde la raíz del repo en
      // GitHub, no desde el sistema de archivos.
      const base = path.startsWith("/") ? root : dirname(absolute);
      const candidate = resolve(base, path.startsWith("/") ? path.slice(1) : path);

      if (!existsSync(candidate)) {
        broken.push({ file, line, target, resolved: relative(root, candidate) });
      }
    }
  }

  return { files: files.length, checked, broken };
}

function parseArgs(argv) {
  const options = { root: DEFAULT_ROOT, json: false, help: false };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--json") options.json = true;
    else if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--root") {
      i += 1;
      options.root = resolve(argv[i] ?? "");
    } else {
      console.error(`Opción desconocida: ${arg}`);
      options.help = true;
    }
  }

  return options;
}

const HELP = `check-docs-links.mjs — verifica los enlaces relativos de los .md del repo

  --root <dir>  Árbol a comprobar (por defecto, la raíz del repo)
  --json        Salida JSON
  --help, -h    Esta ayuda

Sale con código 1 si algún enlace relativo apunta a algo que no existe.`;

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(HELP);
    process.exit(0);
  }

  if (!existsSync(options.root) || !statSync(options.root).isDirectory()) {
    console.error(`No existe el directorio: ${options.root}`);
    process.exit(1);
  }

  const result = checkDocsLinks(options.root);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("");
    console.log(
      `  ${result.files} archivos .md · ${result.checked} enlaces relativos comprobados`
    );
    console.log("");

    if (result.broken.length > 0) {
      for (const item of result.broken) {
        console.error(`  ✗ ${item.file}:${item.line} → ${item.target}`);
        console.error(`      no existe: ${item.resolved}`);
      }
      console.error("");
      console.error(`  ${result.broken.length} enlace(s) roto(s).`);
    } else {
      console.log("  ✓ ningún enlace relativo roto.");
    }
  }

  process.exit(result.broken.length > 0 ? 1 : 0);
}

// Sólo corre como CLI; los tests importan `checkDocsLinks` sin efectos.
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  main();
}
