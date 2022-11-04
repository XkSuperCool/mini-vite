import path from 'path'
import { build } from 'esbuild'
import { green } from 'picocolors'
import { scanPlugin } from './scanPlugin'
import { preBuildPlugin } from './preBundlePlugin'
import { PRE_BUNDLE_DIR } from '../constants'

export async function optimizer(root: string) {
  const entry = path.resolve(root, 'src/main.tsx')
  const deps = new Set<string>()

  // 依赖查找
  await build({
    entryPoints: [entry],
    bundle: true,
    write: false,
    plugins: [scanPlugin(deps)]
  })

  console.log(
    green('需要预构建的依赖有: \n'),
    Array.from(deps)
      .map(green)
      .map(item => `	${item}`)
      .join('\n')
  )

  // 依赖预构建
  await build({
    entryPoints: [...deps],
    write: true,
    bundle: true,
    format: 'esm',
    splitting: true,
    outdir: path.resolve(root, PRE_BUNDLE_DIR),
    plugins: [preBuildPlugin(deps)]
  })
}
