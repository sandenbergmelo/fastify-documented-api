import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
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

const updateUserSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.email().optional(),
})

type UpdateUserSchema = z.infer<typeof updateUserSchema>

export const updateUser: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/users',
    {
      preHandler: [
        auth,
        passwordConfirmation,
      ],
      schema: {
        tags: ['Users'],
        headers: authHeadersSchema,
        description: 'Update User Information',
        body: updateUserSchema.extend(passwordConfirmationSchema.shape),
        response: {
          204: z.void(),
          409: z.void(),
          ...authUnauthorizedResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const loggedUser = getAuthenticatedUserFromRequest(request)

      const { name, email } = request.body

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
