import * as jose from 'jose'
import { env } from '../env.ts'
import type { UserRole } from '../schemas/role.ts'

const jwtSecret = new TextEncoder().encode(env.JWT_SECRET)

interface UserPayload {
  sub: string
  name: string
  role: UserRole
}

async function createAccessToken(payload: UserPayload) {
  const token = await new jose.SignJWT({ ...payload })
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(jwtSecret)

  return token
}

async function verifyAccessToken(token: string) {
  try {
    const { payload } =
      await jose.jwtVerify(token, jwtSecret) as { payload: UserPayload }

    return payload
  } catch {
    return null
  }
}

export const jwt = {
  createAccessToken,
  verifyAccessToken,
}
