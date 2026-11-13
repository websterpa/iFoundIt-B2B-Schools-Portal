import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationPath = resolve(
  process.cwd(),
  'supabase/migrations/20260703111500_demo_requests_superadmin_rls.sql'
)

describe('demo request superadmin rls migration', () => {
  it('enables RLS and restricts reads to superadmins', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    expect(migration).toContain('alter table public.demo_requests enable row level security')
    expect(migration).toContain('grant select on table public.demo_requests to authenticated')
    expect(migration).toContain('create policy demo_requests_select_superadmin')
    expect(migration).toContain("current_admin.role = 'ifoundit_superadmin'")
  })
})
