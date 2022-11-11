import { cleanUrl } from "../../server/middlewares/utils";
import type { Plugin } from "../plugin";

export function assetsPlugin(): Plugin {
	return {
		name: 'vite:assets',

		load(id) {
			const cleanedId = cleanUrl(id).replace('?import', '')
			if (cleanedId.endsWith('.jpeg')) {
				return {
					code: `export default '${cleanedId}'`
				}
			}
			return null
		}
	}
}