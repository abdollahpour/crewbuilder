import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const generatedRoot = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'generated')
const pragma = '// @ts-nocheck\n'

async function stamp(dir) {
  for (const name of await readdir(dir)) {
    const path = join(dir, name)
    if ((await stat(path)).isDirectory()) {
      await stamp(path)
      continue
    }

    if (!name.endsWith('.ts')) continue

    const source = await readFile(path, 'utf8')
    if (source.startsWith(pragma)) continue

    await writeFile(path, `${pragma}${source}`)
  }
}

await stamp(generatedRoot)
