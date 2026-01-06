import * as argon2 from 'argon2'
import { eq } from 'drizzle-orm'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { db } from '../../database/client.ts'
import { activeUsersView } from '../../database/schema/users.ts'
import { jwt } from '../../lib/jwt.ts'

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(4),
})

const loginResponseSchema = z.object({
  token: z.string(),
  type: z.literal('Bearer'),
})

export const login: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        description: 'Login a user',
        body: loginSchema,
        response: {
          401: z.object({ error: z.literal('Invalid email or password') }),
          200: loginResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body

      const [user] = await db
        .select()
        .from(activeUsersView)
        .where(eq(activeUsersView.email, email))
        .limit(1)

      if (!user) {
        return reply.status(401)
          .send({ error: 'Invalid email or password' })
      }

      const doesPasswordsMatch = await argon2
        .verify(user.passwordHash, password)

      if (!doesPasswordsMatch) {
        return reply.status(401)
          .send({ error: 'Invalid email or password' })
      }

      const token = await jwt
        .createAccessToken({ sub: user.id, name: user.name, role: user.role })

      return reply.status(200).send({ token, type: 'Bearer' })
    },
  )
}
