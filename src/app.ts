import { env } from './env.ts'
import { server } from './server.ts'

server.listen({ port: env.PORT, host: '0.0.0.0' }).then(() => {
  server.log.info(`Server DOCS at http://localhost:${env.PORT}/docs`)
})
