import { describe, expect } from 'vitest'
import type { ActiveUserSelect } from '../../src/database/schema/users.ts'
import type { UserRole } from '../../src/schemas/role.ts'
import { server } from '../../src/server.ts'
import { test } from '../fixtures.ts'

describe('PATCH /users/update-role/:id', () => {
  test.scoped({ userRole: 'manager' })

  test('should change user role', async ({ user, token }) => {
    const newRole: UserRole = 'regular'

    const roleUpdateResponse = await server.inject({
      method: 'PATCH',
      url: `/users/update-role/${user.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        role: newRole,
      },
    })

    expect(roleUpdateResponse.statusCode).toBe(204)

    const getUserResponse = await server.inject({
      method: 'GET',
      url: `/users/${user.id}`,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const fetchedUser = getUserResponse.json() as ActiveUserSelect

    expect(fetchedUser.role).toBe(newRole)
  })

  test('should return 404 for non-existing user', async ({ token }) => {
    const roleUpdateResponse = await server.inject({
      method: 'PATCH',
      url: '/users/update-role/00000000-0000-0000-0000-000000000000',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      payload: {
        role: 'regular',
      },
    })

    expect(roleUpdateResponse.statusCode).toBe(404)
    expect(roleUpdateResponse.json()).toEqual({ message: 'User not found' })
  })
})
