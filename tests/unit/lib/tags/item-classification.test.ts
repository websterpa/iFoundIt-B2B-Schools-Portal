import { describe, expect, it } from 'vitest'
import { parseItemClassification, formatItemClassification } from '@/lib/tags/item-classification'

describe('item classification', () => {
  it('preserves classification for legacy CSV rows', () => {
    expect(parseItemClassification()).toEqual({ ok: true, value: null })
    expect(parseItemClassification('', '')).toEqual({ ok: true, value: null })
  })
  it.each(['student', 'school'])('accepts a %s-owned BYOD laptop', (owner) => {
    expect(parseItemClassification('hero_laptop', owner)).toEqual({ ok: true, value: { item_kind: 'hero_laptop', laptop_ownership: owner } })
  })
  it('clears laptop ownership when explicitly reclassifying a pouch', () => {
    expect(parseItemClassification('phone_pouch')).toEqual({ ok: true, value: { item_kind: 'phone_pouch', laptop_ownership: null } })
  })
  it.each([['hero_laptop', ''], ['hero_laptop', 'parent'], ['phone_pouch', 'school'], ['', 'student'], ['tablet', '']])('rejects invalid classification %s/%s', (kind, owner) => {
    expect(parseItemClassification(kind, owner).ok).toBe(false)
  })
  it('labels old inventory without inventing item ownership', () => {
    expect(formatItemClassification(null, null)).toBe('Unclassified item')
    expect(formatItemClassification('hero_laptop', 'student')).toBe('BYOD laptop (student owned)')
  })
})
