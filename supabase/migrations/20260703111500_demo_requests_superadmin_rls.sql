-- depends on 20260702103000_demo_requests_pipeline.sql

alter table public.demo_requests enable row level security;

revoke all on table public.demo_requests from anon, authenticated;

grant insert on table public.demo_requests to anon;
grant select on table public.demo_requests to authenticated;

drop policy if exists demo_requests_insert_public on public.demo_requests;
create policy demo_requests_insert_public
on public.demo_requests
for insert
to anon
with check (marketing_consent is true);

drop policy if exists demo_requests_select_superadmin on public.demo_requests;
create policy demo_requests_select_superadmin
on public.demo_requests
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
