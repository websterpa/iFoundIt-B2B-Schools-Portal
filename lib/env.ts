type PublicEnvInput = {
  NEXT_PUBLIC_SUPABASE_URL?: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string
}

type ServerEnvInput = PublicEnvInput & {
  SUPABASE_SERVICE_ROLE_KEY?: string
}

export function readPublicEnv(input: PublicEnvInput) {
  if (!input.NEXT_PUBLIC_SUPABASE_URL || !input.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing public Supabase environment configuration.')
  }

  return {
    supabaseUrl: input.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: input.NEXT_PUBLIC_SUPABASE_ANON_KEY
  }
}

export function readServerEnv(input: ServerEnvInput) {
  const publicEnv = readPublicEnv(input)

  if (!input.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase service role environment configuration.')
  }

  return {
    ...publicEnv,
    supabaseServiceRoleKey: input.SUPABASE_SERVICE_ROLE_KEY
  }
}
