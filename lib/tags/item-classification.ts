export type ItemKind = 'phone_pouch' | 'hero_laptop'
export type LaptopOwnership = 'student' | 'school'
export type ItemClassification = { item_kind: ItemKind; laptop_ownership: LaptopOwnership | null }

export function parseItemClassification(kind?: string, owner?: string):
  { ok: true; value: ItemClassification | null } | { ok: false; message: string } {
  if (!kind && !owner) return { ok: true, value: null }
  if (kind !== 'phone_pouch' && kind !== 'hero_laptop') return { ok: false, message: 'item_kind must be phone_pouch or hero_laptop' }
  if (kind === 'phone_pouch') {
    if (owner) return { ok: false, message: 'A phone pouch cannot have laptop_ownership' }
    return { ok: true, value: { item_kind: kind, laptop_ownership: null } }
  }
  if (owner !== 'student' && owner !== 'school') return { ok: false, message: 'BYOD laptops require laptop_ownership of student or school' }
  return { ok: true, value: { item_kind: kind, laptop_ownership: owner } }
}

export function formatItemClassification(kind: string | null, owner: string | null) {
  if (kind === 'phone_pouch') return 'Phone pouch'
  if (kind === 'hero_laptop') return `BYOD laptop (${owner === 'student' ? 'student owned' : owner === 'school' ? 'school owned' : 'ownership unknown'})`
  return 'Unclassified item'
}
