'use client'

import { useRouter } from 'next/navigation'

import { LoginForm } from '@/components/auth/login-form'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()

  return (
    <main>
      <h1>School admin login</h1>
      <p>Use your school admin email and password to access the portal.</p>
      <LoginForm
        onSubmit={async ({ email, password }) => {
          const supabase = createSupabaseBrowserClient()
          const { error } = await supabase.auth.signInWithPassword({ email, password })

          if (error) {
            return {
              ok: false,
              message: 'We could not sign you in with those details.'
            }
          }

          const sessionResponse = await fetch('/api/auth/session', {
            cache: 'no-store'
          })

          if (!sessionResponse.ok) {
            return {
              ok: false,
              message: 'Your credentials were accepted, but portal access could not be verified.'
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
              message: 'Your account does not have portal access yet.'
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
