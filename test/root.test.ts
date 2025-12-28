import { describe, expect, test } from 'vitest'
import { server } from '../src/server.ts'

describe('GET /', () => {
  test('Root endpoint should return "Hello from the API!"', async () => {
    const response = await server.inject({ method: 'GET', url: '/' })

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('Hello from the API!')
  })
})
