// Rota não usada por motivos de segurança.
// Criada apenas para demonstração de como implementar a troca de senha.
// Em um sistema real, a troca de senha deve ser feita via
// fluxo de recuperação de senha.

import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../database/client.ts'
import { activeUsersView, users } from '../../database/schema/users.ts'
import { auth } from '../../hooks/auth.ts'
import {
  getAuthenticatedUserFromRequest,
} from '../../lib/get-authenticated-user.ts'
import {
  authHeadersSchema,
  authUnauthorizedResponseSchema,
} from '../../schemas/auth-schema.ts'

const changePasswordBodySchema = z.object({
  currentPassword: z.string().max(64),
  newPassword: z.string().min(8).max(64),
})

export const changePassword: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/users/change-password',
    {
      preHandler: auth,
      schema: {
        tags: ['Users'],
        headers: authHeadersSchema,
        description: 'Change current user password',
        body: changePasswordBodySchema,
        response: {
          204: z.void(),
          ...authUnauthorizedResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userData = getAuthenticatedUserFromRequest(request)

      const { currentPassword, newPassword } = request.body

      const [user] = await db
        .select()
        .from(activeUsersView)
        .where(eq(activeUsersView.id, userData.sub))
        .limit(1)

      const doesPasswordsMatch = await argon2
        .verify(user.passwordHash, currentPassword)

      if (!doesPasswordsMatch) {
        return reply.status(401).send({ message: 'Unauthorized' })
      }

      const newPasswordHash = await argon2.hash(newPassword)

      await db
        .update(users)
        .set({ passwordHash: newPasswordHash })
        .where(eq(users.id, userData.sub))

      return reply.status(204).send()
    },
  )
}
