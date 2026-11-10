-- Dorovnání 07c: updated_at, víc fotek, datum nahrávky, kdy přesně na ose.
-- Stávající data zůstanou; jedna fotka se převede do photo_paths.

alter table public.places
  add column if not exists updated_at timestamptz not null default now();

alter table public.timeline_entries
  add column if not exists updated_at timestamptz not null default now();

alter table public.places
  add column if not exists photo_paths text[] not null default '{}';

alter table public.places
  add column if not exists recorded_at date;

alter table public.timeline_entries
  add column if not exists when_exact text not null default '';

update public.places
  set photo_paths = array[photo_path]
  where photo_path is not null
    and photo_path <> ''
    and (photo_paths is null or cardinality(photo_paths) = 0);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists places_set_updated_at on public.places;
create trigger places_set_updated_at
  before update on public.places
  for each row
  execute function public.set_updated_at();

drop trigger if exists timeline_entries_set_updated_at on public.timeline_entries;
create trigger timeline_entries_set_updated_at
  before update on public.timeline_entries
  for each row
  execute function public.set_updated_at();
