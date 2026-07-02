import { readdirSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const migrationsDir = resolve(process.cwd(), 'supabase/migrations')
const authContractPath = resolve(migrationsDir, '20260701121018_auth_admin_contract.sql')
const finderFoundationPath = resolve(migrationsDir, '20260701155657_finder_flow_contract_foundation.sql')
const onboardingPhase2Path = resolve(migrationsDir, '20260701230500_superadmin_school_onboarding_phase2.sql')

describe('supabase migration chain', () => {
  it('keeps the auth, finder foundation, and onboarding migrations together in timestamp order', () => {
    const migrationPaths = [authContractPath, finderFoundationPath, onboardingPhase2Path]

    expect(migrationPaths).toEqual([...migrationPaths].sort())
  })

  it('defines the tables that the superadmin onboarding flow requires', () => {
    const authContract = readFileSync(authContractPath, 'utf8')
    const finderFoundation = readFileSync(finderFoundationPath, 'utf8')
    const onboardingPhase2 = readFileSync(onboardingPhase2Path, 'utf8')

    expect(authContract).toContain('create table if not exists public.organisations')
    expect(authContract).toContain('create table if not exists public.admin_users')
    expect(finderFoundation).toContain('create table if not exists public.tags')
    expect(onboardingPhase2).toContain('create table if not exists public.pending_school_admins')
    expect(onboardingPhase2).toContain('20260701155657_finder_flow_contract_foundation.sql')
  })

  it('contains only timestamped SQL migrations and no macOS sidecar files', () => {
    const migrationFiles = readdirSync(migrationsDir)

    expect(migrationFiles).not.toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^\._/),
        expect.stringMatching(/^\.(DS_Store|AppleDouble)$/)
      ])
    )
  })
})
