/**
 * build.js
 *
 * Build script for the `tw-theme` package.
 *
 * Purpose:
 * - Read component CSS files from `src/css/*.css`.
 * - Run the `tailwindcss` CLI to generate Tailwind-processed CSS.
 * - Apply a PostCSS pass (only nesting + a custom plugin to remove `@supports`).
 * - Convert the processed CSS to a JS object (via postcss-js) and export it as
 *   constants in `src/build/components.js`.
 *
 * Requirements:
 * - The `tailwindcss` CLI should be available (preferably installed locally).
 * - Node >=16 and dependencies: `execa`, `fast-glob`, `postcss`, `postcss-js`,
 *   `postcss-nesting`.
 *
 * Output:
 * - `src/build/components.js` containing JS objects with the transformed CSS
 *   rules for each component.
 *
 * Typical usage (from the package root):
 *   node src/build/build.js
 */

import { execa } from 'execa';
import fg from 'fast-glob'
import fs from 'node:fs/promises'
import postcss from 'postcss'
import postcssJs from 'postcss-js'
import postcssNesting from 'postcss-nesting'

const componentFiles = await fg('src/css/*.css')
let generatedComponentFile = ''

/**
 * removeSupportsPlugin
 * --------------------
 * A small PostCSS plugin that removes `@supports` at-rules from the final
 * output. Instead of keeping the `@supports` wrapper, the plugin promotes the
 * inner rules to the parent level and removes the at-rule.
 * Rationale: Some consumers of the generated CSS prefer not to retain
 * `@supports` blocks in the final build; this script normalizes the CSS by
 * promoting the rules.
 */
const removeSupportsPlugin = () => {
  return {
    postcssPlugin: 'remove-supports',
    AtRule: {
      supports(rule) {
        const parent = rule.parent
        // Move each child node (rule) just before the at-rule in the parent
        rule.nodes.forEach(node => {
          parent.insertBefore(rule, node)
        })
        // Remove the now-empty at-rule
        rule.remove()
      }
    }
  }
}
// Flag required for PostCSS v8+ compatibility when registering programmatic
// plugins.
removeSupportsPlugin.postcss = true

/**
 * postcssProcessor
 * -----------------
 * PostCSS pipeline used to process Tailwind's output. This applies only
 * `postcss-nesting` (enables CSS nesting) and the custom
 * `removeSupportsPlugin` described above.
 *
 * Note: other transforms (autoprefixer, cssnano, etc.) are intentionally
 * omitted because this script's goal is to produce JS objects consumable by
 * the plugin/package.
 */
const postcssProcessor = postcss([
  postcssNesting(), // Enable nested rules (CSS-in-CSS style)
  removeSupportsPlugin(), // Promote/remove `@supports` blocks
])

for (const filePath of componentFiles) {
  // Component name derived from the file, e.g. 'button' from
  // 'src/css/button.css'
  const componentName = filePath.split('/').pop().replace('.css', '')
  const temporaryOutputPath = `.tmp/${componentName}.css`

  // Step 1: Run the Tailwind CLI to generate the initial CSS.
  // - `-i` input file
  // - `-o` temporary output file
  // `preferLocal: true` is used to prioritize the package's local
  // `tailwindcss` installation inside the monorepo.
  await execa('tailwindcss', ['-i', filePath, '-o', temporaryOutputPath], { stdio: 'inherit', preferLocal: true })

  // Step 2: Read the generated CSS and run the PostCSS pipeline.
  // This will apply only nesting and remove any `@supports` blocks.
  const cssContent = await fs.readFile(temporaryOutputPath, 'utf8')
  const processedResult = await postcssProcessor.process(cssContent, { from: filePath })

  // Step 3: Convert the resulting PostCSS AST into a JS object using
  // `postcss-js` so it can be exported as a JS literal.
  const parsedRoot = processedResult.root;
  if (!parsedRoot) {
    throw new Error(`Error parsing CSS: ${processedResult}`);
  }
  const cssObject = postcssJs.objectify(parsedRoot);
  // Constant name exported inside `src/build/components.js`.
  const constantName = `${componentName}Styles`

  // Append the export text (this string will be written to the file at the end).
  generatedComponentFile += `export const ${constantName} = ${JSON.stringify(cssObject, null, 2)}\n`
}

// Step 4: Write the final file containing all generated constants.
// `src/build/components.js` will contain entries like:
//   export const buttonStyles = { ... }
await fs.writeFile('src/build/components.js', generatedComponentFile)