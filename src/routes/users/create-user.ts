import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../database/client.ts'
import { users } from '../../database/schema/users.ts'

const createUserSchema = z.object({
  name: z.string().min(3),
  email: z.email(),
  password: z.string().min(4),
})

const createdUserResponseSchema = z.object({
  userId: z.uuid(),
})

export const createUser: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Users'],
        description: 'Create a new user',
        body: createUserSchema,
        response: {
          201: createdUserResponseSchema,
          409: z.object({ error: z.literal('Conflict') }),
          500: z.object({ error: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { name, email, password } = request.body

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)
        .then((rows) => rows[0])

      if (existingUser) {
        return reply.status(409).send({ error: 'Conflict' })
      }

      const passwordHash = await argon2.hash(password)

      const [user] = await db
        .insert(users)
        .values({ name, email, passwordHash, role: 'regular' })
        .returning({
          id: users.id,
        })

      /* v8 ignore if -- @preserve */
      if (!user) {
        return reply.status(500).send({ error: 'Failed to create user' })
      }

      return reply.status(201).send({ userId: user.id })
    },
  )
}
