import type { Plugin } from 'esbuild'
import { BARE_IMPORT_RE, EXTERNAL_TYPES } from '../constants'

export function scanPlugin(deps: Set<string>): Plugin {
	return {
		name: 'esbuild:scan-deps',
	
		setup(build) {
			build.onResolve({ filter: new RegExp(`\\.(${EXTERNAL_TYPES.join('|')})$`) }, (options) => {
				return {
					path: options.path,
					external: true
				}
			})

			build.onResolve({ filter: BARE_IMPORT_RE }, (options) => {
				const id = options.path
				deps.add(id)
				return {
					path: id,
					external: true
				}
			})
		}
	}
}