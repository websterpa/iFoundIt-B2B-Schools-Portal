import { beforeEach, expect, it, vi } from 'vitest'
import { updateSchoolSettingsAction } from '@/app/settings/actions'

const h = vi.hoisted(() => ({ update: vi.fn(), filter: vi.fn(), saved: true }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/get-session-user', () => ({ getSessionUser: async () => ({ id: 'admin' }) }))
vi.mock('@/lib/auth/load-admin-context', () => ({ loadAdminContextForUser: async () => ({ userId: 'admin', role: 'school_admin', organisationId: 'school-one' }) }))
vi.mock('@/lib/auth/resolve-school-portal-organisation', () => ({ resolveSchoolPortalOrganisation: async () => ({ reason: 'ok', organisationId: 'school-one' }) }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: () => ({ from: () => ({ update: h.update }) }) }))
const input = { contactEmail: 'reception@school.org', contactPhone: '020 7946 0123', address: 'School address', collectionDetails: 'Shared school collection centre\nTuesday and Thursday, 14:00–16:00. Call first.' }
beforeEach(() => {
  vi.clearAllMocks(); h.saved = true; h.filter.mockReturnThis()
  h.update.mockReturnValue({ eq: h.filter, select: vi.fn().mockReturnThis(), maybeSingle: async () => ({ data: h.saved ? { id: 'school-one' } : null, error: null }) })
})
it('saves central collection instructions and hours only for the current school', async () => {
  expect((await updateSchoolSettingsAction(input)).ok).toBe(true)
  expect(h.update).toHaveBeenCalledWith(expect.objectContaining({ collection_details: input.collectionDetails }))
  expect(h.filter).toHaveBeenCalledWith('id', 'school-one')
})
it.each(['https://schools.org/admin', 'x'.repeat(2001)])('rejects unsafe or oversized collection instructions', async (collectionDetails) => {
  expect((await updateSchoolSettingsAction({ ...input, collectionDetails })).ok).toBe(false)
  expect(h.update).not.toHaveBeenCalled()
})
it('does not report an RLS-filtered settings update as saved', async () => {
  h.saved = false
  expect((await updateSchoolSettingsAction(input)).ok).toBe(false)
})
