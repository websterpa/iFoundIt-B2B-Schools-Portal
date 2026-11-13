import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationPath = resolve(
  process.cwd(),
  'supabase/migrations/20260703160000_remote_schema_completion.sql'
)

describe('remote schema completion migration', () => {
  it('guards form_group backfill behind a column-existence check', () => {
    const migration = readFileSync(migrationPath, 'utf8')

    expect(migration).toContain('FROM information_schema.columns')
    expect(migration).toContain("table_schema = 'public'")
    expect(migration).toContain("table_name = 'students'")
    expect(migration).toContain("column_name = 'form_group'")
    expect(migration).toContain('EXECUTE $sql$')
    expect(migration).toContain('SET class_name = form_group')
  })
})
