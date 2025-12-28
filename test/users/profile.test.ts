import { describe, expect, test } from 'vitest'
import { server } from '../../src/server.ts'
import { makeAuthenticatedUser } from '../factories/make-user.ts'

describe('GET /users/profile', () => {
  test('should return the logged user information', async () => {
    const { token, user } = await makeAuthenticatedUser('manager')

    const response = await server.inject({
      method: 'GET',
      url: '/users/profile',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual(user)
  })
})
