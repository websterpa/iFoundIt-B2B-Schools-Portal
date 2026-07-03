-- depends on 20260701230500_superadmin_school_onboarding_phase2.sql

create type public.demo_request_role as enum (
  'Headteacher',
  'Deputy or Assistant Head',
  'Business Manager or SBM',
  'IT or Network Manager',
  'Trust COO or CFO',
  'Other'
);

create type public.demo_request_rollout_scope as enum (
  'Whole school',
  'Specific year group(s)',
  'Trust or group of schools'
);

create type public.demo_request_school_type as enum (
  'Academy (single)',
  'Multi-Academy Trust',
  'Local Authority maintained',
  'Free School',
  'Independent or Private',
  'Sixth Form or FE College'
);

create type public.demo_request_trust_size as enum (
  '2 to 5',
  '6 to 10',
  '11 to 20',
  '21 or more'
);

create type public.demo_request_pupil_count as enum (
  'Under 300',
  '300 to 600',
  '600 to 1,000',
  '1,000 to 1,500',
  '1,500 or more'
);

create type public.demo_request_phone_policy as enum (
  'Banned or confiscated',
  'Allowed with restrictions',
  'No formal policy'
);

create type public.demo_request_lost_property as enum (
  'No system in place',
  'Handled by staff time',
  'Other'
);

create type public.demo_request_purchase_timeline as enum (
  'This term',
  'Next term',
  'Next academic year',
  'Just researching'
);

create type public.demo_request_budget_authority as enum (
  'Sole decision maker',
  'Part of a decision-making group',
  'No budget authority'
);

create table if not exists public.demo_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  school_name text not null,
  role public.demo_request_role not null,
  email text not null,
  rollout_scope public.demo_request_rollout_scope not null,
  school_type public.demo_request_school_type not null,
  trust_name text,
  schools_in_trust public.demo_request_trust_size,
  pupil_count public.demo_request_pupil_count not null,
  phone_policy public.demo_request_phone_policy not null,
  lost_property_handling public.demo_request_lost_property not null,
  purchase_timeline public.demo_request_purchase_timeline not null,
  budget_authority public.demo_request_budget_authority not null,
  marketing_consent boolean not null,
  message text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint demo_requests_marketing_consent_required check (marketing_consent is true),
  constraint demo_requests_trust_fields_consistent check (
    (
      school_type = 'Multi-Academy Trust'::public.demo_request_school_type
      or rollout_scope = 'Trust or group of schools'::public.demo_request_rollout_scope
    )
    =
    (trust_name is not null and schools_in_trust is not null)
  )
);

create index if not exists demo_requests_created_at_idx on public.demo_requests (created_at desc);
