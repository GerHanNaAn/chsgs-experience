import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..')
const target=path.join(root,'versions/v3/public')
await fs.mkdir(target,{recursive:true})
for(const folder of ['brand','fonts']) await fs.cp(path.join(root,'assets-source',folder),path.join(target,folder),{recursive:true})
console.log('V3 assets ready: local brand and fonts.')
