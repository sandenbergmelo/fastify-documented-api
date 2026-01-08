import * as argon2 from 'argon2'
import { randomUUID } from 'crypto'
import { test as base } from 'vitest'
import { db } from '../src/database/client.ts'
import { users, type UserSelect } from '../src/database/schema/users.ts'
import { jwt } from '../src/lib/jwt.ts'
import type { UserRole } from '../src/schemas/role.ts'
import { userFactory } from './factories/user-factory.ts'

interface User extends Omit<UserSelect, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

interface UserFixture {
  userRole: UserRole
  anotherUserRole: UserRole
  user: User
  anotherUser: User
  passwordBeforeHash: string
  token: string
  transaction: void
}

export const test = base.extend<UserFixture>({
  transaction: [
    async ({}, use) => {
      await db.execute('BEGIN')
      await use()
      await db.execute('ROLLBACK')
    },
    { auto: true, scope: 'test' },
  ],
  userRole: 'regular',
  anotherUserRole: 'regular',
  passwordBeforeHash: async ({}, use) => {
    const passwordBeforeHash = randomUUID()
    await use(passwordBeforeHash)
  },
  user: async ({ passwordBeforeHash, userRole }, use) => {
    const fakeUser = userFactory.build({
      role: userRole,
      passwordHash: await argon2.hash(passwordBeforeHash),
    })

    const [insertedUser] = await db.insert(users).values(fakeUser).returning()

    const user: User = {
      ...insertedUser,
      createdAt: insertedUser.createdAt.toISOString(),
      updatedAt: insertedUser.updatedAt.toISOString(),
    }

    await use(user)
  },
  anotherUser: async ({ passwordBeforeHash, anotherUserRole }, use) => {
    const fakeUser = userFactory.build({
      role: anotherUserRole,
      passwordHash: await argon2.hash(passwordBeforeHash),
    })

    const [insertedUser] = await db.insert(users).values(fakeUser).returning()

    const user: User = {
      ...insertedUser,
      createdAt: insertedUser.createdAt.toISOString(),
      updatedAt: insertedUser.updatedAt.toISOString(),
    }

    await use(user)
  },
  token: async ({ user }, use) => {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is required.')
    }

    const token = await jwt.createAccessToken({
      sub: user.id,
      name: user.name,
      role: user.role,
    })

    await use(token)
  },
})
