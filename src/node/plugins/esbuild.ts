import path from 'path'
import { transform } from 'esbuild'
import type { Loader } from 'esbuild'
import { readFile } from 'fs-extra'
import { isJsRequest } from '../../server/middlewares/utils'
import type { Plugin } from '../plugin'

export function esbuildTransform(): Plugin {
  return {
    name: 'vite:esbuild-transform',

    async load(id) {
      if (isJsRequest(id)) {
        try {
          return await readFile(id, 'utf-8')
        } catch {
          return null
        }
      }
    },

    async transform(code, id) {
      if (isJsRequest(id)) {
        const extname = path.extname(id).slice(1)
        const { code: transformCode, map } = await transform(code, {
          target: 'esnext',
          format: 'esm',
          sourcemap: true,
          loader: extname as Loader
        })

				return {
					code: transformCode,
					map
				}
      }
      return null
    }
  }
}
