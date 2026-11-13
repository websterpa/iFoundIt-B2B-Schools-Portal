import React from 'react'
import { render, screen } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { EventWorkspace } from '@/components/events/event-workspace'

it('distinguishes rejected reports and unconfirmed email from accepted notifications', () => {
  const common = { serial: 'HERO0001', studentName: 'Fixture Student', itemKind: 'hero_laptop', laptopOwnership: 'school', createdAt: '2026-01-01T12:00:00Z', resolvedAt: null, parentNotificationStatus: 'not_requested' }
  render(<EventWorkspace events={[
    { ...common, id: 'pending', status: 'pending', notificationSentAt: null },
    { ...common, id: 'sent', status: 'resolved', notificationSentAt: '2026-01-01T12:00:01Z' },
    { ...common, id: 'rejected', status: 'rejected', notificationSentAt: null }
  ]} rejections={[]} resolveFoundEventAction={vi.fn()} />)
  expect(screen.getByText('Rejected', { exact: true })).toBeInTheDocument()
  expect(screen.getByText('Not sent', { exact: true })).toBeInTheDocument()
  expect(screen.getByText('Not yet confirmed', { exact: true })).toBeInTheDocument()
  expect(screen.getByText('Submitted', { exact: true })).toBeInTheDocument()
  expect(screen.getAllByRole('button', { name: 'Mark resolved' })).toHaveLength(1)
})

it('shows parent failures and opt-out separately from school submission', () => {
  const common = { serial: 'HERO0001', studentName: null, itemKind: 'hero_laptop', laptopOwnership: 'student', createdAt: '2026-01-01T12:00:00Z', resolvedAt: null, status: 'pending' as const, notificationSentAt: '2026-01-01T12:00:01Z' }
  render(<EventWorkspace events={[
    { ...common, id: 'parent-failed', parentNotificationStatus: 'failed' },
    { ...common, id: 'partial', parentNotificationStatus: 'partial' },
    { ...common, id: 'parent-pending', parentNotificationStatus: 'pending' },
    { ...common, id: 'parent-off', parentNotificationStatus: 'not_requested' }
  ]} rejections={[]} resolveFoundEventAction={vi.fn()} />)
  expect(screen.getByText('Failed - follow up')).toBeInTheDocument()
  expect(screen.getByText('Partially submitted - follow up')).toBeInTheDocument()
  expect(screen.getByText('Not requested')).toBeInTheDocument()
  expect(screen.getByText('Not yet confirmed')).toBeInTheDocument()
  expect(screen.getAllByText('Submitted')).toHaveLength(4)
})
