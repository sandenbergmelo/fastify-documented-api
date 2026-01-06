import { describe, expect } from 'vitest'
import { server } from '../../src/server.ts'
import { test } from '../fixtures.ts'

describe('GET /users', () => {
  test.scoped({ userRole: 'manager' })

  test('should return 1 user', async ({ user, token }) => {
    const response = await server.inject({
      method: 'GET',
      url: '/users',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const body = JSON.parse(response.body)

    expect(response.statusCode).toBe(200)
    expect(body.users).toHaveLength(1)

    console.log(user)

    expect({ users: [user] }).toMatchObject(body)
    expect(body.users[0]).not.toHaveProperty('passwordHash')
    expect(body.users[0]).not.toHaveProperty('deletedAt')
  })
})
