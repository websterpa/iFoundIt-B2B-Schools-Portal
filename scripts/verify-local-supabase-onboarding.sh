#!/bin/sh

set -eu

cleanup() {
  supabase db query --local "delete from public.tags where organisation_id in (select id from public.organisations where slug = 'smoke-test-school')" >/dev/null
  supabase db query --local "delete from public.pending_school_admins where organisation_id in (select id from public.organisations where slug = 'smoke-test-school')" >/dev/null
  supabase db query --local "delete from public.organisations where slug = 'smoke-test-school'" >/dev/null
}

trap cleanup EXIT

cleanup

supabase db query --local "insert into public.organisations (name, slug, contact_email, contact_phone, address) values ('Smoke Test School', 'smoke-test-school', 'smoke@example.org', '01234 567890', '1 Test Street')"

supabase db query --local "insert into public.pending_school_admins (organisation_id, email, full_name, status) select id, 'admin@example.org', 'Smoke Test Admin', 'pending_invite' from public.organisations where slug = 'smoke-test-school'"

supabase db query --local "insert into public.tags (organisation_id, serial, active) select id, serial, true from public.organisations cross join (values ('SMOKETAG0001'), ('SMOKETAG0002')) as serials(serial) where slug = 'smoke-test-school'"

supabase db query --local "do \$\$ begin if not exists (select 1 from public.pending_school_admins psa join public.organisations o on o.id = psa.organisation_id where o.slug = 'smoke-test-school' and lower(psa.email) = 'admin@example.org' and psa.status = 'pending_invite') then raise exception 'pending_school_admins query assertion failed'; end if; if (select count(*) from public.tags t join public.organisations o on o.id = t.organisation_id where o.slug = 'smoke-test-school' and t.student_id is null) <> 2 then raise exception 'expected 2 unassigned tags for smoke-test organisation'; end if; end \$\$"

supabase db query --local "select o.slug, psa.email as pending_admin_email, count(t.id) as provisioned_tag_count from public.organisations o join public.pending_school_admins psa on psa.organisation_id = o.id left join public.tags t on t.organisation_id = o.id where o.slug = 'smoke-test-school' group by o.slug, psa.email"
