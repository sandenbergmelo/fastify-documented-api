import { afterEach, beforeAll, beforeEach } from 'vitest'
import { db } from '../src/database/client.ts'
import { server } from '../src/server.ts'

beforeAll(async () => {
  await server.ready()
})

beforeEach(async () => {
  await db.execute('BEGIN')
})

afterEach(async () => {
  await db.execute('ROLLBACK')
})
