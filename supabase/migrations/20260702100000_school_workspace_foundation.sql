-- Depends on:
--   20260701121018_auth_admin_contract.sql
--   20260701155657_finder_flow_contract_foundation.sql
--   20260701230500_superadmin_school_onboarding_phase2.sql
--
-- Establishes the minimum school-side data contract required for protected
-- students, tags, events, settings, and dashboard routes.

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  year_group text,
  form_group text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);
drop trigger if exists students_set_updated_at on public.students;
create trigger students_set_updated_at
before update on public.students
for each row
execute function public.set_updated_at();
create index if not exists students_organisation_id_idx
  on public.students (organisation_id);
create index if not exists students_organisation_active_idx
  on public.students (organisation_id, active);
create unique index if not exists students_org_name_idx
  on public.students (organisation_id, lower(first_name), lower(last_name));
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'tags_student_id_fkey'
      and conrelid = 'public.tags'::regclass
  ) then
    alter table public.tags
      add constraint tags_student_id_fkey
      foreign key (student_id)
      references public.students (id)
      on delete set null;
  end if;
end
$$;
create index if not exists tags_student_id_idx
  on public.tags (student_id);
alter table public.students enable row level security;
revoke all on table public.students from anon, authenticated;
grant select, insert, update on table public.students to authenticated;
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
