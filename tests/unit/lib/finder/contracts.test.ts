import { describe, expect, it } from 'vitest'

import {
  FINDER_HONEYPOT_FIELD_NAME,
  FINDER_MINIMUM_SUBMISSION_AGE_SECONDS,
  FINDER_RATE_LIMIT_MAX_REQUESTS,
  FINDER_RATE_LIMIT_WINDOW_MINUTES,
  FINDER_REJECTION_REASONS,
  FINDER_TIMESTAMP_FIELD_NAME
} from '@/lib/finder/contracts'

describe('finder contracts', () => {
  it('uses the documented hidden field names', () => {
    expect(FINDER_HONEYPOT_FIELD_NAME).toBe('website')
    expect(FINDER_TIMESTAMP_FIELD_NAME).toBe('loaded_at')
  })

  it('uses the documented anti-spam thresholds', () => {
    expect(FINDER_MINIMUM_SUBMISSION_AGE_SECONDS).toBe(2)
    expect(FINDER_RATE_LIMIT_MAX_REQUESTS).toBe(5)
    expect(FINDER_RATE_LIMIT_WINDOW_MINUTES).toBe(10)
  })

  it('enumerates the expected rejection reasons for future logging', () => {
    expect(FINDER_REJECTION_REASONS).toEqual([
      'duplicate_submission',
      'honeypot_filled',
      'submitted_too_fast',
      'ip_rate_limited'
    ])
  })
})
