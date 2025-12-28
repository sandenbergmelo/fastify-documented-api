export const allRoles = ['regular', 'manager'] as const
export type UserRole = typeof allRoles[number]
