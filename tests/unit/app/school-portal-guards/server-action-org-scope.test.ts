import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8')
}

describe('school portal server actions fail closed on organisation scope', () => {
  it('scopes student and tag assignment paths by organisation id', () => {
    const studentsActions = source('app/students/actions.ts')
    const tagsActions = source('app/tags/actions.ts')

    expect(studentsActions).toContain('resolveSchoolPortalOrganisation')
    expect(studentsActions).toContain('organisation_id: organisationId')
    expect(studentsActions).toContain("onConflict: 'organisation_id,first_name,last_name,year_group,class_name'")

    expect(tagsActions).toContain('resolveSchoolPortalOrganisation')
    expect(tagsActions).toContain(".eq('organisation_id', organisationId)")
    expect(tagsActions).toContain('Select a school context before managing tags.')
  })

  it('scopes found event resolution and settings updates by organisation id', () => {
    const eventsActions = source('app/events/actions.ts')
    const settingsActions = source('app/settings/actions.ts')

    expect(eventsActions).toContain('resolveSchoolPortalOrganisation')
    expect(eventsActions).toContain(".eq('organisation_id', organisationContext.organisationId)")

    expect(settingsActions).toContain('resolveSchoolPortalOrganisation')
    expect(settingsActions).toContain(".eq('id', organisationId)")
    expect(settingsActions).toContain('school-logos')
    expect(settingsActions).toContain('const objectPath = `${organisationId}/')
  })
})
