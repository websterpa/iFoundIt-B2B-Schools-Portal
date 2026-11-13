alter table public.students
  add column parent_notifications_enabled boolean not null default false,
  add column parent_notifications_opted_in_at timestamptz,
  add constraint students_parent_notification_consent_check check (
    not parent_notifications_enabled or
    (parent_notifications_opted_in_at is not null and nullif(trim(parent_email), '') is not null)
  );

alter table public.found_events
  add column parent_notification_status text not null default 'not_requested',
  add constraint found_events_parent_notification_status_check check (
    parent_notification_status in ('not_requested', 'pending', 'submitted', 'failed', 'unconfirmed')
  );
