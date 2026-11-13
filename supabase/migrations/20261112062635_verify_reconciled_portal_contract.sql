-- A forward verification receipt: production version 20260703160000 recorded
-- no SQL, so its version alone cannot prove the schema-completion contract.
-- Preserve the rejected state already present in the live production contract.
alter table public.found_events
  drop constraint found_events_status_check,
  add constraint found_events_status_check check (status in ('pending', 'resolved', 'rejected'));

do $$
declare missing_columns text;
begin
  select string_agg(required.table_name || '.' || required.column_name, ', ')
  into missing_columns
  from (values
    ('students', 'date_of_birth'), ('students', 'home_postcode'),
    ('students', 'home_postcode_normalized'), ('students', 'class_name'),
    ('found_events', 'status'), ('found_events', 'resolved_at'),
    ('found_events', 'resolved_by'), ('tags', 'item_kind'),
    ('tags', 'laptop_ownership'), ('demo_requests', 'marketing_consent')
  ) as required(table_name, column_name)
  where not exists (
    select 1 from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = required.table_name
      and c.column_name = required.column_name
  );
  if missing_columns is not null then
    raise exception 'Unreconciled portal columns: %', missing_columns;
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.demo_requests'::regclass)
    or has_table_privilege('anon', 'public.demo_requests', 'SELECT,INSERT,UPDATE,DELETE')
    or has_table_privilege('authenticated', 'public.demo_requests', 'INSERT,UPDATE,DELETE') then
    raise exception 'Demo request access does not match the secured production contract';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
    and tablename = 'found_events' and policyname = 'found_events_update_own_or_superadmin') then
    raise exception 'Recovery resolution policy is missing';
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public'
    and tablename = 'admin_users' and policyname = 'admin_users_select_self_or_superadmin'
    and qual like '%ifoundit_current_user_is_superadmin%') then
    raise exception 'Nonrecursive admin role lookup is missing';
  end if;
end;
$$;
