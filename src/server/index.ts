import connect from 'connect'
import { blue, green } from 'picocolors'

export async function startDevServer() {
  const app = connect()
  const root = process.cwd()
  const startTime = Date.now()

  app.listen(3000, async () => {

    console.log(
      green('🚀 No-Bundle server restart done!'),
      `${Date.now() - startTime}ms`
    )
		console.log(`> local path: ${blue('http://localhost:3000')}`)
  })
}
