import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

export const root: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['Root'],
        description: 'Hello World Endpoint',
        response: {
          200: z.literal('Hello from the API!'),
        },
      },
    },
    () => 'Hello from the API!' as const,
  )
}
