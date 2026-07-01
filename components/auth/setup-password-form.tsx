'use client'

import React, { useState } from 'react'

type SetupPasswordResult = {
  ok: boolean
  message?: string
}

type SetupPasswordFormProps = {
  onSubmit: (password: string) => Promise<SetupPasswordResult>
}

export function SetupPasswordForm({ onSubmit }: SetupPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords must match.')
      return
    }

    setLoading(true)
    setError('')

    const result = await onSubmit(password)

    if (!result.ok) {
      setError(result.message ?? 'This setup link is no longer valid.')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="new-password">New password</label>
      <input
        id="new-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <label htmlFor="confirm-password">Confirm password</label>
      <input
        id="confirm-password"
        type="password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? 'Completing setup...' : 'Complete setup'}
      </button>
    </form>
  )
}
