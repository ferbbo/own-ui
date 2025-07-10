import execa from 'execa';             // ejecución de CLI moderna :contentReference[oaicite:4]{index=4}
import fg from 'fast-glob'                 // localizar archivos rápido :contentReference[oaicite:5]{index=5}
import fs from 'node:fs/promises'          // escribir archivo plugin :contentReference[oaicite:6]{index=6}
import postcss from 'postcss'
import postcssJs from 'postcss-js'

const Componentsfiles = await fg('src/components/*.css')
let componentFile = ''

for (const path of Componentsfiles) {
  const name = path.split('/').pop().replace('.css', '') // p.ej. "button"
  const tmp   = `.tmp/${name}.css`

  // 1) Tailwind CLI -> CSS minificado
  await execa('tailwindcss', ['-i', path, '-o', tmp, '--minify'], { stdio: 'inherit', preferLocal: true }) // :contentReference[oaicite:7]{index=7}

  // 2) CSS -> objeto JS
  const css   = await fs.readFile(tmp, 'utf8')
  const result = await postcss().process(css, { from: undefined });
  const root = result?.root;
  if (!root) {
    throw new Error(`Error parsing CSS: ${result}`);
  }
  const obj = postcssJs.objectify(root);
  //const obj   = postcssJs.objectify(postcss.parse(css))               // :contentReference[oaicite:8]{index=8}
  const constName = `${name}Styles`

  componentFile += `export const ${constName} = ${JSON.stringify(obj)}\n`
}
    
// 3) plugin principal: addComponents a todos
await fs.writeFile('src/build/components.js', componentFile)
