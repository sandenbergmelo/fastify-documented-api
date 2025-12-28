import { describe, expect, test } from 'vitest'
import { server } from '../../src/server.ts'
import { makeAuthenticatedUser } from '../factories/make-user.ts'

describe('GET /users', () => {
  test('should return 1 user', async () => {
    const { token, user } = await makeAuthenticatedUser('manager')

    const response = await server.inject({
      method: 'GET',
      url: '/users',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual({
      users: [user],
    })
  })
})
