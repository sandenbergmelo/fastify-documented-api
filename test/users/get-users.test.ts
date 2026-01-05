import { omit } from 'lodash'
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

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual({
      users: [omit(user, ['passwordHash'])],
    })
  })
})
