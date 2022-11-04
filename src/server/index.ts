import connect from 'connect'
import { blue, green } from 'picocolors'
import { optimizer } from '../node/optimizer'
import { createPluginContainer } from '../node/pluginContainer'
import type { PluginContainer } from '../node/pluginContainer'
import type { Plugin } from '../node/plugin'
import { resolvePlugins } from '../node/plugins'

export interface ServerContext {
  root: string
  pluginContainer: PluginContainer
  app: connect.Server
  plugins: Plugin[]
}

export async function startDevServer() {
  const app = connect()
  const root = process.cwd()
  const startTime = Date.now()
  const plugins: Plugin[] = resolvePlugins()
  const pluginContainer = createPluginContainer(plugins)

  const serverContext: ServerContext = {
    app,
    plugins,
    pluginContainer,
    root: process.cwd()
  }

  for (const plugin of plugins) {
    if (plugin.configureServer) {
      await plugin.configureServer(serverContext)
    }
  }

  app.listen(3000, async () => {
    await optimizer(root)

    console.log(
      green('🚀 No-Bundle server restart done!'),
      `${Date.now() - startTime}ms`
    )
    console.log(`> local path: ${blue('http://localhost:3000')}`)
  })
}
