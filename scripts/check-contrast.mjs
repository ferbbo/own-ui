#!/usr/bin/env node
/**
 * check-contrast.mjs — auditoría de contraste WCAG 2.1 de los tokens semánticos.
 *
 * Entregable del lote 22. Recorre TODOS los temas registrados en
 * `packages/tw-theme/src/themes/` y, por cada familia semántica, mide el par
 * relleno / `-content` en dos estados:
 *
 *   1. reposo        → `--color-{familia}`        vs `--color-{familia}-content`
 *   2. interacción   → `--color-{familia}-focus`  vs `--color-{familia}-content`
 *
 * El segundo estado es el que se olvida: `css/button.css` recalcula el relleno
 * en `:hover`, así que un par que aprueba en reposo puede suspender al pasar el
 * ratón. Si el tema no define `-focus`, ese estado se salta y se avisa.
 *
 * Umbrales (WCAG 2.1 AA): 4.5:1 para texto normal, 3:1 para texto grande y
 * componentes de interfaz. Se exige el de texto normal, porque el `-content` de
 * una familia es precisamente el color de la etiqueta de un control.
 *
 *   node scripts/check-contrast.mjs                 # todos los temas
 *   node scripts/check-contrast.mjs --theme light   # uno
 *   node scripts/check-contrast.mjs --threshold 3   # sólo el umbral de componente
 *
 * Sale con código 1 si algún par suspende, para poder usarlo como gate.
 *
 * No depende de nada: los temas son objetos literales, así que se leen con una
 * expresión regular en vez de montar un pipeline de TypeScript para cuatro
 * archivos.
 */

/* global console, process */
// `eslint.config.js` sólo declara globals para .{js,jsx,ts,tsx}, no para .mjs, así que
// este archivo los declara aquí en vez de tocar la configuración compartida.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const THEMES_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../packages/tw-theme/src/themes");

const FAMILIES = ["primary", "secondary", "accent", "neutral", "info", "success", "warning", "error"];

// ─── Color ───────────────────────────────────────────────────────────────────

const hexToRgb = (hex) => {
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
};

/** Canal sRGB → lineal (WCAG 2.1, §relative luminance). */
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

const luminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map(toLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [la, lb] = [luminance(a), luminance(b)];
  if (la === null || lb === null) return null;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
};

// ─── Lectura de temas ────────────────────────────────────────────────────────

/** Extrae los pares `"--color-x": "#hex"` de un módulo de tema. */
const parseTheme = (source) => {
  const tokens = {};
  const re = /["']?(--[a-z0-9-]+)["']?\s*:\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(source)) !== null) tokens[m[1]] = m[2].trim();
  return tokens;
};

const loadThemes = () => {
  const themes = [];
  for (const file of readdirSync(THEMES_DIR).sort()) {
    if (!file.endsWith(".ts") || file === "index.ts") continue;
    const tokens = parseTheme(readFileSync(join(THEMES_DIR, file), "utf8"));
    // Un tema de color es el que define al menos una familia semántica.
    if (!FAMILIES.some((f) => tokens[`--color-${f}`])) continue;
    themes.push({ name: file.replace(/\.ts$/, ""), file, tokens });
  }
  return themes;
};

// ─── Informe ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const only = args.includes("--theme") ? args[args.indexOf("--theme") + 1] : null;
const threshold = args.includes("--threshold") ? Number(args[args.indexOf("--threshold") + 1]) : 4.5;

const themes = loadThemes().filter((t) => !only || t.name === only);

if (themes.length === 0) {
  console.error(
    only
      ? `No hay ningún tema llamado "${only}" en ${THEMES_DIR}`
      : `No se encontró ningún tema con familias semánticas en ${THEMES_DIR}`
  );
  process.exit(1);
}

const failures = [];
const skipped = [];

console.log(`\nAuditoría de contraste WCAG 2.1 — umbral ${threshold}:1`);
console.log(`Temas: ${themes.map((t) => t.name).join(", ")}`);

for (const theme of themes) {
  console.log(`\n=== ${theme.name} (${theme.file}) ===`);
  console.log("familia      estado       relleno   content   ratio  veredicto");

  for (const family of FAMILIES) {
    const fill = theme.tokens[`--color-${family}`];
    const content = theme.tokens[`--color-${family}-content`];
    const focus = theme.tokens[`--color-${family}-focus`];

    if (!fill) {
      skipped.push(`${theme.name}/${family}: sin --color-${family}`);
      continue;
    }
    if (!content) {
      skipped.push(`${theme.name}/${family}: sin --color-${family}-content`);
      continue;
    }

    for (const [state, bg] of [
      ["reposo", fill],
      ["interacción", focus],
    ]) {
      if (!bg) {
        skipped.push(`${theme.name}/${family}: sin --color-${family}-focus (estado de interacción sin medir)`);
        continue;
      }
      const r = contrast(bg, content);
      if (r === null) {
        skipped.push(`${theme.name}/${family} (${state}): valor no hexadecimal (${bg} / ${content})`);
        continue;
      }
      const pass = r >= threshold;
      if (!pass) failures.push({ theme: theme.name, family, state, bg, content, ratio: r });
      console.log(
        `${family.padEnd(12)} ${state.padEnd(12)} ${bg.padEnd(9)} ${content.padEnd(9)} ${r.toFixed(2).padStart(5)}  ${pass ? "AA ✓" : "SUSPENDE"}`
      );
    }
  }
}

if (skipped.length > 0) {
  console.log(`\n⚠️  ${skipped.length} comprobación(es) no realizadas:`);
  for (const s of skipped) console.log(`   · ${s}`);
}

if (failures.length === 0) {
  console.log(`\n✅ Todos los pares medidos alcanzan ${threshold}:1.\n`);
  process.exit(0);
}

console.log(`\n❌ ${failures.length} par(es) por debajo de ${threshold}:1:`);
for (const f of failures) {
  console.log(`   · ${f.theme}/${f.family} (${f.state}): ${f.bg} sobre ${f.content} = ${f.ratio.toFixed(2)}:1`);
}
console.log(
  "\nLos rellenos claros necesitan `-content` oscuro: ver la paleta ya calculada\n" +
    "en @docs/BUILD-BATCHES.md §L22 y el alcance del lote 22.\n"
);
process.exit(1);
