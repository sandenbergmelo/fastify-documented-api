import { describe, expect } from 'vitest'
import { server } from '../../src/server.ts'
import { test } from '../fixtures.ts'

describe('POST /users', () => {
  test('should create a user', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        name: 'John Doe',
        email: 'example@email.com',
        password: 'secret',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(JSON.parse(response.body)).toEqual({
      userId: expect.any(String),
    })
  })

  test('should return 409 when email already exists', async ({
    user, passwordBeforeHash,
  }) => {
    const response = await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        name: user.name,
        email: user.email,
        password: passwordBeforeHash,
      },
    })

    expect(response.statusCode).toBe(409)
    expect(JSON.parse(response.body)).toEqual({
      error: 'Conflict',
    })
  })
})
