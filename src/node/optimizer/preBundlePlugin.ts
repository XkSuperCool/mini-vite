import fse from 'fs-extra'
import resolve from 'resolve'
import path from 'path'
import createDebug from 'debug'
import { init, parse } from 'es-module-lexer'
import type { Plugin, Loader } from 'esbuild'
import { BARE_IMPORT_RE } from '../constants'

const debug = createDebug('dev')

export function preBuildPlugin(deps: Set<string>): Plugin {
  return {
    name: 'esbuild:pre-build',

    setup(build) {
      build.onResolve({ filter: BARE_IMPORT_RE }, resolveInfo => {
        const { path: id, importer } = resolveInfo
        const isEntry = !importer

        if (deps.has(id)) {
          return isEntry
            ? {
                path: id,
                namespace: 'dep'
              }
            : {
                // 解析出依赖的绝对路, 'react' -> [...绝对路径]/node_modules/react/index.js
                path: resolve.sync(id, { basedir: process.cwd() })
              }
        }
      })

      build.onLoad({ filter: /.*/, namespace: 'dep' }, async options => {
        await init
        const id = options.path
        const root = process.cwd()
        const entryPath = resolve.sync(id, { basedir: root })
        const code = await fse.readFile(entryPath, 'utf-8')
        const [imports, exports] = await parse(code)

				// 代理模块的作用为增加一个文件用来导出 es module
        const proxyModule = []

        if (!imports.length && !exports.length) {
          // cjs 处理
          const specifiers = Object.keys(require(entryPath))
          proxyModule.push(
						// exports.xx 处理, 这使其可以使用 import { useState } from 'react'
            `export { ${specifiers.join(',')} } from '${entryPath}'`,
						// export.defaults 处理, 这使其可以使用 import React from 'react'
            `export default require('${entryPath}')`
          )
        } else {
          // esm 处理
          if (exports.includes('default' as any)) {
            proxyModule.push(`import d from '${entryPath}'; export default d`)
          }

          proxyModule.push(`export * from '${entryPath}'`)
        }

				debug('proxy module: ', proxyModule.join('\n'))

        return {
          resolveDir: root,
          contents: proxyModule.join('\n'),
          loader: path.extname(entryPath).slice(1) as Loader // js \ ts \ tsx ...
        }
      })
    }
  }
}
