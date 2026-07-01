import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { SetupPasswordForm } from '@/components/auth/setup-password-form'

describe('SetupPasswordForm', () => {
  it('rejects mismatched passwords before submit', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(<SetupPasswordForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/new password/i), 'Password123!')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password456!')
    await user.click(screen.getByRole('button', { name: /complete setup/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Passwords must match.')
  })
})
