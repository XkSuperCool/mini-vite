import path from 'path'
import resolve from 'resolve'
import { pathExists } from 'fs-extra'
import { cleanUrl } from '../../server/middlewares/utils'
import { DEFAULT_EXTERSIONS } from '../constants'
import type { Plugin } from '../plugin'
import type { ServerContext } from '../../server/index'

export function resolvePlugin(): Plugin {
  let serverContext: ServerContext
  return {
    name: 'vite:resolve',

    configureServer(ctx) {
      serverContext = ctx
    },

    async resolveId(id, importer) {
      // 绝对路径: /main.ts
      if (path.isAbsolute(id)) {
        if (await pathExists(id)) {
          return { id }
        }

        id = path.join(serverContext.root, id)
        if (await pathExists(id)) {
          return { id }
        }
      }
      // 相对路径
      else if (id.startsWith('.')) {
        if (!importer) {
          throw new Error('`importer` should not be undefined')
        }

        let resolveId: string
        // ./main.js -> .js, 是否保护扩展名
        const hasExtension = path.extname(id).length > 1
        if (hasExtension) {
					// basedir: ./src/index.js -> ./src
          resolveId = resolve.sync(id, { basedir: path.dirname(importer) })
          if (await pathExists(resolveId)) {
            return {
              id: resolveId
            }
          }
        } else {
					// 尝试寻找不同扩展名文件
          for (const extname of DEFAULT_EXTERSIONS) {
            try {
              const withExtension = `${id}${extname}`
              resolveId = resolve.sync(withExtension, {
                basedir: path.dirname(importer)
              })
							if (await pathExists(resolveId)) {
								return { id: resolveId }
							}
            } catch {
              continue
            }
          }
        }
      }

      return null
    }
  }
}
