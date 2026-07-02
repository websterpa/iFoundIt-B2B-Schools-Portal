import { createHmac, timingSafeEqual } from 'node:crypto'

import { readServerEnv } from '@/lib/env'
import type { ProvisioningPreviewTokenPayload } from '@/lib/admin/onboarding/contracts'
import { PROVISIONING_PREVIEW_MAX_AGE_MINUTES } from '@/lib/admin/onboarding/contracts'

function resolvePreviewSecret(secret?: string) {
  if (secret) {
    return secret
  }

  return readServerEnv({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
  }).supabaseServiceRoleKey
}

function isProvisioningPreviewPayload(value: unknown): value is ProvisioningPreviewTokenPayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const payload = value as ProvisioningPreviewTokenPayload

  return (
    typeof payload.organisationId === 'string' &&
    typeof payload.generatedAt === 'string' &&
    Array.isArray(payload.acceptedSerials) &&
    payload.acceptedSerials.every((serial) => typeof serial === 'string')
  )
}

export function signProvisioningPreview(
  payload: ProvisioningPreviewTokenPayload,
  secret?: string
) {
  const resolvedSecret = resolvePreviewSecret(secret)
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = createHmac('sha256', resolvedSecret).update(body).digest('base64url')

  return `${body}.${signature}`
}

export function verifyProvisioningPreview(
  token: string,
  secret?: string,
  now = new Date()
) {
  const resolvedSecret = resolvePreviewSecret(secret)
  const [body, signature] = token.split('.')

  if (!body || !signature) {
    return null
  }

  let providedSignature: Buffer
  let expectedSignature: Buffer

  try {
    providedSignature = Buffer.from(signature, 'base64url')
    expectedSignature = createHmac('sha256', resolvedSecret).update(body).digest()
  } catch {
    return null
  }

  if (providedSignature.length !== expectedSignature.length) {
    return null
  }

  if (!timingSafeEqual(providedSignature, expectedSignature)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))

    if (!isProvisioningPreviewPayload(payload)) {
      return null
    }

    const generatedAt = new Date(payload.generatedAt)

    if (Number.isNaN(generatedAt.getTime())) {
      return null
    }

    const maxAgeMs = PROVISIONING_PREVIEW_MAX_AGE_MINUTES * 60 * 1000

    if (now.getTime() - generatedAt.getTime() > maxAgeMs) {
      return null
    }

    return payload
  } catch {
    return null
  }
}
