'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { createSupabaseBrowserClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true)

        void (async () => {
          const supabase = createSupabaseBrowserClient()

          await supabase.auth.signOut()
          router.replace('/login')
          router.refresh()
          setLoading(false)
        })()
      }}
    >
      {loading ? 'Signing out...' : 'Sign out'}
    </button>
  )
}
