import type { AdminContext } from '@/lib/types/auth'

export function resolvePortalPath(context: AdminContext): string {
  if (context.role === 'ifoundit_superadmin') {
    return '/admin'
  }

  return '/dashboard'
}
