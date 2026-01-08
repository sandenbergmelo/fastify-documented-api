import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../database/client.ts'
import { activeUsersView } from '../../database/schema/users.ts'
import { auth } from '../../hooks/auth.ts'
import { checkUserRole } from '../../hooks/check-role.ts'
import {
  authForbiddenResponseSchema,
  authHeadersSchema,
  authUnauthorizedResponseSchema,
  userNotFoundResponseSchema,
} from '../../schemas/auth-schema.ts'
import { publicUserSchema } from '../../schemas/user-schema.ts'

const paramsSchema = z.object({
  id: z.uuid(),
})

export const getUserInfo: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/users/:id',
    {
      preHandler: [
        auth,
        checkUserRole('manager'),
      ],
      schema: {
        tags: ['Users'],
        description: 'Get information from a user',
        headers: authHeadersSchema,
        params: paramsSchema,
        response: {
          200: publicUserSchema,
          ...userNotFoundResponseSchema,
          ...authUnauthorizedResponseSchema,
          ...authForbiddenResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const [user] = await db.select()
        .from(activeUsersView)
        .where(eq(activeUsersView.id, id))

      if (!user) {
        return reply.status(404).send({ message: 'User not found' })
      }

      return reply.status(200).send(user)
    },
  )
}
