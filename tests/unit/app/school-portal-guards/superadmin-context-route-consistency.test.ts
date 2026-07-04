import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function routeSource(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('school portal route context consistency', () => {
  it('requires school context on students/tags/events/settings pages', () => {
    const studentsPage = routeSource('app/students/page.tsx')
    const tagsPage = routeSource('app/tags/page.tsx')
    const eventsPage = routeSource('app/events/page.tsx')
    const settingsPage = routeSource('app/settings/page.tsx')

    for (const page of [studentsPage, tagsPage, eventsPage, settingsPage]) {
      expect(page).toContain('resolveSchoolPortalOrganisation')
      expect(page).toContain("organisationContext.reason === 'missing_context'")
      expect(page).toContain('Select a school context from the superadmin schools page')
      expect(page).toContain("redirect('/unauthorised')")
    }
  })
})
