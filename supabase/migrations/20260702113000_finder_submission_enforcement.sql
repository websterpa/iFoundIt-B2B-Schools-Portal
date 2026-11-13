-- Depends on:
--   20260701155657_finder_flow_contract_foundation.sql
--   20260702100000_school_workspace_foundation.sql
--
-- Adds the minimum metadata required to enforce and audit finder submissions
-- across both successful events and rejection logs.

alter table public.found_events
  add column if not exists request_ip_hash text,
  add column if not exists user_agent text;
create index if not exists found_events_request_ip_hash_created_at_idx
  on public.found_events (request_ip_hash, created_at desc);
