#!/usr/bin/env node
/**
 * check-contract.mjs — gate automático de la regla de oro del repo.
 *
 * Entregable del lote 8. "El contrato manda" (`@docs/BUILD-BATCHES.md`): para
 * cada componente, las tres capas tienen que decir exactamente lo mismo.
 *
 *   1. React    → los literales de clase que emiten `use<Name>.tsx` y
 *                 `<Name>.tsx` (incluidas las plantillas `` `x-${variant}` ``)
 *   2. contrato → `packages/tw-theme/src/variants/<name>.ts`
 *   3. CSS      → `packages/tw-theme/src/css/<name>.css`
 *
 * Reglas verificadas:
 *
 *   C1  Toda clase emitida por React existe como selector en el CSS del
 *       componente — o en el de otro componente cuyo contrato importe
 *       (el trigger del Dropdown es un `.btn` desde el lote 6).
 *   C2  Toda clase declarada en el contrato existe como selector en el CSS.
 *       Es el desajuste del lote 5: `variant.solid` sin `.btn-solid`.
 *   C3  Todo valor de una unión de tipos (`<Name>Variant`, `<Name>Size`…)
 *       tiene entrada en el grupo homónimo del contrato.
 *   C4  El CSS de todo componente con contrato está importado en
 *       `css/index.css`, que es lo que se publica (lote 1).
 *   W1  (aviso) Selectores del CSS que nadie emite ni declara: clase muerta.
 *   W2  (aviso) Plantillas de clase que no se pudieron expandir.
 *
 * Los componentes **no están en una lista escrita a mano**: se descubren
 * cruzando `packages/ui/src/<Name>/` con `variants/<name>.ts`, así que un
 * componente nuevo (p. ej. generado con `pnpm create-component`) entra al gate
 * sin tocar este archivo.
 *
 *   node scripts/check-contract.mjs                      # todos
 *   node scripts/check-contract.mjs --component button    # uno
 *   node scripts/check-contract.mjs --root /tmp/arbol     # otro árbol (tests)
 *   node scripts/check-contract.mjs --json                # salida para scripts
 *   node scripts/check-contract.mjs --strict              # los avisos fallan
 *
 * Sale con código 1 si hay errores (o avisos con `--strict`), para poder usarlo
 * como puerta en CI.
 *
 * No depende de nada: lee TypeScript y CSS con expresiones regulares en vez de
 * montar un pipeline de compilación para seis archivos. Mismo criterio que
 * `scripts/check-contrast.mjs`.
 */

/* global console, process */
// `eslint.config.js` sólo declara globals para .{js,jsx,ts,tsx}, no para .mjs.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = resolve(SCRIPT_DIR, "..");

const REL = {
  css: join("packages", "tw-theme", "src", "css"),
  variants: join("packages", "tw-theme", "src", "variants"),
  ui: join("packages", "ui", "src"),
};

// ---------------------------------------------------------------------------
// utilidades de lectura
// ---------------------------------------------------------------------------

const read = (file) => readFileSync(file, "utf8");

const isDir = (path) => existsSync(path) && statSync(path).isDirectory();

/**
 * Quita comentarios antes de buscar clases. Las cabeceras de este repo citan
 * clases de ejemplo (`.dropdown-menu-x`) que no son selectores ni literales, y
 * contarlas convertiría la documentación en contrato.
 */
