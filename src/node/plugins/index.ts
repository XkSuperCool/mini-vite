import { Plugin } from '../plugin'
import { esbuildTransform } from './esbuild'
import { importAnalysis } from './importAnalysis'
import { resolvePlugin } from './resolve'

export function resolvePlugins(): Plugin[] {
  return [resolvePlugin(), esbuildTransform(), importAnalysis()]
}
