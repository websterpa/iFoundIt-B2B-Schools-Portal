import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const authMigrationPath = resolve(process.cwd(), 'supabase/migrations/20260701121018_auth_admin_contract.sql')
const finderMigrationPath = resolve(process.cwd(), 'supabase/migrations/20260701155657_finder_flow_contract_foundation.sql')
const schoolPortalMigrationPath = resolve(
  process.cwd(),
  'supabase/migrations/20260703133500_school_admin_portal_phase2_to_5.sql'
)

describe('school portal rls cross-organisation guards', () => {
  it('keeps deny-by-default + own-org-or-superadmin policies for students', () => {
    const migration = readFileSync(schoolPortalMigrationPath, 'utf8')

    expect(migration).toContain('revoke all on table public.students from anon, authenticated')
    expect(migration).toContain('create policy students_select_own_or_superadmin')
    expect(migration).toContain('create policy students_insert_own_or_superadmin')
    expect(migration).toContain('create policy students_update_own_or_superadmin')
    expect(migration).toContain("current_admin.role = 'ifoundit_superadmin'")
    expect(migration).toContain('current_admin.organisation_id = students.organisation_id')
  })

  it('keeps deny-by-default + own-org-or-superadmin policies for tags and found events', () => {
    const finderMigration = readFileSync(finderMigrationPath, 'utf8')
    const schoolPortalMigration = readFileSync(schoolPortalMigrationPath, 'utf8')

    expect(finderMigration).toContain('revoke all on table public.tags from anon, authenticated')
    expect(finderMigration).toContain('create policy tags_update_own_or_superadmin')
    expect(finderMigration).toContain('current_admin.organisation_id = tags.organisation_id')

    expect(schoolPortalMigration).toContain('create policy found_events_update_own_or_superadmin')
    expect(schoolPortalMigration).toContain('current_admin.organisation_id = found_events.organisation_id')
  })

  it('keeps own-org-or-superadmin organisations + school-logo storage policies', () => {
    const authMigration = readFileSync(authMigrationPath, 'utf8')
    const schoolPortalMigration = readFileSync(schoolPortalMigrationPath, 'utf8')

    expect(authMigration).toContain('create policy organisations_update_own_or_superadmin')
    expect(authMigration).toContain('current_admin.organisation_id = organisations.id')

    expect(schoolPortalMigration).toContain('create policy school_logos_insert_own_or_superadmin')
    expect(schoolPortalMigration).toContain('create policy school_logos_update_own_or_superadmin')
    expect(schoolPortalMigration).toContain("bucket_id = 'school-logos'")
    expect(schoolPortalMigration).toContain('current_admin.organisation_id::text = split_part(storage.objects.name, \'/\', 1)')
  })
})
