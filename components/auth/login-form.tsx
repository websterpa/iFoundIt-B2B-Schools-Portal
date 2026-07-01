'use client'

import React, { useState } from 'react'

type LoginPayload = {
  email: string
  password: string
}

type LoginResult = {
  ok: boolean
  message?: string
}

type LoginFormProps = {
  onSubmit: (payload: LoginPayload) => Promise<LoginResult>
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')

    const result = await onSubmit({ email, password })

    if (!result.ok) {
      setError(result.message ?? "We couldn't sign you in with those details.")
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
