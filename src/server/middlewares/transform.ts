import type { NextHandleFunction } from 'connect'
import type { ServerContext } from '../index'
import { cleanUrl, isJsRequest, isCSSRequest, isImportRequest } from './utils'

export async function transformRequest(url: string, ctx: ServerContext) {
  const pluginContainer = ctx.pluginContainer
  url = cleanUrl(url)
  let mod = await ctx.moduleGraph.getModuleByUrl(url)

  // 缓存模块编译后的产物，在热更新时会使用到
  if (mod && mod.transformResult) {
    return mod.transformResult
  }

  const resolveResult = await pluginContainer.resolveId(url)
  let transformResult
  if (resolveResult?.id) {
    let code = await pluginContainer.load(resolveResult.id)
    if (typeof code === 'object' && code !== null) {
      code = code.code
    }

    await ctx.moduleGraph.ensureEntryFromUrl(url)

    if (code) {
      transformResult = await pluginContainer.transform(code, resolveResult.id)
    }
  }
  
  if (mod) {
    mod.transformResult = transformResult
  }

  return transformResult
}

export function transformMiddleware(ctx: ServerContext): NextHandleFunction {
  return async (req, res, next) => {
    if (req.method !== 'GET' || !req.url) {
      return next()
    }
 
    if (
      isJsRequest(req.url) ||
      isCSSRequest(req.url) ||
      isImportRequest(req.url)
    ) {
      const url = req.url
      const result = await transformRequest(url, ctx)
      if (!result) {
        return next()
      }

      res.statusCode = 200
      res.setHeader('Content-Type', 'application/javascript')
      res.end(result.code)
      return
    }

    next()
  }
}
