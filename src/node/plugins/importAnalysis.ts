import path from 'path'
import resolve from 'resolve'
import MagicString from 'magic-string'
import { pathExists } from 'fs-extra'
import { init, parse } from 'es-module-lexer'
import { cleanUrl, isJsRequest } from '../../server/middlewares/utils'
import {
  BARE_IMPORT_RE,
  DEFAULT_EXTERSIONS,
  PRE_BUNDLE_DIR
} from '../constants'
import type { Plugin } from '../plugin'
import type { ServerContext } from '../../server/index'

export function importAnalysis(): Plugin {
  let serverContext: ServerContext
  return {
    name: 'vite:import-analysis',

    configureServer(ctx) {
      serverContext = ctx
    },

    async transform(code, id) {
      if (!isJsRequest(id)) {
        return null
      }

      await init
      const [imports] = parse(code)
      const ms = new MagicString(code)
      const { moduleGraph } = serverContext
      const mod = moduleGraph.getModuleById(id)!
      const importedModules = new Set<string>()
      for (const importInfo of imports) {
        // import React from 'react'
        // s = 18, e = 25, n = 'react'
        const { s: modStart, e: modEnd, n: modSource } = importInfo
        if (!modSource) continue

        if (modSource.endsWith('.jpeg')) {
          const resolvedUrl = path.join(path.dirname(id), modSource)
          ms.overwrite(modStart, modEnd, `${resolvedUrl}?import`)
          continue
        }

        // 第三方库: 路径重写到预构建产物路径
        if (BARE_IMPORT_RE.test(modSource)) {
          const bundlePath = path.join(
            serverContext.root,
            PRE_BUNDLE_DIR,
            `${modSource}.js`
          )
          importedModules.add(bundlePath)

					// 'react' -> '${root}/node_module/.m-vite/react.js'
					// 将第三方的导入指向预构建的内容
					ms.overwrite(modStart, modEnd, bundlePath)
        } else if (modSource.startsWith('.') || modSource.startsWith('/')) {
					const resolved = await this.resolve(modSource, id)
					if (resolved) {
						ms.overwrite(modStart, modEnd, resolved.id)
            importedModules.add(resolved.id)
					}
				}
      }
      // 记录模块信息，形成模块树
      moduleGraph.updateModuleInfo(mod, importedModules)
			return {
				code: ms.toString(),
				map: ms.generateMap()
			}
    }
  }
}
