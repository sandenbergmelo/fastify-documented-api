import { describe, expect } from 'vitest'
import { server } from '../../src/server.ts'
import { test } from '../fixtures.ts'

describe('PATCH /users/update-role/:id', () => {
  test('should change user role', async (
    { passwordBeforeHash, token },
  ) => {
    const updateData = {
      currentPassword: passwordBeforeHash,
      name: 'Updated Name',
      email: 'update@email.com',
    }

    const updateUserResponse = await server.inject({
      method: 'PATCH',
      url: '/users',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: updateData,
    })

    expect(updateUserResponse.statusCode).toBe(204)

    const getUserResponse = await server.inject({
      method: 'GET',
      url: '/users/profile',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const user = getUserResponse.json()

    expect(getUserResponse.statusCode).toBe(200)
    expect(user.name).toBe(updateData.name)
    expect(user.email).toBe(updateData.email)
  })
})
