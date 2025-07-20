import execa from 'execa';
import fg from 'fast-glob'
import fs from 'node:fs/promises'
import postcss from 'postcss'
import postcssJs from 'postcss-js'

const componentFiles = await fg('src/components/*.css')
let generatedComponentFile = ''

for (const filePath of componentFiles) {
  const componentName = filePath.split('/').pop().replace('.css', '')
  const temporaryOutputPath = `.tmp/${componentName}.css`

  // 1) Tailwind CLI -> minified CSS
  await execa('tailwindcss', ['-i', filePath, '-o', temporaryOutputPath, '--minify'], { stdio: 'inherit', preferLocal: true })

  // 2) CSS -> JS object
  const cssContent = await fs.readFile(temporaryOutputPath, 'utf8')
  const result = await postcss().process(cssContent, { from: undefined });
  const parsedRoot = result?.root;
  if (!parsedRoot) {
    throw new Error(`Error parsing CSS: ${result}`);
  }
  const cssObject = postcssJs.objectify(parsedRoot);
  const constantName = `${componentName}Styles`

  generatedComponentFile += `export const ${constantName} = ${JSON.stringify(cssObject)}\n`
}
    
// 3) Main plugin: add components to all
await fs.writeFile('src/build/components.js', generatedComponentFile)
