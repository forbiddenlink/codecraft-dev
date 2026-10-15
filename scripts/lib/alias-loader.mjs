// Minimal "@/..." -> "src/..." resolver so build scripts can import the game's data modules.
import { existsSync } from 'node:fs'
import { resolve as resolvePath } from 'node:path'
import { pathToFileURL } from 'node:url'

export async function resolve(specifier, context, next) {
  if (specifier.startsWith('@/')) {
    const base = resolvePath(process.cwd(), 'src', specifier.slice(2))
    for (const candidate of [`${base}.ts`, `${base}.tsx`, resolvePath(base, 'index.ts')]) {
      if (existsSync(candidate)) return next(pathToFileURL(candidate).href, context)
    }
  }
  return next(specifier, context)
}
