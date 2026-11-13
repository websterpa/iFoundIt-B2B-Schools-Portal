import { cookies } from 'next/headers'

const SUPERADMIN_SCHOOL_CONTEXT_COOKIE = 'ifoundit_superadmin_school_context'

const ONE_DAY_SECONDS = 60 * 60 * 24
const THIRTY_DAYS_SECONDS = ONE_DAY_SECONDS * 30

export function readSuperadminSchoolContext(): string | null {
  const value = cookies().get(SUPERADMIN_SCHOOL_CONTEXT_COOKIE)?.value?.trim()

  if (!value) {
    return null
  }

  return value
}

export function writeSuperadminSchoolContext(organisationId: string) {
  cookies().set(SUPERADMIN_SCHOOL_CONTEXT_COOKIE, organisationId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: THIRTY_DAYS_SECONDS
  })
}

export function clearSuperadminSchoolContext() {
  cookies().delete(SUPERADMIN_SCHOOL_CONTEXT_COOKIE)
}
