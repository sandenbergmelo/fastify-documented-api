import { describe, expect } from 'vitest'
import { server } from '../../src/server.ts'
import { test } from '../fixtures.ts'

describe('GET /users/:id', () => {
  test.scoped({ userRole: 'manager' })

  test('should return user info', async ({ token, anotherUser }) => {
    const response = await server.inject({
      method: 'GET',
      url: `/users/${anotherUser.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(anotherUser).toMatchObject(response.json())
    expect(response.json()).not.toHaveProperty('passwordHash')
    expect(response.json()).not.toHaveProperty('deletedAt')
  })
})
