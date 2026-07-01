import { readFile } from 'node:fs/promises'

import { describe, expect, it } from 'vitest'

describe('.env.example', () => {
  it('documents the required auth environment variables', async () => {
    const content = await readFile('.env.example', 'utf8')

    expect(content).toContain('NEXT_PUBLIC_SUPABASE_URL=')
    expect(content).toContain('NEXT_PUBLIC_SUPABASE_ANON_KEY=')
    expect(content).toContain('SUPABASE_SERVICE_ROLE_KEY=')
  })
})
