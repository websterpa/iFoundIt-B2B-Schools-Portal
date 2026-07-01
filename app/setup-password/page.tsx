'use client'

import { useRouter } from 'next/navigation'

import { SetupPasswordForm } from '@/components/auth/setup-password-form'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function SetupPasswordPage() {
  const router = useRouter()

  return (
    <main>
      <h1>Account setup</h1>
      <p>Choose a password to activate your school admin account.</p>
      <SetupPasswordForm
        onSubmit={async (password) => {
          const supabase = createSupabaseBrowserClient()
          const { error } = await supabase.auth.updateUser({ password })

          if (error) {
            return {
              ok: false,
              message: 'This setup link is no longer valid.'
            }
          }

          const sessionResponse = await fetch('/api/auth/session', {
            cache: 'no-store'
          })

          if (!sessionResponse.ok) {
            return {
              ok: false,
              message: 'Password updated, but portal access could not be verified.'
            }
          }

          const session = (await sessionResponse.json()) as {
            authorised: boolean
            redirectTo: string | null
          }

          if (!session.authorised || !session.redirectTo) {
            await supabase.auth.signOut()
            return {
              ok: false,
              message: 'Your account is active, but it is not linked to a portal role yet.'
            }
          }

          router.replace(session.redirectTo)
          router.refresh()

          return { ok: true }
        }}
      />
    </main>
  )
}
