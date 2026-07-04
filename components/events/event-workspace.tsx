'use client'

import React, { useState, useTransition } from 'react'

type EventRow = {
  id: string
  serial: string
  studentName: string | null
  createdAt: string
  status: 'pending' | 'resolved'
  resolvedAt: string | null
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
                <th>Timestamp</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace' }}>{event.serial}</td>
                  <td>{event.studentName ?? 'Unassigned tag'}</td>
                  <td>{new Date(event.createdAt).toISOString()}</td>
                  <td>{event.status === 'resolved' ? 'Resolved (green)' : 'Pending (amber)'}</td>
                  <td>
                    {event.status === 'pending' ? (
                      <button type="button" disabled={isPending} onClick={() => handleResolve(event.id)}>
                        {isPending ? 'Saving…' : 'Mark resolved'}
                      </button>
                    ) : (
                      event.resolvedAt ? new Date(event.resolvedAt).toISOString() : 'Resolved'
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
