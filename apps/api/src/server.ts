import { createServer } from 'http'
import app              from './app'
import { connectDB }    from './config/database'
import { env }          from './config/env'
import { logger }       from './config/logger'
import { initSockets }  from './sockets'

async function main() {
  await connectDB()
  const server = createServer(app)
  initSockets(server)
  server.listen(env.PORT, () => logger.info(`🚀 http://localhost:${env.PORT}`))
}
main().catch(e => { logger.error(e); process.exit(1) })
