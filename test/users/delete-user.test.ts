import { describe, expect } from 'vitest'
import { server } from '../../src/server.ts'
import { test } from '../fixtures.ts'

describe('DELETE /users', () => {
  test('should delete a user', async ({ passwordBeforeHash, token }) => {
    const response = await server.inject({
      method: 'DELETE',
      url: '/users',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        currentPassword: passwordBeforeHash,
      },
    })

    expect(response.statusCode).toBe(204)
    expect(response.body).toBe('')
  })

  test('should return an error when passing wrong password', async (
    { token },
  ) => {
    const response = await server.inject({
      method: 'DELETE',
      url: '/users',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        currentPassword: 'wrong-password',
      },
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({ message: 'Unauthorized' })
  })
})
