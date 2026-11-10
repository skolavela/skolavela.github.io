-- Soukromí zvukové mapy: žádné veřejné čtení, měkké skrývání, pole source.

alter table public.places add column if not exists hidden_at timestamptz;
alter table public.timeline_entries add column if not exists hidden_at timestamptz;
alter table public.timeline_entries add column if not exists source text not null default '';

drop policy if exists places_select_public on public.places;
drop policy if exists timeline_select_public on public.timeline_entries;

-- Veřejný klíč nesmí číst ani zapisovat. service_role obchází RLS.
-- Žádná nová politika pro anon/authenticated.

update storage.buckets
  set public = false
  where id = 'zvukova-mapa';

drop policy if exists zvukova_mapa_public_read on storage.objects;

insert into public.app_settings (key, value)
values ('teacher_password_sha256', '0be4501c8a459017567afcba2ed066f666c4afa917de2cd06eb1c4fe9c35683e')
on conflict (key) do update set value = excluded.value;

-- Ponech existující class_password_sha256, jen ho sjednoť pokud by chyběl.
insert into public.app_settings (key, value)
values ('class_password_sha256', '97a4e124de64c9bf54c52e43dd75da6fcfacc5440d76bee05578be922b4f3811')
on conflict (key) do update set value = excluded.value;

-- Smazat ukázková místa (cascade smaže i časovou osu).
delete from public.places
where id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222',
  '33333333-3333-4333-8333-333333333333'
);
