'use client'

import React, { useState, useTransition } from 'react'
import type { TrustedContact, ContactActions } from '@/lib/students/trusted-contacts'

function ContactForm({ studentId, contact, actions }: { studentId: string; contact?: TrustedContact; actions: ContactActions }) {
  const [approved, setApproved] = useState(contact?.approved ?? false)
  const [enabled, setEnabled] = useState(contact?.enabled ?? false)
  const [message, setMessage] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, startTransition] = useTransition()
  return <div>
    <form aria-label={contact ? 'Edit trusted contact' : 'Add trusted contact'} onSubmit={(event) => {
      event.preventDefault()
      const form = event.currentTarget
      const fields = new FormData(form)
      startTransition(async () => {
        const result = await actions.save({ studentId, contactId: contact?.id,
          displayName: String(fields.get('displayName') ?? ''), relationship: String(fields.get('relationship') ?? ''),
          email: String(fields.get('email') ?? ''), phone: String(fields.get('phone') ?? ''), approved, enabled })
        setMessage(result.message)
        if (result.ok && !contact) { form.reset(); setApproved(false); setEnabled(false) }
      })
    }}>
      <label>Name (optional)<input name="displayName" maxLength={120} defaultValue={contact?.displayName ?? ''} /></label>
      <label>Relationship (optional)<input name="relationship" maxLength={80} defaultValue={contact?.relationship ?? ''} placeholder="Grandparent, guardian, parent…" /></label>
      <label>Email<input name="email" type="email" required maxLength={254} defaultValue={contact?.email ?? ''} onChange={() => { setApproved(false); setEnabled(false) }} /></label>
      <label>Phone (optional)<input name="phone" type="tel" maxLength={60} defaultValue={contact?.phone ?? ''} /></label>
      <label><input type="checkbox" checked={approved} onChange={(event) => setApproved(event.target.checked)} />School approves this trusted contact</label>
      <label><input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />Contact has opted in to found-item emails</label>
      <p>Both approval and opt-in are required. Changing an email clears both; save it first, then confirm permission for the new address.</p>
      <button disabled={pending} type="submit">{contact ? 'Save trusted contact' : 'Add trusted contact'}</button>
    </form>
    {contact && !confirmDelete ? <button disabled={pending} type="button" onClick={() => setConfirmDelete(true)}>Delete trusted contact</button> : null}
    {contact && confirmDelete ? <div role="group" aria-label="Confirm contact deletion">
      <p>Delete this contact permanently and stop future alerts? Legacy parent records are retained separately.</p>
      <button disabled={pending} type="button" onClick={() => startTransition(async () => { const result = await actions.remove({ studentId, contactId: contact.id }); setMessage(result.message); setConfirmDelete(false) })}>Confirm delete</button>
      <button type="button" onClick={() => setConfirmDelete(false)}>Cancel</button>
    </div> : null}
    {message ? <p role="status">{message}</p> : null}
  </div>
}

export function TrustedContactEditor({ studentId, contacts, legacyEmail, actions }: { studentId: string; contacts: TrustedContact[]; legacyEmail: string | null; actions: ContactActions }) {
  return <details>
    <summary>{contacts.length} trusted {contacts.length === 1 ? 'contact' : 'contacts'}</summary>
    <div className="trustedContacts">
      {contacts.map((contact) => <details key={`${contact.id}-${contact.email}-${contact.approved}-${contact.enabled}`}>
        <summary>{contact.displayName || contact.email} · {contact.approved ? 'Approved' : 'Awaiting approval'} · {contact.enabled ? 'Opted in' : 'Opted out'}</summary>
        <ContactForm studentId={studentId} contact={contact} actions={actions} />
      </details>)}
      <h3>Add trusted contact</h3>
      <ContactForm studentId={studentId} actions={actions} />
      {legacyEmail ? <p>Legacy parent record retained: {legacyEmail}. Only the contacts listed above receive new notifications.</p> : null}
    </div>
  </details>
}
