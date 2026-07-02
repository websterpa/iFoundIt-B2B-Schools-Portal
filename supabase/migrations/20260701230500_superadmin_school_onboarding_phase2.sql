-- Depends on:
--   20260701121018_auth_admin_contract.sql
--   20260701155657_finder_flow_contract_foundation.sql
--
-- The admin onboarding workflow in this branch provisions school inventory
-- into public.tags, so the tags/found-events contract must remain in the same
-- migration chain as pending_school_admins.

create table if not exists public.pending_school_admins (
  id uuid primary key default gen_random_uuid(),
  organisation_id uuid not null references public.organisations (id) on delete cascade,
  email text not null,
  full_name text not null,
  status text not null default 'pending_invite',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint pending_school_admins_status_check
    check (status in ('pending_invite', 'activated', 'cancelled'))
);

drop trigger if exists pending_school_admins_set_updated_at on public.pending_school_admins;

create trigger pending_school_admins_set_updated_at
before update on public.pending_school_admins
for each row
execute function public.set_updated_at();

create index if not exists pending_school_admins_organisation_id_idx
  on public.pending_school_admins (organisation_id);

create unique index if not exists pending_school_admins_org_email_idx
  on public.pending_school_admins (organisation_id, lower(email));

alter table public.pending_school_admins enable row level security;

revoke all on table public.pending_school_admins from anon, authenticated;
grant select, insert, update on table public.pending_school_admins to authenticated;

drop policy if exists pending_school_admins_select_superadmin on public.pending_school_admins;
create policy pending_school_admins_select_superadmin
on public.pending_school_admins
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and current_admin.role = 'ifoundit_superadmin'
  )
);

drop policy if exists pending_school_admins_insert_superadmin on public.pending_school_admins;
create policy pending_school_admins_insert_superadmin
on public.pending_school_admins
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

drop policy if exists pending_school_admins_update_superadmin on public.pending_school_admins;
create policy pending_school_admins_update_superadmin
on public.pending_school_admins
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and current_admin.role = 'ifoundit_superadmin'
  )
)
with check (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and current_admin.role = 'ifoundit_superadmin'
  )
);
