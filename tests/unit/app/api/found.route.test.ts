import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { POST } from '@/app/api/found/route'

const h = vi.hoisted(() => ({
  from: vi.fn(), insert: vi.fn(), update: vi.fn(), filter: vi.fn(), send: vi.fn(), setApiKey: vi.fn(), getUser: vi.fn(), fetch: vi.fn(),
  tagMissing: false, studentOrg: 'school-one', eventError: false, trackingError: false,
  recipients: [] as { user_id: string }[], recipientError: false,
  parentEmail: 'parent@school.org', parentEnabled: false, studentActive: true, consentAt: '2026-01-01', noContacts: false,
  schoolContactEmail: 'reception@school.org', schoolContactPhone: '+44 20 7946 0123', schoolContactError: false, extraContacts: [] as Array<{ email: string; approved: boolean; notifications_enabled: boolean; approved_at: string | null; opted_in_at: string | null }>, contactLookupError: false
}))
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: h.from, auth: { admin: { getUserById: h.getUser } } }) }))
vi.mock('@sendgrid/mail', () => ({ default: { sendMultiple: h.send, setApiKey: h.setApiKey } }))

function query(data: unknown, error: unknown = null) {
  const result = Promise.resolve({ data, error })
  return { select: vi.fn().mockReturnThis(), eq: h.filter, maybeSingle: async () => ({ data, error }), single: async () => ({ data, error }), then: result.then.bind(result) }
}
const tag = { id: 'tag-one', organisation_id: 'school-one', student_id: 'student-one', item_kind: 'hero_laptop', laptop_ownership: 'student' }
function request(overrides = {}) {
  return new Request('http://localhost/api/found', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ serialNumber: 'HERO0001', turnstileToken: 'fixture-token', finderComments: '<img src=x onerror=alert(1)>', ...overrides }) })
}

