import { describe, expect } from 'vitest'
import { server } from '../../src/server.ts'
import { test } from '../fixtures.ts'

describe('GET /users/profile', () => {
  test('should return the logged user information', async ({ user, token }) => {
    const response = await server.inject({
      method: 'GET',
      url: '/users/profile',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const body = JSON.parse(response.body)

    expect(response.statusCode).toBe(200)
    expect(user).toMatchObject(body)
    expect(body).not.toHaveProperty('passwordHash')
  })
})
