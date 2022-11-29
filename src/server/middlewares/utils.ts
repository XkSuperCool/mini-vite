import path from 'path'
import os from "os";

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

export function isCSSRequest(id: string) {
	return cleanUrl(id).endsWith('css')
}

export function isImportRequest(id: string) {
	return id.endsWith('?import')
}

export function cleanUrl(url: string) {
  return url.replace(HASH_RE, '').replace(QUERY_RE, '')
}

export const JS_TYPES_RE = /\.(?:j|t)sx?$|\.mjs$/
export const QUERY_RE = /\?.*$/s
export const HASH_RE = /#.*$/s

export function slash(p: string): string {
  return p.replace(/\\/g, "/");
}

export const isWindows = os.platform() === "win32";

export function normalizePath(id: string): string {
  return path.posix.normalize(isWindows ? slash(id) : id);
}

