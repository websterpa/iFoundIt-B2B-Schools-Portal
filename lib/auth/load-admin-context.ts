import type { SupabaseClient } from '@supabase/supabase-js'

import { getAdminContext } from '@/lib/auth/get-admin-context'
import type { AdminContext } from '@/lib/types/auth'

export async function loadAdminContextForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<AdminContext | null> {
  return getAdminContext(userId, {
    async loadAdminUser(currentUserId) {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, organisation_id, role')
        .eq('id', currentUserId)
        .maybeSingle()

      if (error || !data) {
        return null
      }

      return {
        id: data.id,
        organisationId: data.organisation_id,
        role: data.role
      }
    }
  })
}