describe('finder report and email integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    h.tagMissing = false; h.studentOrg = 'school-one'; h.eventError = false; h.trackingError = false
    h.recipients = []; h.recipientError = false
    h.parentEmail = 'parent@school.org'; h.parentEnabled = false; h.studentActive = true; h.consentAt = '2026-01-01'
    h.noContacts = false
    h.schoolContactEmail = 'reception@school.org'; h.schoolContactPhone = '+44 20 7946 0123'; h.schoolContactError = false; h.extraContacts = []; h.contactLookupError = false
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://fixture.supabase.co')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'fixture-service-key')
    vi.stubEnv('TURNSTILE_SECRET_KEY', 'fixture-challenge-key')
    vi.stubEnv('SENDGRID_API_KEY', 'fixture-mail-key')
    vi.stubEnv('SENDGRID_FROM_EMAIL', 'alerts@fixture.test')
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://schools.fixture.test')
    vi.stubGlobal('fetch', h.fetch)
    h.fetch.mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }))
    h.filter.mockReturnThis()
    h.insert.mockImplementation(() => query({ id: 'event-one' }, h.eventError ? { message: 'fixture storage failure' } : null))
    h.update.mockImplementation(() => query({ id: 'event-one' }, h.trackingError ? { message: 'fixture tracking failure' } : null))
    h.send.mockResolvedValue([{ statusCode: 202 }])
    h.getUser.mockImplementation(async (id: string) => ({ data: { user: { email: id === 'admin-unverified' ? 'unverified@school.org' : 'school@school.org', email_confirmed_at: id === 'admin-unverified' ? null : '2026-01-01T00:00:00Z' } }, error: null }))
    h.from.mockImplementation((table: string) => {
      if (table === 'tags') return query(h.tagMissing ? null : tag)
      if (table === 'students') return query({ organisation_id: h.studentOrg, active: h.studentActive, parent_email: h.parentEmail, parent_notifications_enabled: h.parentEnabled, parent_notifications_opted_in_at: h.consentAt })
      if (table === 'admin_users') return query([{ id: 'admin-verified' }, { id: 'admin-unverified' }, { id: 'admin-duplicate-email' }])
      if (table === 'school_notification_recipients') return query(h.recipients, h.recipientError ? { message: 'lookup failed' } : null)
      if (table === 'student_trusted_contacts') return query(h.noContacts ? [] : [{ email: h.parentEmail, approved: true, approved_at: h.consentAt, notifications_enabled: h.parentEnabled, opted_in_at: h.consentAt }, ...h.extraContacts], h.contactLookupError ? { message: 'unavailable' } : null)
      if (table === 'organisations') return query({ contact_email: h.schoolContactEmail, contact_phone: h.schoolContactPhone, collection_details: 'Shared collection centre, 1 Test Road. Tuesdays 14:00-16:00 only. Call before travelling.' }, h.schoolContactError ? { message: 'lookup failed' } : null)
      return { insert: h.insert, update: h.update }
    })
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

  it('records an active laptop report, sends one escaped school email, and tracks acceptance', async () => {
    const response = await POST(request())
    expect(response.status).toBe(200)
    expect(h.filter).toHaveBeenCalledWith('serial', 'HERO0001')
    expect(h.filter).toHaveBeenCalledWith('active', true)
    expect(h.filter).toHaveBeenCalledWith('organisation_id', 'school-one')
    expect(h.insert).toHaveBeenCalledWith(expect.objectContaining({ organisation_id: 'school-one', tag_id: 'tag-one', status: 'pending' }))
    expect(h.send).toHaveBeenCalledWith(expect.objectContaining({ to: ['school@school.org'], html: expect.stringContaining('BYOD laptop') }))
    expect(h.send.mock.calls[0][0].html).not.toContain('<img')
    expect(h.send.mock.calls[0][0].html).toContain('&lt;img')
    expect(h.update).toHaveBeenCalledWith(expect.objectContaining({ notification_sent_at: expect.any(String) }))
    expect(JSON.stringify(await response.json())).not.toContain('student-one')
  })
  it('rejects malformed JSON and invalid serials without external calls', async () => {
    expect((await POST(new Request('http://localhost/api/found', { method: 'POST', body: '{' }))).status).toBe(400)
    expect((await POST(request({ serialNumber: '<invalid>' }))).status).toBe(400)
    expect(h.fetch).not.toHaveBeenCalled()
  })
  it('sends multiple approved opted-in contacts separate private messages and deduplicates addresses', async () => {
    h.parentEnabled = true
    h.extraContacts = [
      { email: 'grandparent@school.org', approved: true, approved_at: '2026-01-01', notifications_enabled: true, opted_in_at: '2026-01-01' },
      { email: 'PARENT@school.org', approved: true, approved_at: '2026-01-01', notifications_enabled: true, opted_in_at: '2026-01-01' },
      { email: 'optedout@school.org', approved: true, approved_at: '2026-01-01', notifications_enabled: false, opted_in_at: null },
      { email: 'unapproved@school.org', approved: false, approved_at: null, notifications_enabled: true, opted_in_at: '2026-01-01' }
    ]
    const response = await POST(request())
    expect(response.status).toBe(200)
    expect(h.send).toHaveBeenCalledTimes(3)
    expect(h.send.mock.calls[1][0].to).toEqual(['parent@school.org'])
    expect(h.send.mock.calls[2][0].to).toEqual(['grandparent@school.org'])
    expect(h.send.mock.calls[1][0].text).not.toContain('grandparent@school.org')
    expect(h.send.mock.calls[2][0].text).not.toContain('parent@school.org')
    expect(JSON.stringify(await response.json())).not.toContain('@school.org')
    expect(h.filter).toHaveBeenCalledWith('student_id', 'student-one')
  })
  it('honours one contact opting out while another remains opted in', async () => {
    h.parentEnabled = false
    h.extraContacts = [{ email: 'grandparent@school.org', approved: true, approved_at: '2026-01-01', notifications_enabled: true, opted_in_at: '2026-01-01' }]
    expect((await POST(request())).status).toBe(200)
    expect(h.send).toHaveBeenCalledTimes(2)
    expect(h.send.mock.calls[1][0].to).toEqual(['grandparent@school.org'])
  })
  it('does not fall back to legacy parent consent when a migrated contact has been deleted', async () => {
    h.parentEnabled = true
    h.noContacts = true
    expect((await POST(request())).status).toBe(200)
    expect(h.send).toHaveBeenCalledTimes(1)
    expect(h.insert).toHaveBeenCalledWith(expect.objectContaining({ parent_notification_status: 'not_requested' }))
  })
  it('continues sending to other contacts after an individual failure and records partial submission', async () => {
    h.parentEnabled = true
    h.extraContacts = [{ email: 'grandparent@school.org', approved: true, approved_at: '2026-01-01', notifications_enabled: true, opted_in_at: '2026-01-01' }]
    h.send.mockResolvedValueOnce([{ statusCode: 202 }]).mockRejectedValueOnce(new Error('first contact unavailable')).mockResolvedValueOnce([{ statusCode: 202 }])
    expect((await POST(request())).status).toBe(200)
    expect(h.send).toHaveBeenCalledTimes(3)
    expect(h.update).toHaveBeenCalledWith(expect.objectContaining({ parent_notification_status: 'partial', parent_notification_sent_at: expect.any(String) }))
  })
  it('fails closed if the contact list cannot be verified', async () => {
    h.contactLookupError = true
    expect((await POST(request())).status).toBe(500)
    expect(h.send).not.toHaveBeenCalled()
    expect(h.insert).not.toHaveBeenCalled()
  })
  it('sends opted-in parents a separate plain-text email without notes, other recipients or a portal link', async () => {
    h.parentEnabled = true
    expect((await POST(request())).status).toBe(200)
    expect(h.send).toHaveBeenCalledTimes(2)
    const parent = h.send.mock.calls[1][0]
    expect(parent.to).toEqual(['parent@school.org'])
    expect(parent.text).toContain("contact the school's team")
    expect(parent.text).toContain('Tuesdays 14:00-16:00 only.')
    expect(parent.text).not.toContain('your child')
    expect(parent.text).toContain('BYOD laptop')
    expect(parent.text).toContain('School email: reception@school.org')
    expect(parent.text).toContain('School phone: +44 20 7946 0123')
    expect(parent).not.toHaveProperty('html')
    expect(JSON.stringify(parent)).not.toMatch(/schools.fixture|\/events|onerror|school@school.org|student-one/)
    expect(h.update).toHaveBeenCalledWith(expect.objectContaining({ parent_notification_status: 'submitted', parent_notification_sent_at: expect.any(String) }))
  })
  it.each(['email', 'phone', 'lookup', 'phone-link'])('flags parent email for follow-up when school contact %s is unusable', async (reason) => {
    h.parentEnabled = true
    if (reason === 'email') h.schoolContactEmail = 'school@ifoundit.local'
    if (reason === 'phone') h.schoolContactPhone = ''
    if (reason === 'lookup') h.schoolContactError = true
    if (reason === 'phone-link') h.schoolContactPhone = 'https://school.org/admin'
    expect((await POST(request())).status).toBe(200)
    expect(h.send).toHaveBeenCalledTimes(1)
    expect(h.update).toHaveBeenCalledWith({ parent_notification_status: 'failed', parent_notification_sent_at: null })
    expect(h.filter).toHaveBeenCalledWith('id', 'school-one')
  })
  it.each(['opted-out', 'inactive', 'invalid-email', 'no-consent-date'])('does not notify parents for %s', async (reason) => {
    h.parentEnabled = reason !== 'opted-out'
    if (reason === 'inactive') h.studentActive = false
    if (reason === 'invalid-email') h.parentEmail = 'parent@ifoundit.local'
    if (reason === 'no-consent-date') h.consentAt = ''
    expect((await POST(request())).status).toBe(200)
    expect(h.send).toHaveBeenCalledTimes(1)
    expect(h.insert).toHaveBeenCalledWith(expect.objectContaining({ parent_notification_status: 'not_requested' }))
  })
  it('preserves school success and tracks parent failure independently', async () => {
    h.parentEnabled = true
    h.send.mockResolvedValueOnce([{ statusCode: 202 }]).mockRejectedValueOnce(new Error('parent send failed'))
    expect((await POST(request())).status).toBe(200)
    expect(h.update).toHaveBeenCalledWith({ parent_notification_status: 'failed', parent_notification_sent_at: null })
  })
  it('still submits the parent email when the school send fails', async () => {
    h.parentEnabled = true
    h.send.mockRejectedValueOnce(new Error('school send failed')).mockResolvedValueOnce([{ statusCode: 202 }])
    expect((await POST(request())).status).toBe(202)
    expect(h.send).toHaveBeenCalledTimes(2)
    expect(h.update).toHaveBeenCalledWith(expect.objectContaining({ parent_notification_status: 'submitted' }))
  })
  it('notifies a confirmed notification-only subscriber without changing school membership', async () => {
    h.recipients = [{ user_id: 'notification-only' }, { user_id: 'admin-verified' }]
    h.getUser.mockImplementation(async (id: string) => ({ data: { user: { email: id === 'notification-only' ? 'peter@ifoundit.io' : 'fixture@ifoundit.local', email_confirmed_at: '2026-01-01' } }, error: null }))
    expect((await POST(request())).status).toBe(200)
    expect(h.send).toHaveBeenCalledWith(expect.objectContaining({ to: ['peter@ifoundit.io'] }))
    expect(h.getUser.mock.calls.filter(([id]) => id === 'admin-verified')).toHaveLength(1)
    expect(h.filter).toHaveBeenCalledWith('organisation_id', 'school-one')
    expect(h.update).toHaveBeenCalledTimes(1)
  })
  it('fails closed if notification-only subscriptions cannot be read', async () => {
    h.recipientError = true
    expect((await POST(request())).status).toBe(500)
    expect(h.insert).not.toHaveBeenCalled()
    expect(h.send).not.toHaveBeenCalled()
  })
  it('does not notify an unconfirmed notification-only subscriber', async () => {
    h.recipients = [{ user_id: 'notification-only' }]
    h.getUser.mockResolvedValue({ data: { user: { email: 'peter@ifoundit.io', email_confirmed_at: null } }, error: null })
    expect((await POST(request())).status).toBe(500)
    expect(h.send).not.toHaveBeenCalled()
  })
  it('treats inactive or missing tags as unavailable', async () => {
    h.tagMissing = true
    expect((await POST(request())).status).toBe(404)
    expect(h.insert).not.toHaveBeenCalled()
    expect(h.send).not.toHaveBeenCalled()
  })
  it('fails closed when the assigned student belongs to another school', async () => {
    h.studentOrg = 'other-school'
    expect((await POST(request())).status).toBe(500)
    expect(h.insert).not.toHaveBeenCalled()
    expect(h.send).not.toHaveBeenCalled()
  })
  it('records a rejected challenge without notifying the school', async () => {
    h.parentEnabled = true
    h.fetch.mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 }))
    expect((await POST(request())).status).toBe(403)
    expect(h.insert).toHaveBeenCalledWith(expect.objectContaining({ status: 'rejected' }))
    expect(h.send).not.toHaveBeenCalled()
  })
  it('does not claim parent tracking success when database updates fail', async () => {
    h.parentEnabled = true
    h.trackingError = true
    const response = await POST(request())
    expect(response.status).toBe(202)
    expect(h.send).toHaveBeenCalledTimes(2)
    expect(console.error).toHaveBeenCalledWith('[api/found] Parent notification status could not be confirmed.', { eventId: 'event-one' })
  })
  it('fails closed when challenge verification is unavailable', async () => {
    h.fetch.mockRejectedValue(new Error('offline'))
    expect((await POST(request())).status).toBe(500)
    expect(h.insert).not.toHaveBeenCalled()
    expect(h.send).not.toHaveBeenCalled()
  })
  it('does not blame or record the finder when the challenge provider returns an HTTP error', async () => {
    h.fetch.mockResolvedValue(new Response('', { status: 503 }))
    expect((await POST(request())).status).toBe(500)
    expect(h.insert).not.toHaveBeenCalled()
    expect(h.send).not.toHaveBeenCalled()
  })
  it('rejects oversized notes before external calls', async () => {
    expect((await POST(request({ finderComments: 'x'.repeat(2001) }))).status).toBe(400)
    expect(h.from).not.toHaveBeenCalled()
  })
  it('does not store a report if notification configuration is missing', async () => {
    vi.stubEnv('SENDGRID_FROM_EMAIL', '')
    expect((await POST(request())).status).toBe(500)
    expect(h.insert).not.toHaveBeenCalled()
    expect(h.send).not.toHaveBeenCalled()
  })
  it('does not save or notify when no verified school recipient exists', async () => {
    h.getUser.mockResolvedValue({ data: { user: { email: 'unverified@school.org', email_confirmed_at: null } }, error: null })
    expect((await POST(request())).status).toBe(500)
    expect(h.insert).not.toHaveBeenCalled()
    expect(h.send).not.toHaveBeenCalled()
  })
  it('does not treat a confirmed .local fixture account as a real mail recipient', async () => {
    h.getUser.mockResolvedValue({ data: { user: { email: 'demo.school.admin@ifoundit.local', email_confirmed_at: '2026-01-01T00:00:00Z' } }, error: null })
    expect((await POST(request())).status).toBe(500)
    expect(h.insert).not.toHaveBeenCalled()
    expect(h.send).not.toHaveBeenCalled()
  })
  it('does not send email when event storage fails', async () => {
    h.eventError = true
    expect((await POST(request())).status).toBe(500)
    expect(h.send).not.toHaveBeenCalled()
  })
  it('reports a saved event with delayed notification when SendGrid fails', async () => {
    h.send.mockRejectedValue(new Error('provider unavailable'))
    const response = await POST(request())
    expect(response.status).toBe(202)
    expect(await response.json()).toMatchObject({ ok: true, code: 'found_event_recorded_notification_pending' })
    expect(h.update).not.toHaveBeenCalled()
  })
  it('reports unconfirmed delivery tracking rather than silently marking success', async () => {
    h.trackingError = true
    const response = await POST(request())
    expect(response.status).toBe(202)
    expect(await response.json()).toMatchObject({ code: 'found_event_recorded_notification_unconfirmed' })
  })
})
