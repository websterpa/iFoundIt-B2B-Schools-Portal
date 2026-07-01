create extension if not exists pgcrypto with schema extensions;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  address text,
  contact_email text not null,
  contact_phone text,
  logo_url text,
  subscription_tier text not null default 'pilot',
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint organisations_subscription_tier_check
    check (subscription_tier in ('pilot', 'standard', 'mat'))
);

drop trigger if exists organisations_set_updated_at on public.organisations;

create trigger organisations_set_updated_at
before update on public.organisations
for each row
execute function public.set_updated_at();

create table if not exists public.admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  organisation_id uuid references public.organisations (id) on delete cascade,
  role text not null default 'school_admin',
  created_at timestamptz not null default timezone('utc', now()),
  constraint admin_users_role_check
    check (role in ('school_admin', 'ifoundit_superadmin')),
  constraint admin_users_organisation_required_check
    check (role = 'ifoundit_superadmin' or organisation_id is not null)
);

create index if not exists admin_users_organisation_id_idx
  on public.admin_users (organisation_id);

create index if not exists admin_users_role_idx
  on public.admin_users (role);

alter table public.organisations enable row level security;
alter table public.admin_users enable row level security;

revoke all on table public.organisations from anon, authenticated;
revoke all on table public.admin_users from anon, authenticated;

grant select, update on table public.organisations to authenticated;
grant select on table public.admin_users to authenticated;

drop policy if exists organisations_select_own_or_superadmin on public.organisations;
create policy organisations_select_own_or_superadmin
on public.organisations
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = organisations.id
      )
  )
);

drop policy if exists organisations_update_own_or_superadmin on public.organisations;
create policy organisations_update_own_or_superadmin
on public.organisations
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and (
        current_admin.role = 'ifoundit_superadmin'
        or current_admin.organisation_id = organisations.id
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
        or current_admin.organisation_id = organisations.id
      )
  )
);

drop policy if exists organisations_insert_superadmin on public.organisations;
create policy organisations_insert_superadmin
on public.organisations
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

drop policy if exists organisations_delete_superadmin on public.organisations;
create policy organisations_delete_superadmin
on public.organisations
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and current_admin.role = 'ifoundit_superadmin'
  )
);

drop policy if exists admin_users_select_self_or_superadmin on public.admin_users;
create policy admin_users_select_self_or_superadmin
on public.admin_users
for select
to authenticated
using (
  id = (select auth.uid())
  or exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and current_admin.role = 'ifoundit_superadmin'
  )
);

drop policy if exists admin_users_insert_superadmin on public.admin_users;
create policy admin_users_insert_superadmin
on public.admin_users
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

drop policy if exists admin_users_update_superadmin on public.admin_users;
create policy admin_users_update_superadmin
on public.admin_users
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

drop policy if exists admin_users_delete_superadmin on public.admin_users;
create policy admin_users_delete_superadmin
on public.admin_users
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_users current_admin
    where current_admin.id = (select auth.uid())
      and current_admin.role = 'ifoundit_superadmin'
  )
);
