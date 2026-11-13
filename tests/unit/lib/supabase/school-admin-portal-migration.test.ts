import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationPath = resolve(
  process.cwd(),
  'supabase/migrations/20260703133500_school_admin_portal_phase2_to_5.sql'
)

describe('school admin portal migration', () => {
  it('creates students, found event status fields, and storage policies', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    expect(migration).toContain('create table if not exists public.students')
    expect(migration).toContain('create policy students_select_own_or_superadmin')
    expect(migration).toContain('add column if not exists status text not null default \'pending\'')
    expect(migration).toContain('create policy found_events_update_own_or_superadmin')
    expect(migration).toContain("insert into storage.buckets (id, name, public)")
    expect(migration).toContain('create policy school_logos_insert_own_or_superadmin')
  })

  it('keeps student schema additions idempotent and guarded', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    expect(migration).toContain('add column if not exists date_of_birth date')
    expect(migration).toContain('add column if not exists home_postcode text')
    expect(migration).toContain('add column if not exists home_postcode_normalized text')
    expect(migration).toContain("where conname = 'students_home_postcode_normalized_format_check'")
    expect(migration).toContain('create unique index if not exists students_org_name_year_class_unique_idx')

    const normalizedConstraintMentions =
      migration.match(/students_home_postcode_normalized_format_check/g)?.length ?? 0
    expect(normalizedConstraintMentions).toBe(2)
  })
})
