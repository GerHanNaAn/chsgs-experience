import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const output = path.join(project, 'dist')
const manifest = JSON.parse(await fs.readFile(path.join(output, 'versions.json'), 'utf8'))
const preserved = JSON.parse(await fs.readFile(path.join(project, 'versions/preserved.json'), 'utf8'))
const chooser = await fs.readFile(path.join(output, 'index.html'), 'utf8')
await fs.access(path.join(output, '.nojekyll'))
assert.equal(manifest.v1.preservedRevision, preserved.revision)
assert.match(manifest.releaseRevision, /^[a-f0-9]{40}$/)

for (const version of ['v1', 'v2', 'v3']) {
  const route = manifest[version].route
  assert.ok(route.startsWith('/') && route.endsWith(`/${version}/`), `Invalid route for ${version}`)
  assert.ok(chooser.includes(`href="./${version}/"`), `Chooser misses ${version}`)
  const html = await fs.readFile(path.join(output, version, 'index.html'), 'utf8')
  const entryReferences = [...html.matchAll(/(?:src|href)=["']([^"']+)["']/g)].map(m => m[1])
  let checked = 0
  async function localAsset(reference, parent) {
    if (/^(?:data:|https?:|#)/.test(reference)) return
    const url = new URL(reference, parent)
    assert.ok(url.pathname.startsWith(route), `${version}: asset escapes its route: ${reference}`)
    const relative = decodeURIComponent(url.pathname.slice(route.length))
    const file = path.resolve(output, version, relative)
    assert.ok(file.startsWith(path.join(output, version) + path.sep), 'Asset outside output')
    assert.ok((await fs.stat(file)).isFile(), `Missing ${file}`)
    checked++
    if (file.endsWith('.css')) {
      const css = await fs.readFile(file, 'utf8')
      for (const match of css.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)) await localAsset(match[1], url)
    }
  }
  for (const reference of entryReferences) await localAsset(reference, `https://pages.invalid${route}`)
  assert.ok(checked >= 3, `No application assets checked for ${version}`)
  assert.ok(!html.includes('/review/v3/') && !html.includes('127.0.0.1'), 'Local preview leaked')
  console.log(`${version}: entry, ${checked} assets, fonts and route verified (${route})`)
}
