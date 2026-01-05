import { fakerPT_BR as faker } from '@faker-js/faker'
import { Factory } from 'fishery'
import type { UserInsert } from '../../src/database/schema/users.ts'

export const userFactory = Factory.define<UserInsert>(() => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordHash: faker.internet.password(),
    role: 'regular',
  }
})
