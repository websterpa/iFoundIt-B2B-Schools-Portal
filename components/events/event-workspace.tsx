'use client'

import React, { useState, useTransition } from 'react'
import { formatItemClassification } from '@/lib/tags/item-classification'

type EventRow = {
  id: string
  serial: string
  studentName: string | null
  itemKind: string | null
  laptopOwnership: string | null
  createdAt: string
  status: 'pending' | 'resolved' | 'rejected'
  resolvedAt: string | null
  notificationSentAt: string | null
  parentNotificationStatus: string
}

type RejectionRow = {
  id: string
  serial: string
  rejectionReason: string
  createdAt: string
}

type ActionResponse<T> = {
  ok: boolean
  message: string
  data: T
}

type EventWorkspaceProps = {
  events: EventRow[]
  rejections: RejectionRow[]
  resolveFoundEventAction: (input: { eventId: string }) => Promise<ActionResponse<Record<string, never>>>
}

export function EventWorkspace({
  events,
  rejections,
  resolveFoundEventAction
}: EventWorkspaceProps) {
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleResolve(eventId: string) {
    startTransition(async () => {
      const result = await resolveFoundEventAction({ eventId })
      setMessage(result.message)
    })
  }

  return (
    <div>
      <section aria-labelledby="events-heading">
        <h2 id="events-heading">Recovery events</h2>
        {events.length === 0 ? (
          <p>No found events yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tag serial</th>
                <th>Student</th>
                <th>Item</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>School email</th>
                <th>Trusted Contact emails</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{event.serial}</td>
                  <td>{event.studentName ?? 'Unassigned tag'}</td>
                  <td>{formatItemClassification(event.itemKind, event.laptopOwnership)}</td>
                  <td>{new Date(event.createdAt).toISOString()}</td>
                  <td>{event.status === 'resolved' ? 'Resolved' : event.status === 'rejected' ? 'Rejected' : 'Pending'}</td>
                  <td>{event.status === 'rejected' ? 'Not sent' : event.notificationSentAt ? 'Submitted' : 'Not yet confirmed'}</td>
                  <td>{event.parentNotificationStatus === 'submitted' ? 'Submitted' : event.parentNotificationStatus === 'partial' ? 'Partially submitted - follow up' : event.parentNotificationStatus === 'failed' ? 'Failed - follow up' : event.parentNotificationStatus === 'pending' || event.parentNotificationStatus === 'unconfirmed' ? 'Not yet confirmed' : 'Not requested'}</td>
                  <td>
                    {event.status === 'pending' ? (
                      <button type="button" disabled={isPending} onClick={() => handleResolve(event.id)}>
                        {isPending ? 'Saving…' : 'Mark resolved'}
                      </button>
                    ) : (
                      event.status === 'rejected' ? 'No action' : event.resolvedAt ? new Date(event.resolvedAt).toISOString() : 'Resolved'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {message ? <p role="status">{message}</p> : null}

      <section aria-labelledby="rejections-heading">
        <h2 id="rejections-heading">Rejected finder submissions</h2>
        {rejections.length === 0 ? (
          <p>No rejection log entries.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Serial</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {rejections.map((rejection) => (
                <tr key={rejection.id}>
                  <td>{new Date(rejection.createdAt).toISOString()}</td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{rejection.serial}</td>
                  <td>{rejection.rejectionReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