const stripComments = (source) =>
  source.replace(/\/\*[\s\S]*?\*\//g, " ").replace(/(^|[^:])\/\/[^\n]*/g, "$1 ");

const pascal = (word) => word.charAt(0).toUpperCase() + word.slice(1);

// ---------------------------------------------------------------------------
// capa 3: CSS
// ---------------------------------------------------------------------------

/** Selectores de clase de un archivo CSS, incluidos los de `:where()`/`:not()`. */
function cssClassNames(file) {
  const css = stripComments(read(file));
  const names = new Set();

  for (const match of css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
    names.add(match[1]);
  }

  return names;
}

/** `@import "./button.css"` → `["button.css"]`. */
function cssImports(indexFile) {
  if (!existsSync(indexFile)) return [];

  return [...read(indexFile).matchAll(/@import\s+["']\.\/([\w.-]+\.css)["']/g)].map(
    (match) => match[1]
  );
}

// ---------------------------------------------------------------------------
// capa 2: contrato (variants/<name>.ts)
// ---------------------------------------------------------------------------

/**
 * Aplana `export default { theme: { primary: "btn-primary" } }` a
 * `[{ path: "theme.primary", group: "theme", key: "primary", cls: "btn-primary" }]`.
 *
 * Los contratos del repo son objetos literales de dos niveles, así que se leen
 * con dos expresiones regulares en vez de un parser de TypeScript. Si algún día
 * un contrato necesita tres niveles, este script tiene que fallar en voz alta:
 * por eso `groupsFound` se compara contra el número de llaves abiertas.
 */
function parseContract(file) {
  const source = stripComments(read(file));
  const entries = [];
  const groups = new Set();

  const groupPattern = /(?:^|[{,\s])(["']?)([A-Za-z_$][\w$]*|[\w-]+)\1\s*:\s*\{([^{}]*)\}/g;

  for (const [, , group, body] of source.matchAll(groupPattern)) {
    groups.add(group);

    for (const [, , key, cls] of body.matchAll(/(["']?)([\w$-]+)\1\s*:\s*["']([^"']+)["']/g)) {
      entries.push({ path: `${group}.${key}`, group, key, cls });
    }
  }

  return { entries, groups: [...groups] };
}

// ---------------------------------------------------------------------------
// capa 1: React
// ---------------------------------------------------------------------------

/** Uniones de literales declaradas en `<Name>.types.ts`. */
function typeUnions(file) {
  if (!existsSync(file)) return {};

  const source = stripComments(read(file));
  const unions = {};

  for (const [, name, body] of source.matchAll(/export type (\w+)\s*=([^;]+);/g)) {
    const members = [...body.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
    if (members.length > 0) unions[name] = members;
  }

  return unions;
}

/** Archivos de React de los que se extraen clases: hooks, componentes y stories. */
function sourceFiles(dir) {
  if (!isDir(dir)) return [];

  return readdirSync(dir)
    .filter((file) => /\.(ts|tsx)$/.test(file))
    .filter((file) => !file.endsWith(".types.ts"))
    .map((file) => join(dir, file));
}

/**
 * Texto de un archivo del que se extraen clases.
 *
 * En hooks y componentes vale el archivo entero (los comentarios ya se han
 * quitado). En las stories **no**: su bloque de documentación es prosa que cita
 * clases a modo de ejemplo —incluidas las que se eliminaron a propósito, como
 * `.btn-solid`— y tratarla como contrato convertiría la documentación en gate.
 * De una story sólo cuentan los valores de `className`.
 */
function classSource(file) {
  const source = stripComments(read(file));

  if (!/\.stories\.tsx?$/.test(file)) return source;

  return [...source.matchAll(/className\s*=\s*\{?\s*(["'`])([\s\S]*?)\1/g)]
    .map(([, quote, value]) => `${quote}${value}${quote}`)
    .join("\n");
}

/**
 * Clases que emite el código de React.
 *
 * Dos formas:
 *   - literales: `"btn"`, `"dropdown-item-selected"`, o varias en una cadena.
 *   - plantillas: `` `dropdown-${variant}` ``, que se expanden con la unión
 *     `<Name><Variant>` de `<Name>.types.ts`. Si no hay unión que las expanda,
 *     se registra como aviso (W2) en vez de darlas por buenas en silencio.
 *
 * Se filtra por los prefijos conocidos (`btn`, `dropdown`, `loader`…) para no
 * tratar las utilidades de Tailwind de las stories como clases del sistema.
 */
function emittedClasses({ files, prefixes, unions, Name }) {
  const classes = new Map(); // clase -> archivos donde aparece
  const unexpanded = [];

  /** Un token sólo es candidato si tiene forma de clase del sistema. */
  const isClassToken = (token) => /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(token);

  const belongs = (token) =>
    isClassToken(token) &&
    prefixes.some((prefix) => token === prefix || token.startsWith(`${prefix}-`));

  const add = (cls, file) => {
    if (!classes.has(cls)) classes.set(cls, new Set());
    classes.get(cls).add(file);
  };

  for (const file of files) {
    const source = classSource(file);

    // Literales entre comillas simples o dobles (pueden traer varias clases).
    for (const [, , value] of source.matchAll(/(["'])([^"'\n]*)\1/g)) {
      for (const token of value.split(/\s+/)) {
        if (token && belongs(token)) add(token, file);
      }
    }

    // Plantillas: sólo interesa el prefijo literal + la interpolación.
    for (const [, template] of source.matchAll(/`([^`]*)`/g)) {
      for (const [, base, ident] of template.matchAll(/([a-z][\w-]*-)\$\{(\w+)\}/g)) {
        const stem = base.slice(0, -1);
        if (!belongs(stem) && !belongs(base)) continue;

        const unionName = `${Name}${pascal(ident)}`;
        const members = unions[unionName];

        if (!members) {
          unexpanded.push({ template: `${base}\${${ident}}`, unionName, file });
          continue;
        }

        for (const member of members) add(`${base}${member}`, file);
      }
    }
  }

  return { classes, unexpanded };
}

/** Contratos de otros componentes que este importa (`import { button } from …`). */
function importedContracts(files) {
  const imported = new Set();

  for (const file of files) {
    const source = stripComments(read(file));

    for (const [, names] of source.matchAll(
      /import\s*\{([^}]+)\}\s*from\s*["']@ownui\/tw-theme\/variants["']/g
    )) {
      for (const name of names.split(",")) {
        const clean = name.trim().split(/\s+as\s+/)[0].trim();
        if (clean) imported.add(clean);
      }
    }
  }

  return [...imported];
}

// ---------------------------------------------------------------------------
// descubrimiento
// ---------------------------------------------------------------------------

/**
 * Descubre los componentes cruzando las tres capas. La clave es el nombre en
 * minúsculas (`button`), que es el del CSS y el del contrato; `Name` es el del
 * paquete de React (`Button`).
 */
function discover(root) {
  const cssDir = join(root, REL.css);
  const variantsDir = join(root, REL.variants);
  const uiDir = join(root, REL.ui);

  const uiNames = isDir(uiDir)
    ? readdirSync(uiDir).filter((entry) => /^[A-Z]/.test(entry) && isDir(join(uiDir, entry)))
    : [];

  const contractNames = isDir(variantsDir)
    ? readdirSync(variantsDir)
        .filter((file) => /^[a-z][\w-]*\.ts$/.test(file) && file !== "index.ts")
        .map((file) => file.replace(/\.ts$/, ""))
    : [];

  const names = new Set([...contractNames, ...uiNames.map((name) => name.toLowerCase())]);

  return [...names].sort().map((name) => {
    const Name = uiNames.find((candidate) => candidate.toLowerCase() === name) ?? pascal(name);

    return {
      name,
      Name,
      contractFile: join(variantsDir, `${name}.ts`),
      cssFile: join(cssDir, `${name}.css`),
      srcDir: join(uiDir, Name, "src"),
      typesFile: join(uiDir, Name, "src", `${Name}.types.ts`),
    };
  });
}

/**
 * Prefijo de clase del componente: el token más repetido antes del primer
 * guion en las clases del contrato (`btn` para `button`). Se deduce en vez de
 * configurarse porque `button` → `btn` es la única excepción y una lista
 * escrita a mano se queda obsoleta en el primer componente nuevo.
 */
function prefixOf(name, entries) {
  const counts = new Map();

  for (const { cls } of entries) {
    const stem = cls.split("-")[0];
    counts.set(stem, (counts.get(stem) ?? 0) + 1);
  }

  const [best] = [...counts.entries()].sort((a, b) => b[1] - a[1]);

  return best?.[0] ?? name;
}

// ---------------------------------------------------------------------------
// verificación
// ---------------------------------------------------------------------------

function checkAll({ root, only }) {
  const cssDir = join(root, REL.css);
  const indexCss = join(cssDir, "index.css");
  const imports = new Set(cssImports(indexCss));

  const components = discover(root);
  const errors = [];
  const warnings = [];

  // Primera pasada: contrato y prefijo de cada componente (hace falta el mapa
  // completo de prefijos para saber si `"btn"` dentro de useDropdown es una
  // clase del sistema o una palabra cualquiera).
  const parsed = components.map((component) => {
    const contract = existsSync(component.contractFile)
      ? parseContract(component.contractFile)
      : { entries: [], groups: [] };

    return { ...component, contract, prefix: prefixOf(component.name, contract.entries) };
  });

  const prefixes = parsed.map((component) => component.prefix);
  const cssByName = new Map(
    parsed
      .filter((component) => existsSync(component.cssFile))
      .map((component) => [component.name, cssClassNames(component.cssFile)])
  );

  /** Todas las clases que el CSS publicado define, sea de qué componente sea. */
  const allCssClasses = new Set([...cssByName.values()].flatMap((set) => [...set]));

  const report = [];

  for (const component of parsed) {
    if (only && component.name !== only) continue;

    const { name, Name, contract, prefix } = component;
    const hasCss = cssByName.has(name);
    const own = cssByName.get(name) ?? new Set();
    const files = sourceFiles(component.srcDir);
    const unions = typeUnions(component.typesFile);

    const fail = (rule, message, detail) => errors.push({ component: name, rule, message, detail });
    const warn = (rule, message, detail) =>
      warnings.push({ component: name, rule, message, detail });

    if (!hasCss) {
      fail("C0", `no existe \`css/${name}.css\` para el contrato \`variants/${name}.ts\``);
    }

    if (contract.entries.length === 0) {
      fail("C0", `\`variants/${name}.ts\` no declara ninguna clase (contrato vacío o ilegible)`);
    }

    // C4 — el CSS tiene que viajar en el agregador que se publica.
    if (hasCss && !imports.has(`${name}.css`)) {
      fail("C4", `\`css/index.css\` no importa \`./${name}.css\`: ese CSS no se publica`);
    }

    // C2 — contrato ⊆ CSS.
    for (const entry of contract.entries) {
      if (!own.has(entry.cls)) {
        fail("C2", `contrato \`${entry.path}\` → \`.${entry.cls}\` no existe en ${name}.css`);
      }
    }

    // C1 — clases emitidas por React ⊆ CSS publicado.
    //
    // El conjunto permitido es el de TODOS los componentes, no sólo el propio:
    // un componente puede (y debe) reutilizar el CSS de otro —el trigger del
    // Dropdown es un `.btn` desde el lote 6 (D-08), y las stories pintan
    // botones alrededor del componente que documentan—. Lo que la regla
    // persigue es la clase que no existe en ninguna parte, que es el bug del
    // lote 6: `dropdown-menu` emitida sin un solo selector detrás.
    const { classes, unexpanded } = emittedClasses({ files, prefixes, unions, Name });
    const crossNames = importedContracts(files).filter((other) => other !== name);
    const allowed = new Set(allCssClasses);

    for (const [cls, where] of classes) {
      if (allowed.has(cls)) continue;

      const from = [...where].map((file) => file.replace(`${root}/`, "")).join(", ");
      fail("C1", `\`${cls}\` se emite en React y no existe en el CSS`, from);
    }

    for (const item of unexpanded) {
      warn(
        "W2",
        `plantilla \`${item.template}\` sin unión \`${item.unionName}\` que la expanda`,
        item.file.replace(`${root}/`, "")
      );
    }

    // C3 — valores de tipo ⊆ claves del contrato.
    for (const group of contract.groups) {
      const unionName = `${Name}${pascal(group)}`;
      const members = unions[unionName];
      if (!members) continue;

      const keys = new Set(
        contract.entries.filter((entry) => entry.group === group).map((entry) => entry.key)
      );

      for (const member of members) {
        if (!keys.has(member)) {
          fail("C3", `\`${unionName} = "${member}"\` no tiene entrada en \`${group}\` del contrato`);
        }
      }
    }

    // W1 — selectores del CSS que nadie emite ni declara.
    const declared = new Set(contract.entries.map((entry) => entry.cls));
    const dead = [...own].filter(
      (cls) =>
        (cls === prefix || cls.startsWith(`${prefix}-`)) && !declared.has(cls) && !classes.has(cls)
    );

    for (const cls of dead) {
      warn("W1", `\`.${cls}\` existe en ${name}.css y nadie la emite ni la declara`);
    }

    report.push({
      component: name,
      prefix,
      css: hasCss ? `${name}.css` : null,
      contrato: contract.entries.length,
      emitidas: classes.size,
      tipos: Object.keys(unions).length,
      cruzados: crossNames,
    });
  }

  return { report, errors, warnings, components: parsed.map((component) => component.name) };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const HELP = `
check-contract — cruza React ⇄ variants/ ⇄ css/ de cada componente.

  node scripts/check-contract.mjs [opciones]

  --component <nombre>  verificar sólo ese componente (en minúsculas)
  --root <ruta>         raíz del monorepo a verificar (por defecto, la del repo)
  --json                salida en JSON
  --strict              los avisos (W1/W2) también fallan
  --help                esta ayuda

Códigos de salida: 0 todo en orden · 1 hay errores (o avisos con --strict).
`;

function parseArgs(argv) {
  const options = { root: DEFAULT_ROOT, only: null, json: false, strict: false, help: false };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--help" || arg === "-h") options.help = true;
    else if (arg === "--json") options.json = true;
    else if (arg === "--strict") options.strict = true;
    else if (arg === "--component") options.only = argv[++index];
    else if (arg === "--root") options.root = resolve(argv[++index]);
    else {
      console.error(`Opción desconocida: ${arg}`);
      return null;
    }
  }

  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options) {
    console.error(HELP);
    process.exit(2);
  }

  if (options.help) {
    console.log(HELP.trim());
    return;
  }

  if (!isDir(join(options.root, REL.variants))) {
    console.error(`No encuentro ${REL.variants} bajo ${options.root}`);
    process.exit(2);
  }

  const result = checkAll(options);

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log("check-contract — React ⇄ variants/ ⇄ css/\n");

    for (const row of result.report) {
      const cruzados = row.cruzados.length > 0 ? ` · cruza con ${row.cruzados.join(", ")}` : "";
      console.log(
        `  ${row.component.padEnd(10)} prefijo .${row.prefix.padEnd(9)} ` +
          `${String(row.contrato).padStart(2)} clases de contrato · ` +
          `${String(row.emitidas).padStart(2)} emitidas${cruzados}`
      );
    }

    if (result.errors.length > 0) {
      console.log(`\n✗ ${result.errors.length} error(es):\n`);
      for (const error of result.errors) {
        const detail = error.detail ? `\n      (${error.detail})` : "";
        console.log(`  [${error.rule}] ${error.component}: ${error.message}${detail}`);
      }
    }

    if (result.warnings.length > 0) {
      console.log(`\n! ${result.warnings.length} aviso(s):\n`);
      for (const warning of result.warnings) {
        const detail = warning.detail ? ` (${warning.detail})` : "";
        console.log(`  [${warning.rule}] ${warning.component}: ${warning.message}${detail}`);
      }
    }

    if (result.errors.length === 0 && result.warnings.length === 0) {
      console.log("\n✓ las tres capas dicen lo mismo en todos los componentes.");
    }
  }

  const failed = result.errors.length > 0 || (options.strict && result.warnings.length > 0);

  process.exit(failed ? 1 : 0);
}

main();
