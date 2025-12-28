import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../database/client.ts'
import { users } from '../../database/schema/users.ts'
import { auth } from '../../hooks/auth.ts'
import { checkUserRole } from '../../hooks/check-role.ts'
import {
  authForbiddenResponseSchema,
  authHeadersSchema,
  authUnauthorizedResponseSchema,
  userNotFoundResponseSchema,
} from '../../schemas/auth-schema.ts'
import { allRoles } from '../../schemas/role.ts'

const paramsSchema = z.object({
  id: z.uuid(),
})

const bodySchema = z.object({
  role: z.enum(allRoles),
})

export const updateUserRole: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/users/update-role/:id',
    {
      preHandler: [
        auth,
        checkUserRole('manager'),
      ],
      schema: {
        tags: ['Users'],
        description: 'Update a user\'s role by ID',
        headers: authHeadersSchema,
        params: paramsSchema,
        body: bodySchema,
        response: {
          204: z.void(),
          ...authUnauthorizedResponseSchema,
          ...authForbiddenResponseSchema,
          ...userNotFoundResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params
      const { role } = request.body

      const existingUser = await db.query.users.findFirst({
        where: eq(users.id, id),
      })

      if (!existingUser) {
        return reply.status(404).send({ message: 'User not found' })
      }

      await db
        .update(users)
        .set({ role })
        .where(eq(users.id, id))

      return reply.status(204).send()
    },
  )
}
