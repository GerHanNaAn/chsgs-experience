import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { build } from 'vite'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.resolve(project, 'dist')
const first = path.join(project, 'versions/v1')
const base = process.env.PAGES_BASE_PATH || '/'
if (!base.startsWith('/') || !base.endsWith('/') || /\.\.|[?#\\]/.test(base)) throw new Error('PAGES_BASE_PATH must be an absolute URL path ending in /')
// Only the fixed generated output of this checkout may be reset.
if (output !== path.join(project, 'dist')) throw new Error('Unexpected Pages output directory')
console.log(`Pages output: ${output}`)
await fs.rm(output, { recursive: true, force: true })
for (const [root, route] of [[first, 'v1'], [project, 'v2']]) {
  execFileSync(process.execPath, [path.join(root, 'scripts/prepare-assets.mjs')], { cwd: root, stdio: 'inherit' })
  await build({
    root,
    configFile: path.join(root, 'vite.config.js'),
    base: `${base}${route}/`,
    build: { outDir: path.join(output, route), emptyOutDir: true },
  })
}
await fs.copyFile(path.join(project, 'pages/index.html'), path.join(output, 'index.html'))
await fs.writeFile(path.join(output, '.nojekyll'), '')
const preserved = JSON.parse(await fs.readFile(path.join(project, 'versions/preserved.json'), 'utf8'))
await fs.writeFile(path.join(output, 'versions.json'), JSON.stringify({
  releaseRevision: process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { cwd: project, encoding: 'utf8' }).trim(),
  v1: { route: `${base}v1/`, preservedRevision: preserved.revision },
  v2: { route: `${base}v2/` },
}, null, 2) + '\n')
console.log(`Both versions ready: ${base}v1/ and ${base}v2/`)
