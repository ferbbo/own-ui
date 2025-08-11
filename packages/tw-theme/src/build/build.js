import { execa } from 'execa';
import fg from 'fast-glob'
import fs from 'node:fs/promises'
import postcss from 'postcss'
import postcssJs from 'postcss-js'
import postcssNesting from 'postcss-nesting'

const componentFiles = await fg('src/css/*.css')
let generatedComponentFile = ''

// Plugin personalizado para eliminar @supports
const removeSupportsPlugin = () => {
  return {
    postcssPlugin: 'remove-supports',
    AtRule: {
      supports(rule) {
        // Mover las reglas del @supports al nivel padre y eliminar el @supports
        const parent = rule.parent
        rule.nodes.forEach(node => {
          parent.insertBefore(rule, node)
        })
        rule.remove()
      }
    }
  }
}
removeSupportsPlugin.postcss = true

const postcssProcessor = postcss([
  postcssNesting(), // Solo nesting
  removeSupportsPlugin(), // Eliminar @supports
])

for (const filePath of componentFiles) {
  const componentName = filePath.split('/').pop().replace('.css', '')
  const temporaryOutputPath = `.tmp/${componentName}.css`

  // 1) Tailwind CLI -> CSS inicial
  await execa('tailwindcss', ['-i', filePath, '-o', temporaryOutputPath], { stdio: 'inherit', preferLocal: true })

  // 2) PostCSS processing -> procesa propiedades modernas  
  const cssContent = await fs.readFile(temporaryOutputPath, 'utf8')
  const processedResult = await postcssProcessor.process(cssContent, { from: filePath })

  // 3) CSS procesado -> JS object
  const parsedRoot = processedResult.root;
  if (!parsedRoot) {
    throw new Error(`Error parsing CSS: ${processedResult}`);
  }
  const cssObject = postcssJs.objectify(parsedRoot);
  const constantName = `${componentName}Styles`

  generatedComponentFile += `export const ${constantName} = ${JSON.stringify(cssObject, null, 2)}\n`
}
    
// 4) Main plugin: add components to all
await fs.writeFile('src/build/components.js', generatedComponentFile)