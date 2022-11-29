import { Plugin } from '../plugin'
import { esbuildTransform } from './esbuild'
import { importAnalysis } from './importAnalysis'
import { resolvePlugin } from './resolve'
import { cssPlugin } from './css'
import { assetsPlugin } from './assets'
import { clientInjectPlugin } from './clientInject'

export function resolvePlugins(): Plugin[] {
  return [clientInjectPlugin(), resolvePlugin(), esbuildTransform(), importAnalysis(), cssPlugin(), assetsPlugin()]
}
