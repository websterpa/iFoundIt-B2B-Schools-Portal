import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationPath = resolve(
  process.cwd(),
  'supabase/migrations/20260702103000_demo_requests_pipeline.sql'
)

describe('demo request migration', () => {
  it('defines the demo_requests table and enum-backed qualification fields', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    expect(migration).toContain('create table if not exists public.demo_requests')
    expect(migration).toContain('create type public.demo_request_role as enum')
    expect(migration).toContain('create type public.demo_request_school_type as enum')
    expect(migration).toContain('marketing_consent boolean not null')
    expect(migration).toContain('constraint demo_requests_trust_fields_consistent check')
  })
})
