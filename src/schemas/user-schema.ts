import { z } from 'zod'
import { allRoles } from './role.ts'

export const publicUserSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  email: z.email(),
  role: z.enum(allRoles),
  createdAt: z.date(),
  updatedAt: z.date(),
})
