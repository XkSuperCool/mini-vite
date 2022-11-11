import { Plugin } from '../plugin'
import { esbuildTransform } from './esbuild'
import { importAnalysis } from './importAnalysis'
import { resolvePlugin } from './resolve'
import { cssPlugin } from './css'

export function resolvePlugins(): Plugin[] {
  return [resolvePlugin(), esbuildTransform(), importAnalysis(), cssPlugin()]
}
