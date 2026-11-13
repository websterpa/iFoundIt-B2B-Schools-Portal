import { beforeEach, expect, it, vi } from 'vitest'
import { saveTrustedContactAction, deleteTrustedContactAction, importStudentsAction } from '@/app/students/actions'

const h = vi.hoisted(() => ({ update: vi.fn(), insert: vi.fn(), remove: vi.fn(), upsert: vi.fn(), filter: vi.fn(), saved: true, authenticated: true, scope: 'school-one', email: 'contact@school.org' }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/get-session-user', () => ({ getSessionUser: async () => ({ id: h.authenticated ? 'admin' : null }) }))
vi.mock('@/lib/auth/load-admin-context', () => ({ loadAdminContextForUser: async () => ({ userId: 'admin', role: 'school_admin', organisationId: 'school-one' }) }))
vi.mock('@/lib/auth/resolve-school-portal-organisation', () => ({ resolveSchoolPortalOrganisation: async () => ({ reason: h.scope ? 'ok' : 'missing_context', organisationId: h.scope }) }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: () => ({ from: () => ({ select: vi.fn(() => query()), update: h.update, insert: h.insert, delete: h.remove, upsert: h.upsert }) }) }))
function query() { return { eq: h.filter, select: vi.fn().mockReturnThis(), maybeSingle: async () => ({ data: h.saved ? { id: 'saved', email: h.email, approved_at: '2026-01-01', opted_in_at: '2026-01-01' } : null, error: null }) } }
const studentId = '11111111-1111-4111-8111-111111111111'
const contactId = '22222222-2222-4222-8222-222222222222'
const input = { studentId, displayName: 'Synthetic Grandparent', relationship: 'Grandparent', email: ' Contact@School.org ', phone: '', approved: true, enabled: true }
beforeEach(() => {
  vi.clearAllMocks(); h.saved = true; h.authenticated = true; h.scope = 'school-one'; h.email = 'contact@school.org'
  h.filter.mockReturnThis(); h.update.mockImplementation(query); h.remove.mockImplementation(query)
  h.insert.mockResolvedValue({ error: null }); h.upsert.mockResolvedValue({ error: null })
})
it('creates a school-scoped contact with explicit approval and consent', async () => {
  expect((await saveTrustedContactAction(input)).ok).toBe(true)
  expect(h.insert).toHaveBeenCalledWith(expect.objectContaining({ student_id: studentId, organisation_id: 'school-one', email: 'contact@school.org', approved: true, notifications_enabled: true }))
  expect(h.filter).toHaveBeenCalledWith('organisation_id', 'school-one')
})
it('opts an individual contact out without touching original parent fields', async () => {
  expect((await saveTrustedContactAction({ ...input, contactId, enabled: false })).ok).toBe(true)
  expect(h.update).toHaveBeenCalledWith(expect.objectContaining({ notifications_enabled: false, opted_in_at: null }))
  expect(h.update.mock.calls[0][0]).not.toHaveProperty('parent_email')
  expect(h.filter).toHaveBeenCalledWith('student_id', studentId)
})
it('does not carry consent to a changed email', async () => {
  expect((await saveTrustedContactAction({ ...input, contactId, email: 'new@school.org' })).ok).toBe(false)
  expect(h.update).not.toHaveBeenCalled()
})
it('deletes only the selected school/student/contact and rejects filtered-out rows', async () => {
  expect((await deleteTrustedContactAction({ studentId, contactId })).ok).toBe(true)
  expect(h.filter).toHaveBeenCalledWith('student_id', studentId)
  expect(h.filter).toHaveBeenCalledWith('organisation_id', 'school-one')
  h.saved = false
  expect((await deleteTrustedContactAction({ studentId, contactId })).ok).toBe(false)
})
it.each(['signed-out', 'missing-context', 'other-school'])('fails closed for %s', async (reason) => {
  if (reason === 'signed-out') h.authenticated = false
  if (reason === 'missing-context') h.scope = ''
  if (reason === 'other-school') h.saved = false
  expect((await saveTrustedContactAction(input)).ok).toBe(false)
  expect(h.insert).not.toHaveBeenCalled()
})
it('keeps legacy contact and consent fields out of CSV upserts', async () => {
  await importStudentsAction({ rows: [{ firstName: 'Synthetic', lastName: 'Test', dateOfBirth: null, homePostcode: null, yearGroup: null, className: null, active: true }] })
  expect(h.upsert.mock.calls[0][0][0]).not.toHaveProperty('parent_email')
  expect(h.upsert.mock.calls[0][0][0]).not.toHaveProperty('parent_notifications_enabled')
})
