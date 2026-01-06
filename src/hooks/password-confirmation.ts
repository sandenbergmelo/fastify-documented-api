import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import type { FastifyReply, FastifyRequest } from 'fastify'
import { db } from '../database/client.ts'
import { activeUsersView } from '../database/schema/users.ts'
import {
  getAuthenticatedUserFromRequest,
} from '../lib/get-authenticated-user.ts'

export async function passwordConfirmation(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { currentPassword } = request.body as { currentPassword: string }

    if (!currentPassword || typeof currentPassword !== 'string') {
      return reply.status(401).send({ message: 'Unauthorized' })
    }

    const loggedUser = getAuthenticatedUserFromRequest(request)

    const [fetchedUser] = await db
      .select()
      .from(activeUsersView)
      .where(eq(activeUsersView.id, loggedUser.sub))
      .limit(1)

    const doesPasswordsMatch = await argon2
      .verify(fetchedUser.passwordHash, currentPassword)

    if (!doesPasswordsMatch) {
      return reply.status(401).send({ message: 'Unauthorized' })
    }
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' })
  }
}
