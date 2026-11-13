'use client'

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import Script from 'next/script'
import { useParams } from 'next/navigation'

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error'
type FoundApiResponse = {
  ok: boolean
  message: string
  code: string
}

declare global {
  interface Window {
    onloadTurnstileCallback?: () => void
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          callback?: (token: string) => void
          'expired-callback'?: () => void
          'error-callback'?: () => void
          theme?: 'light' | 'dark' | 'auto'
        }
      ) => string
      reset: (widgetId?: string) => void
      remove?: (widgetId: string) => void
    }
  }
}

function isFoundApiResponse(value: unknown): value is FoundApiResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as Record<string, unknown>

  return (
    typeof candidate.ok === 'boolean' &&
    typeof candidate.message === 'string' &&
    typeof candidate.code === 'string'
  )
}

export default function FindSerialPage() {
  const params = useParams<{ serial?: string | string[] }>()
  const serial = useMemo(() => {
    if (!params?.serial) {
      return ''
    }

    return Array.isArray(params.serial) ? params.serial[0] ?? '' : params.serial
  }, [params])

  const [finderComments, setFinderComments] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [status, setStatus] = useState<SubmissionStatus>('idle')
  const [message, setMessage] = useState('')

  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<string | null>(null)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY ?? ''

  useEffect(() => {
    window.onloadTurnstileCallback = () => {
      window.dispatchEvent(new Event('turnstile-loaded'))
    }

    return () => {
      delete window.onloadTurnstileCallback
    }
  }, [])

  useEffect(() => {
    if (!siteKey) {
      return
    }

    const mountTurnstile = () => {
      if (!turnstileContainerRef.current || !window.turnstile) {
        return
      }

      if (turnstileWidgetIdRef.current && window.turnstile.remove) {
        window.turnstile.remove(turnstileWidgetIdRef.current)
        turnstileWidgetIdRef.current = null
      }

      turnstileWidgetIdRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          setTurnstileToken(token)
          setStatus((previous) => (previous === 'error' ? 'idle' : previous))
          setMessage((previous) => (previous ? '' : previous))
        },
        'expired-callback': () => {
          setTurnstileToken('')
        },
        'error-callback': () => {
          setTurnstileToken('')
        },
        theme: 'light'
      })
    }

    const handleLoaded = () => {
      mountTurnstile()
    }

    window.addEventListener('turnstile-loaded', handleLoaded)

    if (window.turnstile) {
      mountTurnstile()
    }

    return () => {
      window.removeEventListener('turnstile-loaded', handleLoaded)
      if (turnstileWidgetIdRef.current && window.turnstile?.remove) {
        window.turnstile.remove(turnstileWidgetIdRef.current)
      }
    }
  }, [siteKey])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!serial) {
      setStatus('error')
      setMessage('Tag serial is missing from this link.')
      return
    }

    if (!siteKey) {
      setStatus('error')
      setMessage('Verification is not configured right now. Please try again shortly.')
      return
    }

    if (!turnstileToken) {
      setStatus('error')
      setMessage('Complete the verification challenge before sending this report.')
      return
    }

    setStatus('submitting')
    setMessage('')

    try {
      const response = await fetch('/api/found', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          serialNumber: serial,
          turnstileToken,
          finderComments
        })
      })

      const rawBody = await response.json().catch(() => null)
      const body = isFoundApiResponse(rawBody) ? rawBody : null

      if (!response.ok) {
        setStatus('error')
        setMessage(body?.message ?? 'We could not send this report. Please try again.')
        setTurnstileToken('')

        if (window.turnstile) {
          if (turnstileWidgetIdRef.current) {
            window.turnstile.reset(turnstileWidgetIdRef.current)
          } else {
            window.turnstile.reset()
          }
        }

        return
      }

      setStatus('success')
      setMessage(body?.message ?? 'Thank you. Your report has been sent to the school team.')
      setFinderComments('')
      setTurnstileToken('')
    } catch {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
      setTurnstileToken('')

      if (window.turnstile) {
        if (turnstileWidgetIdRef.current) {
          window.turnstile.reset(turnstileWidgetIdRef.current)
        } else {
          window.turnstile.reset()
        }
      }
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback&render=explicit"
        strategy="afterInteractive"
      />

      <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Item found</h1>
        <p className="mt-2 text-sm text-slate-600">
          You can help return this item by submitting a quick report for the school team.
        </p>

        <section className="mt-5 rounded-xl border border-teal-200 bg-teal-50 p-3">
          <p className="text-xs font-medium uppercase tracking-wide text-teal-800">Tag serial</p>
          <p className="mt-1 break-all font-mono text-sm text-teal-900">{serial || 'Unavailable'}</p>
        </section>

        {message ? (
          <div
            className={`mt-4 rounded-xl border px-3 py-2 text-sm ${
              status === 'success'
                ? 'border-teal-200 bg-teal-50 text-teal-900'
                : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
            role={status === 'error' ? 'alert' : 'status'}
          >
            {message}
          </div>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="finder-comments" className="block text-sm font-medium text-slate-800">
              Notes for the school team (optional)
            </label>
            <textarea
              id="finder-comments"
              name="finderComments"
              rows={5}
              maxLength={2000}
              value={finderComments}
              onChange={(event) => setFinderComments(event.target.value)}
              placeholder="Where you found it, time, and any details that might help."
              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            />
          </div>

          <div>
            <p className="mb-2 text-xs text-slate-600">Complete verification before submitting.</p>
            <div ref={turnstileContainerRef} className="min-h-[65px]" />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting' || !serial || !siteKey}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {status === 'submitting' ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                Sending...
              </>
            ) : (
              'Send found report'
            )}
          </button>
        </form>
      </div>
    </main>
  )
}
