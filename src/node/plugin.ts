import type { PluginContext, LoadResult, PartialResolvedId, SourceDescription } from 'rollup'
import type { ServerContext } from '../server'

export type ServerHook = (
  server: ServerContext
) => (() => void) | void | Promise<(() => void) | void>

export interface Plugin {
  name: string
  configureServer?: ServerHook
  resolveId?: (
    id: string,
    importer?: string
  ) => Promise<PartialResolvedId | null> | PartialResolvedId | null
  load?: (id: string) => Promise<LoadResult | null> | LoadResult | null
  transform?: (
    this: PluginContext,
    code: string,
    id: string
  ) => Promise<SourceDescription | null> | SourceDescription | null
  transformIndexHtml?: (raw: string) => Promise<string> | string
}
