import type { AdminContext, AdminRole } from '@/lib/types/auth'

export function requireRole(
  context: AdminContext | null,
  allowedRoles: AdminRole[]
): boolean {
  if (!context) {
    return false
  }

  return allowedRoles.includes(context.role)
}
