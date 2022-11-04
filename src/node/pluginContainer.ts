import type {
	LoadResult,
	PartialResolvedId,
	SourceDescription,
	PluginContext as RollupPluginContext,
	ResolvedId,
} from 'rollup'
import { Plugin } from './plugin'

export interface PluginContainer {
	resolveId(id: string, importer?: string): Promise<PartialResolvedId | null>
	load(id: string): Promise<LoadResult | null>
	transform(code: string, id: string): Promise<SourceDescription | null>
}

export function createPluginContainer(plugins: Plugin[]): PluginContainer {
	// @ts-ignore
	class Context implements RollupPluginContext {
		async resolve(id: string, importer?: string) {
			let ret = await container.resolveId(id, importer)
			if (typeof ret === 'string') {
				ret = { id: ret }
			}

			return ret as ResolvedId | null
		}
	}

	const container: PluginContainer = {
		async resolveId(id, importer) {
			const ctx = new Context()
			for (const plugin of plugins) {
				if (plugin.resolveId) {
					const newId = await plugin.resolveId.call(ctx, id, importer)

					if (newId) {
						id = typeof newId === 'string' ? newId : newId.id
						return { id }
					}
				}
			}

			return null
		},

		async load(id) {
			const ctx = new Context()
			for (const plugin of plugins) {
				if (plugin.load) {
					const code = await plugin.load.call(ctx, id)

					if (code) {
						return code
					}
				}
			}

			return null
		},

		async transform(code, id) {
			const ctx = new Context()
			for (const plugin of plugins) {
				if (plugin.transform) {
					const result = await plugin.transform.call(ctx, code, id)
					if (result) {
						code = typeof result === 'string' ? result : result.code
					}
				}
			}

			return { code }
		}
	}

	return container
}