import { fakerPT_BR as faker } from '@faker-js/faker'
import * as argon2 from 'argon2'
import { db } from './client.ts'
import { users } from './schema/users.ts'

async function seed() {
  console.log('Seeding database...')

  const passwordHash = await argon2.hash('secret-password')

  await db.insert(users).values([
    {
      name: 'Manager User',
      email: 'manager@manager.com',
      passwordHash: await argon2.hash('manager-password'),
      role: 'manager',
    },
    {
      name: 'Regular User',
      email: 'regular@regular.com',
      passwordHash: await argon2.hash('regular-password'),
      role: 'regular',
    },
    {
      name: 'Deleted User',
      email: 'deleted@user.com',
      passwordHash,
      role: 'regular',
      deletedAt: new Date(),
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash,
      role: 'regular',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash,
      role: 'regular',
    },
  ]).returning()

  await db.$client.end()

  console.log('Database seeded successfully.')
}

if (import.meta.main) {
  seed()
}
