/* eslint-disable drizzle/enforce-delete-with-where */
import { eq, sql } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { db } from '../../database/client.ts'
import { users } from '../../database/schema/users.ts'
import { auth } from '../../hooks/auth.ts'
import { passwordConfirmation } from '../../hooks/password-confirmation.ts'
import {
  getAuthenticatedUserFromRequest,
} from '../../lib/get-authenticated-user.ts'
import {
  authHeadersSchema,
  authUnauthorizedResponseSchema,
} from '../../schemas/auth-schema.ts'
import { passwordConfirmationSchema } from '../../schemas/user-schema.ts'

export const deleteUser: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/users',
    {
      preHandler: [
        auth,
        passwordConfirmation,
      ],
      schema: {
        tags: ['Users'],
        headers: authHeadersSchema,
        description: 'Soft delete the authenticated user account.',
        body: passwordConfirmationSchema,
        response: {
          204: z.void(),
          ...authUnauthorizedResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const loggedUser = getAuthenticatedUserFromRequest(request)

      await db
        .update(users)
        .set({ deletedAt: sql`now()` })
        .where(eq(users.id, loggedUser.sub))

      return reply.status(204).send()
    },
  )
}
