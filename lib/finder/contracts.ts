export const FINDER_HONEYPOT_FIELD_NAME = 'website'
export const FINDER_TIMESTAMP_FIELD_NAME = 'loaded_at'

export const FINDER_MINIMUM_SUBMISSION_AGE_SECONDS = 2
export const FINDER_RATE_LIMIT_MAX_REQUESTS = 5
export const FINDER_RATE_LIMIT_WINDOW_MINUTES = 10

export const FINDER_REJECTION_REASONS = [
  'duplicate_submission',
  'honeypot_filled',
  'submitted_too_fast',
  'ip_rate_limited'
] as const

export type FinderRejectionReason = (typeof FINDER_REJECTION_REASONS)[number]
