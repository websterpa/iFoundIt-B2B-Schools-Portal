const UK_POSTCODE_NO_SPACE_REGEX = /^(GIR0AA|[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2})$/

export function normalizeName(value: string) {
  return value.trim()
}

export function normalizeNullable(value: string | null | undefined) {
  const normalized = (value ?? '').trim()
  return normalized.length === 0 ? null : normalized
}

export function parseDobDdMmYyyyToIso(input: string | null | undefined): string | null {
  const value = (input ?? '').trim()

  if (!value) {
    return null
  }

  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})$/)

  if (!match) {
    return null
  }

  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const iso = `${match[3]}-${match[2]}-${match[1]}`
  const date = new Date(`${iso}T00:00:00.000Z`)

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null
  }

  return iso
}

export function formatIsoDobToDdMmYyyy(isoDate: string | null | undefined): string | null {
  const value = (isoDate ?? '').trim()

  if (!value) {
    return null
  }

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) {
    return null
  }

  return `${match[3]}-${match[2]}-${match[1]}`
}

export function normalizeUkPostcodeForMatch(input: string | null | undefined): string | null {
  const normalized = (input ?? '').replace(/\s+/g, '').toUpperCase()

  if (!normalized) {
    return null
  }

  if (!UK_POSTCODE_NO_SPACE_REGEX.test(normalized)) {
    return null
  }

  return normalized
}
