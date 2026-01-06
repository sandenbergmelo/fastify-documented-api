import { isNull, sql } from 'drizzle-orm'
import {
  pgEnum,
  pgTable,
  pgView,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'

export const userRole = pgEnum('user_role', [
  'regular',
  'manager',
])

export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRole().notNull().default('regular'),

  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
})

export const activeUsersView = pgView('active_users')
  .as((qb) => qb.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    passwordHash: users.passwordHash,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
  }).from(users).where(isNull(users.deletedAt)))

export type UserInsert = typeof users.$inferInsert
export type UserSelect = typeof users.$inferSelect
export type ActiveUserSelect = typeof activeUsersView.$inferSelect
