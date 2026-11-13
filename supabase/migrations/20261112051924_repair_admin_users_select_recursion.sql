begin;

create schema if not exists private authorization postgres;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- A caller can check only their own mapped role. The definer avoids re-entering
-- admin_users RLS; no user-editable JWT metadata is trusted.
create or replace function private.ifoundit_current_user_is_superadmin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where id = (select auth.uid())
      and role = 'ifoundit_superadmin'
  );
$$;
alter function private.ifoundit_current_user_is_superadmin() owner to postgres;
revoke all on function private.ifoundit_current_user_is_superadmin() from public, anon;
grant execute on function private.ifoundit_current_user_is_superadmin() to authenticated;

alter policy admin_users_select_self_or_superadmin on public.admin_users
using (
  id = (select auth.uid())
  or (select private.ifoundit_current_user_is_superadmin())
);

commit;
