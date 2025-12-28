import 'fastify'
import type { RoleType } from './role.js'

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      sub: string
      name: string
      role: RoleType
    }
  }
}
