import cac from 'cac'
import { startDevServer } from '../server'

const cli = cac()

cli
  .command('[root]', 'Run the development serve')
  .alias('serve')
  .alias('dev')
  .action(async () => {
    await startDevServer()
  })

cli.help()
cli.parse()
