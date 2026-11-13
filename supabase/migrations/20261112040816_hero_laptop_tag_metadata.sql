alter table public.tags
  add column item_kind text,
  add column laptop_ownership text;

alter table public.tags
  add constraint tags_item_kind_check
    check (item_kind is null or item_kind in ('phone_pouch', 'hero_laptop')),
  add constraint tags_laptop_ownership_check
    check (laptop_ownership is null or laptop_ownership in ('student', 'school')),
  add constraint tags_laptop_ownership_scope_check
    check (laptop_ownership is null or (item_kind is not null and item_kind = 'hero_laptop')),
  add constraint tags_laptop_ownership_required_check
    check (item_kind is distinct from 'hero_laptop' or laptop_ownership is not null);
