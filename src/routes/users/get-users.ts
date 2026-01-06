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
} from '../../schemas/auth-schema.ts'
import { publicUserSchema } from '../../schemas/user-schema.ts'

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
})

export const getUsers: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/users',
    {
      preHandler: [
        auth,
        checkUserRole('manager'),
      ],
      schema: {
        tags: ['Users'],
        description: 'Get users with pagination',
        headers: authHeadersSchema,
        querystring: querySchema,
        response: {
          200: z.object({ users: z.array(publicUserSchema) }),
          ...authUnauthorizedResponseSchema,
          ...authForbiddenResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { limit, offset } = request.query

      const fetchedUsers = await db
        .select()
        .from(activeUsersView)
        .limit(limit)
        .offset(offset)

      return reply.status(200).send({ users: fetchedUsers })
    },
  )
}
