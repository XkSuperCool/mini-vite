import path from 'path'

export function isJsRequest(id: string) {
  id = cleanUrl(id)
	if (JS_TYPES_RE.test(id)) {
		return true
	}
	if (!path.extname(id) && !id.endsWith('/')) {
		return true
	}
  return false
}

export function cleanUrl(url: string) {
  return url.replace(HASH_RE, '').replace(QUERY_RE, '')
}

export const JS_TYPES_RE = /\.(?:j|t)sx?$|\.mjs$/
export const QUERY_RE = /\?.*$/s
export const HASH_RE = /#.*$/s
