-- additive completion migration for environments with schema drift
-- scope: tables/types/columns only (no grants, no storage policy mutations)

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_request_role') THEN
    CREATE TYPE public.demo_request_role AS ENUM (
      'Headteacher',
      'Deputy or Assistant Head',
      'Business Manager or SBM',
      'IT or Network Manager',
      'Trust COO or CFO',
      'Other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_request_rollout_scope') THEN
    CREATE TYPE public.demo_request_rollout_scope AS ENUM (
      'Whole school',
      'Specific year group(s)',
      'Trust or group of schools'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_request_school_type') THEN
    CREATE TYPE public.demo_request_school_type AS ENUM (
      'Academy (single)',
      'Multi-Academy Trust',
      'Local Authority maintained',
      'Free School',
      'Independent or Private',
      'Sixth Form or FE College'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_request_trust_size') THEN
    CREATE TYPE public.demo_request_trust_size AS ENUM (
      '2 to 5',
      '6 to 10',
      '11 to 20',
      '21 or more'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_request_pupil_count') THEN
    CREATE TYPE public.demo_request_pupil_count AS ENUM (
      'Under 300',
      '300 to 600',
      '600 to 1,000',
      '1,000 to 1,500',
      '1,500 or more'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_request_phone_policy') THEN
    CREATE TYPE public.demo_request_phone_policy AS ENUM (
      'Banned or confiscated',
      'Allowed with restrictions',
      'No formal policy'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_request_lost_property') THEN
    CREATE TYPE public.demo_request_lost_property AS ENUM (
      'No system in place',
      'Handled by staff time',
      'Other'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_request_purchase_timeline') THEN
    CREATE TYPE public.demo_request_purchase_timeline AS ENUM (
      'This term',
      'Next term',
      'Next academic year',
      'Just researching'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'demo_request_budget_authority') THEN
    CREATE TYPE public.demo_request_budget_authority AS ENUM (
      'Sole decision maker',
      'Part of a decision-making group',
      'No budget authority'
    );
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS public.demo_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  school_name text NOT NULL,
  role public.demo_request_role NOT NULL,
  email text NOT NULL,
  rollout_scope public.demo_request_rollout_scope NOT NULL,
  school_type public.demo_request_school_type NOT NULL,
  trust_name text,
  schools_in_trust public.demo_request_trust_size,
  pupil_count public.demo_request_pupil_count NOT NULL,
  phone_policy public.demo_request_phone_policy NOT NULL,
  lost_property_handling public.demo_request_lost_property NOT NULL,
  purchase_timeline public.demo_request_purchase_timeline NOT NULL,
  budget_authority public.demo_request_budget_authority NOT NULL,
  marketing_consent boolean NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT demo_requests_marketing_consent_required CHECK (marketing_consent IS TRUE),
  CONSTRAINT demo_requests_trust_fields_consistent CHECK (
    (
      school_type = 'Multi-Academy Trust'::public.demo_request_school_type
      OR rollout_scope = 'Trust or group of schools'::public.demo_request_rollout_scope
    )
    =
    (trust_name IS NOT NULL AND schools_in_trust IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS demo_requests_created_at_idx ON public.demo_requests (created_at DESC);

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS home_postcode text,
  ADD COLUMN IF NOT EXISTS home_postcode_normalized text,
  ADD COLUMN IF NOT EXISTS class_name text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'students'
      AND column_name = 'form_group'
  ) THEN
    EXECUTE $sql$
      UPDATE public.students
      SET class_name = form_group
      WHERE class_name IS NULL
        AND form_group IS NOT NULL
    $sql$;
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'students_home_postcode_normalized_format_check'
  ) THEN
    ALTER TABLE public.students
      ADD CONSTRAINT students_home_postcode_normalized_format_check
      CHECK (
        home_postcode_normalized IS NULL
        OR home_postcode_normalized ~ '^(GIR0AA|[A-Z]{1,2}[0-9][A-Z0-9]?[0-9][A-Z]{2})$'
      );
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS students_org_name_dob_postcode_idx
  ON public.students (organisation_id, last_name, first_name, date_of_birth, home_postcode_normalized);

ALTER TABLE public.found_events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_by uuid REFERENCES public.admin_users (id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'found_events_status_check'
  ) THEN
    ALTER TABLE public.found_events
      ADD CONSTRAINT found_events_status_check
      CHECK (status IN ('pending', 'resolved'));
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'tags_student_id_fkey'
  ) THEN
    ALTER TABLE public.tags
      ADD CONSTRAINT tags_student_id_fkey
      FOREIGN KEY (student_id) REFERENCES public.students (id) ON DELETE SET NULL;
  END IF;
END;
$$;
