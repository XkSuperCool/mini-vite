import { NextHandleFunction } from 'connect'
import { isImportRequest } from './utils'
import sirv from 'sirv'

export function staticMiddleware(): NextHandleFunction {
  const serveFromroot = sirv('/', {
    dev: true,
    maxAge: 31536000, // 1Y
    immutable: true
  })
  return async (req, res, next) => {
    if (!req.url) return

    if (isImportRequest(req.url)) return
    
    serveFromroot(req, res, next)
  }
}
