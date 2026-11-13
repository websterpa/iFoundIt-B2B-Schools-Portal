import sgMail from '@sendgrid/mail'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { formatItemClassification } from '@/lib/tags/item-classification'
import { schoolNotificationEmail } from '@/lib/finder/notification-email'

type FoundPayload = {
  serialNumber: string
  turnstileToken: string
  finderComments?: string
}

type TurnstileVerifyResponse = {
  success: boolean
  'error-codes'?: string[]
}

type FoundApiResponse = {
  ok: boolean
  message: string
  code: string
}

function jsonResponse(body: FoundApiResponse, status: number) {
  return NextResponse.json(body, { status })
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parsePayload(payload: unknown): { ok: true; value: FoundPayload } | { ok: false; message: string } {
  if (!isRecord(payload)) {
    return { ok: false, message: 'Payload must be a JSON object.' }
  }

  const serialNumberRaw = payload.serialNumber
  const turnstileTokenRaw = payload.turnstileToken
  const finderCommentsRaw = payload.finderComments

  if (typeof serialNumberRaw !== 'string' || !/^[A-Z0-9]{8,64}$/.test(serialNumberRaw.trim().toUpperCase())) {
    return { ok: false, message: 'A valid tag serial is required.' }
  }

  if (typeof turnstileTokenRaw !== 'string' || turnstileTokenRaw.trim().length === 0) {
    return { ok: false, message: 'turnstileToken is required.' }
  }

  if (finderCommentsRaw !== undefined && typeof finderCommentsRaw !== 'string') {
    return { ok: false, message: 'finderComments must be a string when provided.' }
  }
  if (typeof finderCommentsRaw === 'string' && finderCommentsRaw.length > 2000) {
    return { ok: false, message: 'Finder notes must be 2,000 characters or fewer.' }
  }

  return {
    ok: true,
    value: {
      serialNumber: serialNumberRaw.trim().toUpperCase(),
      turnstileToken: turnstileTokenRaw.trim(),
      finderComments: typeof finderCommentsRaw === 'string' ? finderCommentsRaw.trim() : undefined
    }
  }
}

function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase service-role configuration.')
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

function renderEventEmailHtml(serialNumber: string, finderComments: string | undefined, appUrl: string, itemLabel: string) {
  const escapedSerial = serialNumber
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

  const safeComments = (finderComments ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2 style="margin-bottom: 12px;">iFoundIt Tag Scanned</h2>
      <p style="margin: 0 0 8px;"><strong>Tag:</strong> ${escapedSerial}</p>
      <p style="margin: 0 0 8px;"><strong>Item:</strong> ${itemLabel}</p>
      <p style="margin: 0 0 8px;"><strong>Finder notes:</strong> ${safeComments || 'None provided'}</p>
      <p style="margin: 16px 0 0;">
        <a href="${appUrl}/events" style="color: #0f766e; text-decoration: underline;">Review this event in the portal</a>
      </p>
    </div>
  `
}

async function resolveOrganisationAdminEmails(
  supabase: ReturnType<typeof getSupabaseServiceClient>,
  organisationId: string
) {
  const { data: admins, error: adminError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('organisation_id', organisationId)

  if (adminError) {
    throw new Error(`Admin lookup failed: ${adminError.message}`)
  }

  const { data: recipients, error: recipientError } = await supabase
    .from('school_notification_recipients')
    .select('user_id')
    .eq('organisation_id', organisationId)
  if (recipientError) {
    throw new Error('School notification recipient lookup failed.')
  }

  const adminIds = [...new Set([
    ...(admins ?? []).map((admin) => admin.id),
    ...(recipients ?? []).map((recipient) => recipient.user_id)
  ]
    .map((id) => (typeof id === 'string' ? id.trim() : ''))
    .filter((id): id is string => id.length > 0))]

  if (adminIds.length === 0) {
    return [] as string[]
  }

  const userLookups = await Promise.all(adminIds.map(async (adminId) => supabase.auth.admin.getUserById(adminId)))

  const lookupErrors = userLookups.filter((lookup) => lookup.error)

  if (lookupErrors.length > 0) {
    throw new Error(`Admin email lookup failed for ${lookupErrors.length} account(s).`)
  }

  return [...new Set(userLookups
    .filter((lookup) => Boolean(lookup.data.user?.email_confirmed_at))
    .map((lookup) => schoolNotificationEmail(lookup.data.user?.email))
    .filter((email): email is string => email !== null))]
}

async function verifyTurnstile(token: string, request: Request): Promise<TurnstileVerifyResponse> {
  const turnstileSecretKey = process.env.TURNSTILE_SECRET_KEY

  if (!turnstileSecretKey) {
    throw new Error('Missing TURNSTILE_SECRET_KEY configuration.')
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  const remoteIp = forwardedFor?.split(',')[0]?.trim()

  const form = new URLSearchParams({
    secret: turnstileSecretKey,
    response: token
  })

  if (remoteIp) {
    form.set('remoteip', remoteIp)
  }

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: form.toString(),
    cache: 'no-store'
  })

  if (!response.ok) {
    throw new Error('Challenge verification service is unavailable.')
  }

  const data = (await response.json()) as TurnstileVerifyResponse

  return {
    success: data.success === true,
    'error-codes': Array.isArray(data['error-codes']) ? data['error-codes'] : []
  }
}

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return jsonResponse(
      {
        ok: false,
        code: 'invalid_json_payload',
        message: 'Invalid JSON payload.'
      },
      400
    )
  }

  const parsed = parsePayload(payload)

  if (!parsed.ok) {
    return jsonResponse(
      {
        ok: false,
        code: 'invalid_payload',
        message: parsed.message
      },
      400
    )
  }

  const { serialNumber, turnstileToken, finderComments } = parsed.value

  try {
    const supabase = getSupabaseServiceClient()

    const { data: tag, error: tagError } = await supabase
      .from('tags')
      .select('id, organisation_id, student_id, item_kind, laptop_ownership')
      .eq('serial', serialNumber)
      .eq('active', true)
      .maybeSingle()

    if (tagError) {
      throw new Error(`Tag lookup failed: ${tagError.message}`)
    }

    if (!tag || !tag.organisation_id) {
      return jsonResponse(
        {
          ok: false,
          code: 'tag_not_found',
          message: 'Tag not found.'
        },
        404
      )
    }

    let studentActive = false
    if (tag.student_id) {
      const { data: student, error } = await supabase.from('students')
        .select('organisation_id, active').eq('id', tag.student_id)
        .eq('organisation_id', tag.organisation_id).maybeSingle()
      if (error || !student || student.organisation_id !== tag.organisation_id) {
        throw new Error('Assigned student ownership could not be verified.')
      }
      studentActive = student.active === true
    }

    const verification = await verifyTurnstile(turnstileToken, request)

    if (!verification.success) {
      console.warn('[api/found] Turnstile verification failed.', {
        serialNumber,
        errors: verification['error-codes'] ?? []
      })

      const { error: rejectionInsertError } = await supabase.from('found_events').insert({
        organisation_id: tag.organisation_id,
        tag_id: tag.id,
        status: 'rejected',
        finder_message: finderComments ?? null
      })

      if (rejectionInsertError) {
        console.warn('[api/found] Failed to persist rejected event.', {
          serialNumber,
          error: rejectionInsertError.message
        })
      }

      return jsonResponse(
        {
          ok: false,
          code: 'turnstile_verification_failed',
          message: 'Turnstile verification failed.'
        },
        403
      )
    }

    let contactEmails: string[] = []
    if (studentActive && tag.student_id) {
      const { data: contacts, error: contactError } = await supabase.from('student_trusted_contacts')
        .select('email, approved, approved_at, notifications_enabled, opted_in_at')
        .eq('student_id', tag.student_id).eq('organisation_id', tag.organisation_id)
        .eq('approved', true).eq('notifications_enabled', true)
      if (contactError) throw new Error('Trusted Contact lookup failed.')
      contactEmails = [...new Set((contacts ?? [])
        .filter((contact) => contact.approved === true && contact.notifications_enabled === true && contact.approved_at && contact.opted_in_at)
        .map((contact) => schoolNotificationEmail(contact.email))
        .filter((email): email is string => email !== null))]
    }
    const to = await resolveOrganisationAdminEmails(supabase, tag.organisation_id)

    if (to.length === 0) {
      throw new Error('No verified school administrator email is available for this organisation.')
    }

    const sendGridApiKey = process.env.SENDGRID_API_KEY
    const sendGridFromEmail = process.env.SENDGRID_FROM_EMAIL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL

    if (!sendGridApiKey || !sendGridFromEmail || !appUrl) {
      throw new Error('Missing SendGrid or app URL configuration.')
    }

    const { data: event, error: insertError } = await supabase.from('found_events').insert({
      organisation_id: tag.organisation_id,
      tag_id: tag.id,
      status: 'pending',
      finder_message: finderComments ?? null,
      parent_notification_status: contactEmails.length ? 'pending' : 'not_requested'
    }).select('id').single()

    if (insertError || !event) {
      throw new Error('Failed to persist found event.')
    }

    sgMail.setApiKey(sendGridApiKey)
    let schoolSent = false
    let schoolTracked = false
    try {
      await sgMail.sendMultiple({
        to,
        from: sendGridFromEmail,
        subject: `iFoundIt alert: tag ${serialNumber} was scanned`,
        html: renderEventEmailHtml(serialNumber, finderComments, appUrl, formatItemClassification(tag.item_kind, tag.laptop_ownership))
      })
      schoolSent = true
    } catch {
      console.error('[api/found] Notification delivery failed for saved event.', { eventId: event.id })
    }

    if (schoolSent) {
      const submittedAt = new Date().toISOString()
      const { data: tracked, error: trackingError } = await supabase.from('found_events')
      .update({ notification_sent_at: submittedAt, school_notification_sent_at: submittedAt })
      .eq('id', event.id).eq('organisation_id', tag.organisation_id).select('id').maybeSingle()
      schoolTracked = !trackingError && Boolean(tracked)
      if (!schoolTracked) console.error('[api/found] Notification accepted but delivery tracking failed.', { eventId: event.id })
    }

    if (contactEmails.length) {
      // Separate message: never disclose other recipients, finder notes, or an admin URL.
      let submittedCount = 0
      try {
        const { data: school, error: schoolError } = await supabase.from('organisations')
          .select('contact_email, contact_phone, collection_details').eq('id', tag.organisation_id).eq('active', true).maybeSingle()
        const schoolEmail = schoolNotificationEmail(school?.contact_email)
        const schoolPhone = typeof school?.contact_phone === 'string' ? school.contact_phone.trim() : ''
        if (schoolError || !school || !schoolEmail || !/^[+\d][\d ().-]{5,39}$/.test(schoolPhone)) {
          throw new Error('Usable school contact details are required for Trusted Contact notifications.')
        }
        const collectionDetails = typeof school.collection_details === 'string' ? school.collection_details.trim() : ''
        if (collectionDetails.length > 2000 || /https?:\/\/|www\./i.test(collectionDetails)) throw new Error('Collection instructions require review.')
        for (const email of contactEmails) {
          try {
            await sgMail.sendMultiple({
              to: [email], from: sendGridFromEmail,
              subject: 'iFoundIt: an item linked to a student you support has been reported found',
              text: `Hello,\n\nAn item linked to a student you support has been reported found through iFoundIt.\n\nItem: ${formatItemClassification(tag.item_kind, tag.laptop_ownership)}\nTag reference: ${serialNumber}\n\nPlease contact the school's team to arrange the next steps.\nSchool email: ${schoolEmail}\nSchool phone: ${schoolPhone}\n\n${collectionDetails ? `Collection Details:\n${collectionDetails}` : 'Collection Details: Contact the school to confirm the collection location and opening hours before travelling.'}\n\nA report is not a guarantee that the item has been recovered or is ready for collection.\n\nYou received this email because the school approved you as a Trusted Contact and recorded your opt-in. To stop future alerts or change your details, contact the school using the details above.\n\niFoundIt Schools`
            })
            submittedCount += 1
          } catch {
            console.error('[api/found] Trusted Contact notification failed for saved event.', { eventId: event.id })
          }
        }
      } catch {
        console.error('[api/found] Trusted Contact notifications could not be prepared.', { eventId: event.id })
      }
      const { data: parentTracked, error: parentTrackingError } = await supabase.from('found_events')
        .update({ parent_notification_status: submittedCount === contactEmails.length ? 'submitted' : submittedCount ? 'partial' : 'failed', parent_notification_sent_at: submittedCount ? new Date().toISOString() : null })
        .eq('id', event.id).eq('organisation_id', tag.organisation_id).select('id').maybeSingle()
      if (parentTrackingError || !parentTracked) {
        console.error('[api/found] Parent notification status could not be confirmed.', { eventId: event.id })
      }
    }

    if (!schoolSent) {
      return jsonResponse({ ok: true, code: 'found_event_recorded_notification_pending', message: 'Your report was saved, but the school email could not be sent. The school can see the report in their recovery events.' }, 202)
    }
    if (!schoolTracked) {
      return jsonResponse({ ok: true, code: 'found_event_recorded_notification_unconfirmed', message: 'Your report was saved and the school email was submitted, but its status could not be confirmed.' }, 202)
    }

    return jsonResponse(
      {
        ok: true,
        code: 'found_event_recorded',
        message: 'Found event recorded.'
      },
      200
    )
  } catch (error) {
    console.error('[api/found] Unhandled failure while processing found event.', {
      serialNumber,
      error: error instanceof Error ? error.message : 'unknown_error'
    })

    return jsonResponse(
      {
        ok: false,
        code: 'processing_failed',
        message: 'We could not process this request right now.'
      },
      500
    )
  }
}
