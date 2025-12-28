import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../../database/client.ts'
import { users } from '../../database/schema/users.ts'
import { auth } from '../../hooks/auth.ts'
import {
  getAuthenticatedUserFromRequest,
} from '../../lib/get-authenticated-user.ts'
import {
  authHeadersSchema,
  authUnauthorizedResponseSchema,
} from '../../schemas/auth-schema.ts'
import { userSchema } from '../../schemas/user-schema.ts'

export const profile: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/users/profile',
    {
      preHandler: auth,
      schema: {
        tags: ['Users'],
        headers: authHeadersSchema,
        description: 'Get current user info',
        response: {
          200: userSchema,
          ...authUnauthorizedResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const userData = getAuthenticatedUserFromRequest(request)

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userData.sub))
        .limit(1)

      return reply.status(200).send(user)
    },
  )
}
