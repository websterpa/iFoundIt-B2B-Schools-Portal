import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bulkAssignTagsAction } from '@/app/tags/actions'

const h = vi.hoisted(() => ({ from: vi.fn(), update: vi.fn(), mutationScope: vi.fn(), saved: true }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
vi.mock('@/lib/auth/get-session-user', () => ({ getSessionUser: vi.fn(async () => ({ id: 'admin' })) }))
vi.mock('@/lib/auth/load-admin-context', () => ({ loadAdminContextForUser: vi.fn(async () => ({ userId: 'admin', role: 'school_admin', organisationId: 'school-one' })) }))
vi.mock('@/lib/auth/resolve-school-portal-organisation', () => ({ resolveSchoolPortalOrganisation: vi.fn(async () => ({ reason: 'ok', organisationId: 'school-one' })) }))
vi.mock('@/lib/supabase/server', () => ({ createSupabaseServerClient: () => ({ from: h.from }) }))

function query(data: unknown) {
  const result = Promise.resolve({ data, error: null })
  return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), in: vi.fn().mockReturnThis(), then: result.then.bind(result) }
}
function csv(lines: string[], classified = true) {
  const text = ['serial,first_name,last_name,date_of_birth,home_postcode' + (classified ? ',item_kind,laptop_ownership' : ''), ...lines].join('\n')
  const file = new File([text], 'assign.csv', { type: 'text/csv' })
  Object.defineProperty(file, 'text', { value: async () => text })
  const form = new FormData()
  form.set('csvFile', file)
  return form
}

describe('bulk tag assignment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.saved = true
    h.update.mockImplementation(() => ({ eq: h.mutationScope, select: vi.fn().mockReturnThis(), maybeSingle: async () => ({ data: h.saved ? { id: 'tag-one' } : null, error: null }) }))
    h.mutationScope.mockReturnThis()
    h.from.mockImplementation((table: string) => table === 'tags'
      ? { ...query([{ id: 'tag-one', organisation_id: 'school-one', serial: 'HERO0001', active: true }, { id: 'inactive', organisation_id: 'school-one', serial: 'INACTIVE1', active: false }]), update: h.update }
      : query([{ id: 'student-one', first_name: 'Alice', last_name: 'Smith', date_of_birth: '2014-01-05', home_postcode_normalized: 'SW1A1AA' }]))
  })
  it('classifies a laptop using a tenant-scoped UPDATE, not an INSERT/upsert', async () => {
    const result = await bulkAssignTagsAction(csv(['HERO0001,Alice,Smith,05-01-2014,SW1A 1AA,hero_laptop,student']))
    expect(result.data.assignedCount).toBe(1)
    expect(h.update).toHaveBeenCalledWith({ student_id: 'student-one', item_kind: 'hero_laptop', laptop_ownership: 'student' })
    expect(h.mutationScope).toHaveBeenCalledWith('organisation_id', 'school-one')
    expect(h.mutationScope).toHaveBeenCalledWith('active', true)
  })
  it('does not overwrite item metadata for a legacy CSV', async () => {
    const result = await bulkAssignTagsAction(csv(['HERO0001,Alice,Smith,05-01-2014,SW1A 1AA'], false))
    expect(result.data.assignedCount).toBe(1)
    expect(h.update).toHaveBeenCalledWith({ student_id: 'student-one' })
  })
  it.each(['HERO0001,Alice,Smith,05-01-2014,SW1A 1AA,hero_laptop,', 'INACTIVE1,Alice,Smith,05-01-2014,SW1A 1AA,hero_laptop,school', 'OTHERSCHOOL,Alice,Smith,05-01-2014,SW1A 1AA,hero_laptop,school'])('rejects unsafe assignment row %s', async (line) => {
    const result = await bulkAssignTagsAction(csv([line]))
    expect(result.data.assignedCount).toBe(0)
    expect(result.data.errors).toHaveLength(1)
    expect(h.update).not.toHaveBeenCalled()
  })
  it('rejects every occurrence of an ambiguous duplicate serial', async () => {
    const line = 'HERO0001,Alice,Smith,05-01-2014,SW1A 1AA,hero_laptop,school'
    const result = await bulkAssignTagsAction(csv([line, line]))
    expect(result.data.errors).toHaveLength(2)
    expect(h.update).not.toHaveBeenCalled()
  })
  it('does not count an RLS-filtered or concurrently removed tag as saved', async () => {
    h.saved = false
    const result = await bulkAssignTagsAction(csv(['HERO0001,Alice,Smith,05-01-2014,SW1A 1AA,hero_laptop,school']))
    expect(result.data.assignedCount).toBe(0)
    expect(result.data.errors).toHaveLength(1)
  })
})
