import type { FastifyReply, FastifyRequest } from 'fastify'
import { jwt } from '../lib/jwt.ts'

export async function auth(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization

    if (!authHeader) {
      return reply.status(401).send({ message: 'Authentication token missing' })
    }

    if (!authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ message: 'Invalid token format' })
    }

    const token = authHeader.replace('Bearer ', '')
    const payload = await jwt.verifyAccessToken(token)

    if (!payload) {
      return reply.status(401).send({ message: 'Invalid token' })
    }

    request.user = payload
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
