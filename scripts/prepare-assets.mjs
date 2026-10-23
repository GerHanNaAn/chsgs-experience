import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicPath = path.join(project, 'public')
const sourceAssets = path.join(project, 'assets-source')
const legacy = path.join(sourceAssets, 'valve')
const output = path.join(publicPath, 'valve')

await fs.mkdir(publicPath, { recursive: true })
for (const [from, to] of [
  ['models', 'models'],
  ['fonts', 'fonts'],
]) await fs.cp(path.join(sourceAssets, from), path.join(publicPath, to), { recursive: true })
await fs.mkdir(path.join(publicPath, 'brand'), { recursive: true })
await fs.copyFile(path.join(sourceAssets, 'brand/ld-logo.svg'), path.join(publicPath, 'brand/ld-logo.svg'))
await fs.cp(legacy, output, { recursive: true, filter: source => !source.split(path.sep).includes('__qa') })

// A generated copy isolates the accepted product runtime from the new host.
// The source product project remains byte-for-byte unchanged.
let runtime = await fs.readFile(path.join(legacy, 'app.js'), 'utf8')
runtime = runtime.replace('renderer.setClearColor(0x262626,1)', 'renderer.setClearColor(0x080d16,1)')
runtime += '\n' + await fs.readFile(path.join(project, 'src/three/valve/embed-bridge.js'), 'utf8')
await fs.writeFile(path.join(output, 'app.js'), runtime)
let css = await fs.readFile(path.join(legacy, 'style.css'), 'utf8')
css += '\n:root{--ground:#080d16;scrollbar-width:none}::-webkit-scrollbar{display:none}.canvas-wrap{inset:104px 0 136px}.view-tools{top:104px;right:64px}.scroll-progress{display:none}.skip{display:none}.load-state{top:68%}\n'
await fs.writeFile(path.join(output, 'style.css'), css)
console.log('Assets ready: factory, brand, fonts and isolated DN400 runtime.')
