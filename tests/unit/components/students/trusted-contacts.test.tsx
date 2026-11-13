import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { TrustedContactEditor } from '@/components/students/trusted-contact-editor'

it('requires individual approval and opt-in and resets both when an email is changed', async () => {
  const save = vi.fn(async () => ({ ok: true, message: 'Trusted contact saved.', data: {} }))
  render(<TrustedContactEditor studentId="student" contacts={[]} legacyEmail={null} actions={{ save, remove: vi.fn() }} />)
  fireEvent.click(screen.getByText('0 trusted contacts'))
  expect(screen.getByLabelText('School approves this trusted contact')).not.toBeChecked()
  expect(screen.getByLabelText('Contact has opted in to found-item emails')).not.toBeChecked()
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'grandparent@school.org' } })
  fireEvent.click(screen.getByLabelText('School approves this trusted contact'))
  fireEvent.click(screen.getByLabelText('Contact has opted in to found-item emails'))
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'guardian@school.org' } })
  expect(screen.getByLabelText('School approves this trusted contact')).not.toBeChecked()
  expect(screen.getByLabelText('Contact has opted in to found-item emails')).not.toBeChecked()
  fireEvent.click(screen.getByRole('button', { name: 'Add trusted contact' }))
  await waitFor(() => expect(save).toHaveBeenCalledWith(expect.objectContaining({ email: 'guardian@school.org', approved: false, enabled: false })))
})

it('requires explicit confirmation before deleting a contact', async () => {
  const remove = vi.fn(async () => ({ ok: true, message: 'Deleted', data: {} }))
  render(<TrustedContactEditor studentId="student" legacyEmail="legacy@school.org" actions={{ save: vi.fn(), remove }} contacts={[{
    id: 'contact', displayName: 'Synthetic Grandparent', relationship: 'Grandparent', email: 'contact@school.org', phone: null, approved: true, enabled: false
  }]} />)
  fireEvent.click(screen.getByText('1 trusted contact'))
  fireEvent.click(screen.getByText(/Synthetic Grandparent/))
  fireEvent.click(screen.getByRole('button', { name: 'Delete trusted contact' }))
  expect(remove).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'Confirm delete' }))
  await waitFor(() => expect(remove).toHaveBeenCalledWith({ studentId: 'student', contactId: 'contact' }))
  expect(screen.getByText(/Legacy parent record retained/)).toBeInTheDocument()
})
