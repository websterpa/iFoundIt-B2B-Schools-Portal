-- Local fixture assertions only. All fixture writes are rolled back.
begin;
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'superadmin@fixture.test'),
  ('10000000-0000-0000-0000-000000000002', 'school@fixture.test');
insert into public.organisations (id, name, slug, contact_email) values
  ('20000000-0000-0000-0000-000000000001', 'Fixture School', 'reconcile-fixture-one', 'school@fixture.test'),
  ('20000000-0000-0000-0000-000000000002', 'Other Fixture School', 'reconcile-fixture-two', 'other@fixture.test');
insert into public.admin_users (id, organisation_id, role) values
  ('10000000-0000-0000-0000-000000000001', null, 'ifoundit_superadmin'),
  ('10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'school_admin');
insert into public.students (id, organisation_id, first_name, last_name) values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Fixture', 'Student');
insert into public.tags (organisation_id, student_id, serial, item_kind, laptop_ownership) values
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'HEROLOCAL001', 'hero_laptop', 'student'),
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'POUCHLOCAL01', 'phone_pouch', null),
  ('20000000-0000-0000-0000-000000000002', null, 'OTHERLOCAL01', 'hero_laptop', 'school'),
  ('20000000-0000-0000-0000-000000000001', null, 'LEGACYLOCAL1', null, null);
insert into public.demo_requests (full_name, school_name, role, email, rollout_scope, school_type, pupil_count, phone_policy, lost_property_handling, purchase_timeline, budget_authority, marketing_consent)
values ('Fixture Contact', 'Fixture School', 'Other', 'contact@fixture.test', 'Whole school', 'Academy (single)', 'Under 300', 'No formal policy', 'Other', 'Just researching', 'No budget authority', true);
insert into public.found_events (organisation_id, tag_id, status)
select organisation_id, id, 'rejected' from public.tags where serial = 'HEROLOCAL001';

do $$ begin
  begin
    update public.tags set laptop_ownership = null where serial = 'HEROLOCAL001';
    raise exception 'Laptop without ownership accepted';
  exception when check_violation then null; end;
  begin
    update public.tags set laptop_ownership = 'student' where serial = 'LEGACYLOCAL1';
    raise exception 'Unclassified tag with laptop ownership accepted';
  exception when check_violation then null; end;
  begin
    update public.tags set laptop_ownership = 'school' where serial = 'POUCHLOCAL01';
    raise exception 'Pouch with laptop ownership accepted';
  exception when check_violation then null; end;
  if (select count(*) from public.tags where student_id = '30000000-0000-0000-0000-000000000001') <> 2 then
    raise exception 'One student must support a laptop and pouch';
  end if;
  perform set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000002', true);
end $$;
set local role authenticated;
do $$ declare changed integer; begin
  if private.ifoundit_current_user_is_superadmin() then raise exception 'School admin elevated'; end if;
  if (select count(*) from public.admin_users) <> 1 then raise exception 'Role mapping isolation failed'; end if;
  if exists(select 1 from public.demo_requests) then raise exception 'School admin can read demo requests'; end if;
  if exists(select 1 from public.tags where serial = 'OTHERLOCAL01') then raise exception 'Cross-school tag visibility'; end if;
  update public.tags set student_id = '30000000-0000-0000-0000-000000000001' where serial = 'HEROLOCAL001';
  if not exists(select 1 from public.tags where serial = 'HEROLOCAL001' and item_kind = 'hero_laptop' and laptop_ownership = 'student') then
    raise exception 'Legacy assignment erased item classification';
  end if;
  update public.tags set item_kind = 'hero_laptop', laptop_ownership = 'school' where serial = 'HEROLOCAL001';
  if not exists(select 1 from public.tags where serial = 'HEROLOCAL001' and laptop_ownership = 'school') then
    raise exception 'School-admin classification UPDATE failed';
  end if;
  update public.tags set item_kind = 'phone_pouch', laptop_ownership = null where serial = 'OTHERLOCAL01';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Cross-school tag mutation'; end if;
end $$;
reset role;
do $$ begin
  perform set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
end $$;
set local role authenticated;
do $$ begin
  if not private.ifoundit_current_user_is_superadmin() then raise exception 'Superadmin lookup failed'; end if;
  if (select count(*) from public.demo_requests) <> 1 then raise exception 'Superadmin queue access failed'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform 1 from public.demo_requests limit 0;
    raise exception 'Anonymous queue access permitted';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
