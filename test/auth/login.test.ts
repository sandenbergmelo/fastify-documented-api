import { describe, expect } from 'vitest'
import { server } from '../../src/server.ts'
import { test } from '../fixtures.ts'

describe('POST /auth/login', () => {
  test('should return a token when credentials are valid', async (
    { user, passwordBeforeHash },
  ) => {
    const response = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: user.email,
        password: passwordBeforeHash,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      token: expect.any(String),
      type: 'Bearer',
    })
  })

  test('should return 401 when email is invalid', async (
    { passwordBeforeHash },
  ) => {
    const response = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: 'random@email.com',
        password: passwordBeforeHash,
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({
      error: 'Invalid email or password',
    })
  })

  test('should return 401 when password does not match', async ({ user }) => {
    const response = await server.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        email: user.email,
        password: 'wrong-password',
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({
      error: 'Invalid email or password',
    })
  })
})
