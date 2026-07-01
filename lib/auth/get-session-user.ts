import { createSupabaseServerClient } from '@/lib/supabase/server'

export type SessionUser = {
  id: string | null
}

type SupabaseClaimsClient = {
  auth: {
    getClaims: () => Promise<{
      data: null | {
        claims: {
          sub?: string
        }
      }
      error: unknown
    }>
  }
}

type SupabaseClaimsClientFactory = () => SupabaseClaimsClient | Promise<SupabaseClaimsClient>

export async function getSessionUser(
  createClient: SupabaseClaimsClientFactory = createSupabaseServerClient
): Promise<SessionUser> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  return { id: typeof data?.claims?.sub === 'string' ? data.claims.sub : null }
}
