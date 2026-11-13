-- depends on 20260703111500_demo_requests_superadmin_rls.sql

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  home_postcode text,
  home_postcode_normalized text,
  year_group text,
  class_name text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint students_first_name_nonempty check (length(trim(first_name)) > 0),
  constraint students_last_name_nonempty check (length(trim(last_name)) > 0)
);

alter table public.students
  add column if not exists date_of_birth date,
  add column if not exists home_postcode text,
  add column if not exists home_postcode_normalized text,
  add column if not exists class_name text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'students_home_postcode_normalized_format_check'
  ) then
    alter table public.students
      add constraint students_home_postcode_normalized_format_check
        check (
          home_postcode_normalized is null
          or home_postcode_normalized ~ '^(GIR0AA|[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2})$'
        );
  end if;
end;
$$;

drop trigger if exists students_set_updated_at on public.students;

create trigger students_set_updated_at
before update on public.students
for each row
execute function public.set_updated_at();

create index if not exists students_organisation_id_idx
  on public.students (organisation_id);

create unique index if not exists students_org_name_year_class_unique_idx
  on public.students (organisation_id, first_name, last_name, year_group, class_name);

create index if not exists students_org_name_dob_postcode_idx
  on public.students (organisation_id, last_name, first_name, date_of_birth, home_postcode_normalized);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tags_student_id_fkey'
  ) then
    alter table public.tags
      add constraint tags_student_id_fkey
      foreign key (student_id) references public.students (id) on delete set null;
  end if;
end;
$$;

alter table public.found_events
  add column if not exists status text not null default 'pending',
  add column if not exists resolved_at timestamptz,
  add column if not exists resolved_by uuid references public.admin_users (id) on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'found_events_status_check'
  ) then
    alter table public.found_events
      add constraint found_events_status_check
        check (status in ('pending', 'resolved'));
  end if;
end;
$$;

alter table public.students enable row level security;

revoke all on table public.students from anon, authenticated;
grant select, insert, update on table public.students to authenticated;
grant update on table public.found_events to authenticated;

drop policy if exists students_select_own_or_superadmin on public.students;
create policy students_select_own_or_superadmin
on public.students
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = students.organisation_id
      )
  )
);

drop policy if exists students_insert_own_or_superadmin on public.students;
create policy students_insert_own_or_superadmin
on public.students
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = students.organisation_id
      )
  )
);

drop policy if exists students_update_own_or_superadmin on public.students;
create policy students_update_own_or_superadmin
on public.students
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = students.organisation_id
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
        or current_admin.organisation_id = students.organisation_id
      )
  )
);

drop policy if exists found_events_update_own_or_superadmin on public.found_events;
create policy found_events_update_own_or_superadmin
on public.found_events
for update
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
)
with check (
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

insert into storage.buckets (id, name, public)
values ('school-logos', 'school-logos', true)
on conflict (id) do nothing;

drop policy if exists school_logos_select_own_or_superadmin on storage.objects;
create policy school_logos_select_own_or_superadmin
on storage.objects
for select
to authenticated
using (
  bucket_id = 'school-logos'
  and exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id::text = split_part(storage.objects.name, '/', 1)
      )
  )
);

drop policy if exists school_logos_insert_own_or_superadmin on storage.objects;
create policy school_logos_insert_own_or_superadmin
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'school-logos'
  and exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id::text = split_part(storage.objects.name, '/', 1)
      )
  )
);

drop policy if exists school_logos_update_own_or_superadmin on storage.objects;
create policy school_logos_update_own_or_superadmin
on storage.objects
for update
to authenticated
using (
  bucket_id = 'school-logos'
  and exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id::text = split_part(storage.objects.name, '/', 1)
      )
  )
)
with check (
  bucket_id = 'school-logos'
  and exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id::text = split_part(storage.objects.name, '/', 1)
      )
  )
);
