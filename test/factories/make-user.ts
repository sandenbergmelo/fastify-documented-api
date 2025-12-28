import { faker } from '@faker-js/faker'
import * as argon2 from 'argon2'
import { randomUUID } from 'crypto'
import { db } from '../../src/database/client.ts'
import { users } from '../../src/database/schema/users.ts'
import { jwt } from '../../src/lib/jwt.ts'
import type { UserRole } from '../../src/schemas/role.ts'

export async function makeUser(role: UserRole = 'regular') {
  const passwordBeforeHash = randomUUID()

  const result = await db.insert(users).values({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordHash: await argon2.hash(passwordBeforeHash),
    role,
  }).returning()

  const user = {
    ...result[0],
    passwordHash: undefined,
    createdAt: result[0].createdAt.toISOString(),
    updatedAt: result[0].updatedAt.toISOString(),
  }

  return {
    user,
    passwordBeforeHash,
  }
}

export async function makeAuthenticatedUser(role: UserRole = 'regular') {
  const { user } = await makeUser(role)

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required.')
  }

  const token = await jwt.createAccessToken({
    sub: user.id,
    name: user.name,
    role: user.role,
  })

  return { user, token }
}
