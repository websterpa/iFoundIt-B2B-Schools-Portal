import { NextResponse } from 'next/server'

import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { validateDemoRequestInput } from '@/lib/marketing/demo-request/validation'

export async function POST(request: Request) {
  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json(
      {
        ok: false,
        issue: 'invalid_payload',
        message: 'We could not read your submission payload.'
      },
      { status: 400 }
    )
  }

  const validation = validateDemoRequestInput(payload)

  if (!validation.ok) {
    return NextResponse.json(
      {
        ok: false,
        issue: validation.issue,
        message: validation.message
      },
      { status: 400 }
    )
  }

  const supabase = createSupabaseServiceClient()
  const input = validation.value

  const { error } = await supabase.from('demo_requests').insert({
    full_name: input.fullName,
    school_name: input.schoolName,
    role: input.role,
    email: input.email,
    rollout_scope: input.rolloutScope,
    school_type: input.schoolType,
    trust_name: input.trustName,
    schools_in_trust: input.schoolsInTrust,
    pupil_count: input.pupilCount,
    phone_policy: input.phonePolicy,
    lost_property_handling: input.lostPropertyHandling,
    purchase_timeline: input.purchaseTimeline,
    budget_authority: input.budgetAuthority,
    marketing_consent: input.marketingConsent,
    message: input.message
  })

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        issue: 'storage_error',
        message: 'We could not save your request right now. Please try again shortly.'
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    message: 'Thanks. Your demo request has been received.'
  })
}
