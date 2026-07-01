import type { AdminContext } from '@/lib/types/auth'

type AdminLookup = {
  loadAdminUser: (userId: string) => Promise<AdminContext | null | {
    id: string
    organisationId: string | null
    role: string
  }>
}

export async function getAdminContext(
  userId: string,
  lookup: AdminLookup
): Promise<AdminContext | null> {
  const adminUser = await lookup.loadAdminUser(userId)

  if (!adminUser) {
    return null
  }

  if (adminUser.role !== 'school_admin' && adminUser.role !== 'ifoundit_superadmin') {
    return null
  }

  if (adminUser.role === 'school_admin' && !adminUser.organisationId) {
    return null
  }

  return {
    id: adminUser.id,
    organisationId: adminUser.organisationId,
    role: adminUser.role
  }
}
