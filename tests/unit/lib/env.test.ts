import { describe, expect, it } from 'vitest'

import { readPublicEnv } from '@/lib/env'

describe('readPublicEnv', () => {
  it('returns the public Supabase config when present', () => {
    expect(
      readPublicEnv({
        NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
        NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key'
      })
    ).toEqual({
      supabaseUrl: 'https://example.supabase.co',
      supabaseAnonKey: 'anon-key'
    })
  })
})
