import { z } from 'zod'

export const authHeadersSchema = z.object({
  authorization: z.string(),
})

export const authUnauthorizedResponseSchema = {
  401: z.object({
    message: z.enum([
      'Unauthorized',
      'Authentication token missing',
      'Invalid token',
      'Invalid token format',
    ]),
  }),
}

export const authForbiddenResponseSchema = {
  403: z.void(),
}

export const userNotFoundResponseSchema = {
  404: z.object({
    message: z.literal('User not found'),
  }),
}
