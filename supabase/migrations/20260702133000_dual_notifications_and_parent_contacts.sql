-- Depends on:
--   20260702100000_school_workspace_foundation.sql
--   20260702113000_finder_submission_enforcement.sql
--
-- Adds parent contact storage to students and separate delivery timestamps for
-- school email and parent SMS notification flows.

alter table public.students
  add column if not exists parent_email text,
  add column if not exists parent_phone text;
alter table public.found_events
  add column if not exists school_notification_sent_at timestamptz,
  add column if not exists parent_notification_sent_at timestamptz;
