import type { NextHandleFunction } from 'connect'
import type { ServerContext } from '../index'
import { cleanUrl, isJsRequest } from './utils'

export async function transformRequest(url: string, ctx: ServerContext) {
	const pluginContainer = ctx.pluginContainer
	url = cleanUrl(url)
	const resolveResult = await pluginContainer.resolveId(url)
	let transformResult;
	if (resolveResult?.id) {
		let code = await pluginContainer.load(resolveResult.id)
		if (typeof code === 'object' && code !== null) {
			code = code.code
		}
		if (code) {
			transformResult = await pluginContainer.transform(code, resolveResult.id)
		}
	}

	return transformResult
}

export function transformMiddleware(ctx: ServerContext): NextHandleFunction {
  return async (req, res, next) => {
    if (req.method !== 'GET' || !req.url) {
      return next()
    }

    if (isJsRequest(req.url)) {
      const url = req.url
      const result = await transformRequest(url, ctx)
      if (!result) {
        return next()
      }
			
      res.statusCode = 200
      res.setHeader('Content-Type', 'application/javascript')
      res.end(result.code)
    }

    next()
  }
}
