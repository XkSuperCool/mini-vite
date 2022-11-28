import connect from 'connect'
import { blue, green } from 'picocolors'
import { optimizer } from '../node/optimizer'
import { createPluginContainer } from '../node/pluginContainer'
import type { PluginContainer } from '../node/pluginContainer'
import type { Plugin } from '../node/plugin'
import { resolvePlugins } from '../node/plugins'
import { indexHtmlMiddleare } from './middlewares/indexHtml'
import { transformMiddleware } from './middlewares/transform'
import { staticMiddleware } from './middlewares/static'
import { ModuleGraph } from '../node/ModuleGraph'

export interface ServerContext {
  root: string
  pluginContainer: PluginContainer
  app: connect.Server
  plugins: Plugin[]
  moduleGraph: ModuleGraph
}

export async function startDevServer() {
  const app = connect()
  const root = process.cwd()
  const startTime = Date.now()
  const plugins: Plugin[] = resolvePlugins()
  const pluginContainer = createPluginContainer(plugins)
  const moduleGraph = new ModuleGraph((url) => pluginContainer.resolveId(url))

  const serverContext: ServerContext = {
    app,
    plugins,
    pluginContainer,
    root: process.cwd(),
    moduleGraph
  }

  for (const plugin of plugins) {
    if (plugin.configureServer) {
      await plugin.configureServer(serverContext)
    }
  }

  app
    .use(indexHtmlMiddleare(serverContext))
    .use(transformMiddleware(serverContext))

  app.use(staticMiddleware())

  app.listen(3001, async () => {
    await optimizer(root)

    console.log(
      green('🚀 No-Bundle server restart done!'),
      `${Date.now() - startTime}ms`
    )
    console.log(`> local path: ${blue('http://localhost:3001')}`)
  })
}
