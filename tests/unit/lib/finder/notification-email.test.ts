import { describe, expect, it } from 'vitest'
import { schoolNotificationEmail } from '@/lib/finder/notification-email'

describe('school notification addresses', () => {
  it('normalizes a real recipient', () => {
    expect(schoolNotificationEmail(' Peter@iFoundIt.io ')).toBe('peter@ifoundit.io')
  })
  it.each(['demo.school.admin@ifoundit.local', 'admin@fixture.test', 'admin@example.com', 'admin@localhost', 'not-an-email', ''])('excludes non-deliverable fixture addresses: %s', (email) => {
    expect(schoolNotificationEmail(email)).toBeNull()
  })
})
