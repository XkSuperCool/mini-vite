import path from 'path'
import { pathExists, readFile } from 'fs-extra'
import type { NextHandleFunction } from 'connect'
import type { ServerContext } from '../index'

export function indexHtmlMiddleare(ctx: ServerContext): NextHandleFunction {
	return async (req, res, next) => {
		if (req.url === '/') {
			const indexHtmlPath = path.join(ctx.root, 'index.html')
			if (await pathExists(indexHtmlPath)) {
				const rawHtml = await readFile(indexHtmlPath, 'utf-8')
				let html = rawHtml
				for (const plugin of ctx.plugins) {
					if (plugin.transformIndexHtml) {
						html = await plugin.transformIndexHtml(html)
					}
				}

				res.statusCode = 200
				res.setHeader('Content-Type', 'text/html')
				return res.end(html)
			}
		}

		return next()
	}
}