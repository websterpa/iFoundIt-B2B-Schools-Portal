alter table public.students add constraint students_id_organisation_unique unique(id, organisation_id);
alter table public.organisations add column collection_details text,
  add constraint organisations_collection_details_length check (length(collection_details) <= 2000);

create table public.student_trusted_contacts (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations(id) on delete cascade,
  student_id uuid not null,
  display_name text,
  relationship text,
  email text not null check (email = lower(trim(email)) and length(email) between 3 and 254),
  phone text,
  approved boolean not null default false,
  approved_at timestamptz,
  notifications_enabled boolean not null default false,
  opted_in_at timestamptz,
  legacy_parent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key(student_id, organisation_id) references public.students(id, organisation_id) on delete cascade,
  unique(student_id, email),
  check (not approved or approved_at is not null),
  check (not notifications_enabled or opted_in_at is not null),
  check (length(display_name) <= 120 and length(relationship) <= 80 and length(phone) <= 60)
);
create index student_trusted_contacts_organisation_idx on public.student_trusted_contacts(organisation_id);
alter table public.student_trusted_contacts enable row level security;
revoke all on public.student_trusted_contacts from public, anon, authenticated;
grant select, insert, update, delete on public.student_trusted_contacts to authenticated, service_role;
create policy trusted_contacts_school_scope on public.student_trusted_contacts
  for all to authenticated
  using (exists(select 1 from public.admin_users a where a.id=(select auth.uid()) and
    (a.role='ifoundit_superadmin' or (a.role='school_admin' and a.organisation_id=student_trusted_contacts.organisation_id))))
  with check (exists(select 1 from public.admin_users a where a.id=(select auth.uid()) and
    (a.role='ifoundit_superadmin' or (a.role='school_admin' and a.organisation_id=student_trusted_contacts.organisation_id))));

-- Preserve the original parent fields as a legacy snapshot. New sends use contacts only.
insert into public.student_trusted_contacts(
  organisation_id,student_id,relationship,email,phone,approved,approved_at,notifications_enabled,opted_in_at,legacy_parent
)
select organisation_id,id,'Parent / guardian',lower(trim(parent_email)),parent_phone,
  parent_notifications_enabled,parent_notifications_opted_in_at,
  parent_notifications_enabled,parent_notifications_opted_in_at,true
from public.students where nullif(trim(parent_email),'') is not null;

alter table public.found_events drop constraint found_events_parent_notification_status_check;
alter table public.found_events add constraint found_events_parent_notification_status_check check (
  parent_notification_status in ('not_requested','pending','submitted','failed','unconfirmed','partial')
);
