import { readFile } from 'fs-extra'
import type { Plugin } from '../plugin'

export function cssPlugin(): Plugin {
	return {
		name: 'vite:css',

		load(id) {
			if (id.endsWith('css')) {
				return readFile(id, 'utf-8')
			}
		},

		async transform(code, id) {
			if (id.endsWith('css')) {
				code = `
					const cssCode = '${code.replace(/\n/g, '')}'
					const styleEl = document.createElement('style')
					styleEl.setAttribute('type', 'text/css')
					styleEl.innerHTML = cssCode
					document.head.appendChild(styleEl)
					export default cssCode
				`

				return {
					code
				}
			}
			return null
		}
	}
}