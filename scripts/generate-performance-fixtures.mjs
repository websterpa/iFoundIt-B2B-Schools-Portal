import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const fixturesDir = resolve(process.cwd(), 'tests/fixtures/performance')
mkdirSync(fixturesDir, { recursive: true })

const studentHeader = 'first_name,last_name,date_of_birth,home_postcode,year_group,class_name,active'
const studentRows = []

for (let index = 0; index < 1000; index += 1) {
  const firstName = `Student${index}`
  const lastName = `Demo${Math.floor(index / 10)}`
  const day = String((index % 28) + 1).padStart(2, '0')
  const month = String((index % 12) + 1).padStart(2, '0')
  const year = String(2010 + (index % 10))
  const postcode = `SW${(index % 9) + 1}A ${(index % 9) + 1}AA`
  const yearGroup = `Year ${(index % 6) + 1}`
  const className = `Class ${(index % 4) + 1}`
  const active = index % 11 === 0 ? 'false' : 'true'

  studentRows.push(
    [firstName, lastName, `${day}-${month}-${year}`, postcode, yearGroup, className, active].join(',')
  )
}

writeFileSync(resolve(fixturesDir, 'student-import-1000.csv'), [studentHeader, ...studentRows].join('\n'))

const tagHeader = 'serial,first_name,last_name,date_of_birth,home_postcode'
const tagRows = []

for (let index = 0; index < 500; index += 1) {
  const serial = `TAG${String(index).padStart(5, '0')}`
  const firstName = `Student${index}`
  const lastName = `Demo${Math.floor(index / 10)}`
  const day = String((index % 28) + 1).padStart(2, '0')
  const month = String((index % 12) + 1).padStart(2, '0')
  const year = String(2010 + (index % 10))
  const postcode = `SW${(index % 9) + 1}A ${(index % 9) + 1}AA`

  tagRows.push([serial, firstName, lastName, `${day}-${month}-${year}`, postcode].join(','))
}

writeFileSync(resolve(fixturesDir, 'tag-bulk-assignment-500.csv'), [tagHeader, ...tagRows].join('\n'))

console.log('Generated performance fixtures in tests/fixtures/performance')
