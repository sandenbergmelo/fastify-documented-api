import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
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

const updateUserSchema = z.object({
  currentPassword: z.string().min(8).max(64),
  name: z.string().min(3).max(100).optional(),
  email: z.email().optional(),
})

type UpdateUserSchema = z.infer<typeof updateUserSchema>

export const updateUser: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/users',
    {
      preHandler: auth,
      schema: {
        tags: ['Users'],
        headers: authHeadersSchema,
        description: 'Update User Information',
        body: updateUserSchema,
        response: {
          204: z.void(),
          409: z.void(),
          ...authUnauthorizedResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const loggedUser = getAuthenticatedUserFromRequest(request)

      const { currentPassword, name, email } = request.body

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

      const updatedFields: Omit<UpdateUserSchema, 'currentPassword'> = {}

      if (name) {
        updatedFields.name = name
      }

      if (email) {
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        if (existingUser && existingUser.id !== loggedUser.sub) {
          return reply.status(409).send()
        }

        updatedFields.email = email
      }

      await db
        .update(users)
        .set(updatedFields)
        .where(eq(users.id, loggedUser.sub))

      return reply.status(204).send()
    },
  )
}
