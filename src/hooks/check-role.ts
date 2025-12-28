import type { FastifyReply, FastifyRequest } from 'fastify'
import {
  getAuthenticatedUserFromRequest,
} from '../lib/get-authenticated-user.ts'
import type { UserRole } from '../schemas/role.ts'

export function checkUserRole(role: UserRole) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = getAuthenticatedUserFromRequest(request)

    if (user.role !== role) {
      return reply.status(403).send()
    }
  }
}
