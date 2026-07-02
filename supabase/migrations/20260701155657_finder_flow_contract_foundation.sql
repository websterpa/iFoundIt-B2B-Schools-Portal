create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  serial text not null unique,
  student_id uuid,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint tags_serial_format_check
    check (serial ~ '^[A-Z0-9]{8,}$')
);

drop trigger if exists tags_set_updated_at on public.tags;

create trigger tags_set_updated_at
before update on public.tags
for each row
execute function public.set_updated_at();

create index if not exists tags_organisation_id_idx
  on public.tags (organisation_id);

create index if not exists tags_organisation_active_idx
  on public.tags (organisation_id, active);

create table if not exists public.found_events (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  finder_message text,
  finder_contact text,
  notification_sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists found_events_organisation_id_idx
  on public.found_events (organisation_id);

create index if not exists found_events_tag_created_at_idx
  on public.found_events (tag_id, created_at desc);

create table if not exists public.found_event_rejections (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid references public.organisations (id) on delete set null,
  tag_id uuid references public.tags (id) on delete set null,
  serial text not null,
  request_ip_hash text not null,
  rejection_reason text not null,
  user_agent text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint found_event_rejections_reason_check
    check (
      rejection_reason in (
        'duplicate_submission',
        'honeypot_filled',
        'submitted_too_fast',
        'ip_rate_limited'
      )
    ),
  constraint found_event_rejections_serial_format_check
    check (serial ~ '^[A-Z0-9]{8,}$')
);

create index if not exists found_event_rejections_organisation_id_idx
  on public.found_event_rejections (organisation_id);

create index if not exists found_event_rejections_serial_created_at_idx
  on public.found_event_rejections (serial, created_at desc);

alter table public.tags enable row level security;
alter table public.found_events enable row level security;
alter table public.found_event_rejections enable row level security;

revoke all on table public.tags from anon, authenticated;
revoke all on table public.found_events from anon, authenticated;
revoke all on table public.found_event_rejections from anon, authenticated;

grant select, insert, update on table public.tags to authenticated;
grant select on table public.found_events to authenticated;
grant select on table public.found_event_rejections to authenticated;

drop policy if exists tags_select_own_or_superadmin on public.tags;
create policy tags_select_own_or_superadmin
on public.tags
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = tags.organisation_id
      )
  )
);

drop policy if exists tags_insert_superadmin on public.tags;
create policy tags_insert_superadmin
on public.tags
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and current_admin.role = 'ifoundit_superadmin'
  )
);

drop policy if exists tags_update_own_or_superadmin on public.tags;
create policy tags_update_own_or_superadmin
on public.tags
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = tags.organisation_id
      )
  )
)
with check (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = tags.organisation_id
      )
  )
);

drop policy if exists found_events_select_own_or_superadmin on public.found_events;
create policy found_events_select_own_or_superadmin
on public.found_events
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = found_events.organisation_id
      )
  )
);

drop policy if exists found_event_rejections_select_own_or_superadmin on public.found_event_rejections;
create policy found_event_rejections_select_own_or_superadmin
on public.found_event_rejections
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = found_event_rejections.organisation_id
      )
  )
);
