import fs from 'fs-extra'
import path from 'path'
import type { Plugin } from '../plugin'
import type { ServerContext } from '../../server/index'

export const CLIENT_PUBLIC_PATH = "/@vite/client";
export function clientInjectPlugin(): Plugin {
	let serverContext: ServerContext
	return {
		name: 'vite:client-inject',

		configureServer(ctx) {
			serverContext = ctx
		},

		resolveId(id) {
			if (id === CLIENT_PUBLIC_PATH) {
				return { id }
			}

			return null
		},

		async load(id) {
			if (id === CLIENT_PUBLIC_PATH) {
				// 找到打包好的 client 文件
				const realPath = path.join(serverContext.root, 'node_modules', 'mini-vite', 'dist', 'client.mjs')
				const code = await fs.readFile(realPath, 'utf-8')

				return {
					code: code.replace('__HMR__PORT__', '24678')
				}
			}
		},

		transformIndexHtml(raw) {
			return raw.replace(/(<head[^]*>)/i, `$1<script type="module" src="${CLIENT_PUBLIC_PATH}"></script>`)
		}
	}
}