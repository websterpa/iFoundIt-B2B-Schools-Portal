'use client'

import React, { useState, useTransition } from 'react'

type SettingsWorkspaceProps = {
  initialContactEmail: string
  initialCollectionDetails: string | null
  initialContactPhone: string | null
  initialAddress: string | null
  initialLogoUrl: string | null
  updateSchoolSettingsAction: (input: {
    contactEmail: string
    contactPhone: string
    address: string
    collectionDetails: string
  }) => Promise<{ ok: boolean; message: string; data: Record<string, never> }>
  uploadSchoolLogoAction: (
    input: FormData
  ) => Promise<{ ok: boolean; message: string; data: { logoUrl: string | null } }>
}

export function SettingsWorkspace({
  initialContactEmail,
  initialCollectionDetails,
  initialContactPhone,
  initialAddress,
  initialLogoUrl,
  updateSchoolSettingsAction,
  uploadSchoolLogoAction
}: SettingsWorkspaceProps) {
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl)
  const [isPending, startTransition] = useTransition()

  function handleSettingsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await updateSchoolSettingsAction({
        contactEmail: String(formData.get('contactEmail') ?? ''),
        contactPhone: String(formData.get('contactPhone') ?? ''),
        address: String(formData.get('address') ?? ''),
        collectionDetails: String(formData.get('collectionDetails') ?? '')
      })

      setSettingsMessage(result.message)
    })
  }

  function handleLogoSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    startTransition(async () => {
      const result = await uploadSchoolLogoAction(formData)

      setUploadMessage(result.message)

      if (result.ok && result.data.logoUrl) {
        setLogoUrl(result.data.logoUrl)
      }
    })
  }

  return (
    <div>
      <section aria-labelledby="settings-contact-heading">
        <h2 id="settings-contact-heading">School contact details</h2>
        <form noValidate onSubmit={handleSettingsSubmit}>
          <label>
            Recovery notification email
            <input name="contactEmail" type="email" defaultValue={initialContactEmail} required />
          </label>
          <label>
            Contact phone
            <input name="contactPhone" type="text" defaultValue={initialContactPhone ?? ''} />
          </label>
          <label>
            Address
            <textarea name="address" rows={3} defaultValue={initialAddress ?? ''} />
          </label>
          <label>
            Collection Details
            <textarea name="collectionDetails" rows={5} maxLength={2000} defaultValue={initialCollectionDetails ?? ''}
              placeholder="Collection point, address, opening days and times, appointment requirements…" />
          </label>
          <p>Shared collection centre or school lost-property hours. These instructions appear in Trusted Contact emails. Use plain text, not portal links or student information.</p>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save settings'}
          </button>
        </form>
        {settingsMessage ? <p role="status">{settingsMessage}</p> : null}
      </section>

      <section aria-labelledby="settings-logo-heading">
        <h2 id="settings-logo-heading">School logo</h2>
        {logoUrl ? <img src={logoUrl} alt="School logo" style={{ maxWidth: 240 }} /> : <p>No logo uploaded yet.</p>}
        <form noValidate onSubmit={handleLogoSubmit}>
          <label>
            Logo file
            <input name="logoFile" type="file" accept="image/*" required />
          </label>
          <button type="submit" disabled={isPending}>
            {isPending ? 'Uploading…' : 'Upload logo'}
          </button>
        </form>
        {uploadMessage ? <p role="status">{uploadMessage}</p> : null}
      </section>
    </div>
  )
}
