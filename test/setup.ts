import { beforeAll } from 'vitest'
import { server } from '../src/server.ts'

beforeAll(async () => {
  await server.ready()
})
