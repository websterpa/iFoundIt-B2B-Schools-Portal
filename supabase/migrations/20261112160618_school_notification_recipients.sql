-- Notification subscriptions do not confer portal access or school membership.
create table public.school_notification_recipients (
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organisation_id, user_id)
);
create index school_notification_recipients_user_id_idx
  on public.school_notification_recipients(user_id);
alter table public.school_notification_recipients enable row level security;
revoke all on table public.school_notification_recipients from public, anon, authenticated;
grant select, insert, update, delete on table public.school_notification_recipients to service_role;
comment on table public.school_notification_recipients is
  'Server-managed, notification-only subscriptions. Confirmed account email is checked at send time. No portal permissions are granted.';
