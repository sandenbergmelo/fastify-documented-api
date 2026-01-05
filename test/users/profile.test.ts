import { omit } from 'lodash'
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

    expect(response.statusCode).toBe(200)
    expect(JSON.parse(response.body)).toEqual(omit(user, ['passwordHash']))
  })
})
