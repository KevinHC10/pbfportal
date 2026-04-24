-- v5: seasons as a first-class entity on leagues.
--
-- Previously each league_memberships row carried a free-text season_label.
-- Now seasons live in their own table per league, and both memberships and
-- events can FK into a specific season. We backfill every distinct
-- season_label into a real seasons row and relink.

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  status text not null default 'active' check (status in ('upcoming', 'active', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (league_id, name)
);

create index if not exists seasons_league_idx on public.seasons (league_id);

drop trigger if exists seasons_touch_updated_at on public.seasons;
create trigger seasons_touch_updated_at
before update on public.seasons
for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------------
-- FK columns on existing tables
-- ------------------------------------------------------------------
alter table public.league_memberships
  add column if not exists season_id uuid references public.seasons(id) on delete set null;

create index if not exists league_memberships_season_idx on public.league_memberships (season_id);

alter table public.events
  add column if not exists season_id uuid references public.seasons(id) on delete set null;

create index if not exists events_season_idx on public.events (season_id);

-- ------------------------------------------------------------------
-- Backfill: make a season row for every distinct (league_id, season_label)
-- and relink memberships. Empty labels become "Default".
-- ------------------------------------------------------------------
do $$
declare
  r record;
  s_id uuid;
begin
  for r in
    select distinct league_id, coalesce(nullif(trim(season_label), ''), 'Default') as label
    from public.league_memberships
  loop
    insert into public.seasons (league_id, name)
    values (r.league_id, r.label)
    on conflict (league_id, name) do nothing;
    select id into s_id from public.seasons where league_id = r.league_id and name = r.label;

    update public.league_memberships
       set season_id = s_id
     where league_id = r.league_id
       and coalesce(nullif(trim(season_label), ''), 'Default') = r.label
       and season_id is null;
  end loop;
end $$;

-- ------------------------------------------------------------------
-- Swap the membership uniqueness from (league, player, season_label)
-- to (league, player, season_id). Drop the old constraint first.
-- ------------------------------------------------------------------
alter table public.league_memberships
  drop constraint if exists league_memberships_league_id_player_id_season_label_key;

alter table public.league_memberships
  drop constraint if exists league_memberships_unique_by_season;

alter table public.league_memberships
  add constraint league_memberships_unique_by_season
  unique (league_id, player_id, season_id);

-- ------------------------------------------------------------------
-- RLS for seasons
-- ------------------------------------------------------------------
alter table public.seasons enable row level security;

drop policy if exists seasons_select_public on public.seasons;
create policy seasons_select_public on public.seasons
  for select
  using (true);

drop policy if exists seasons_write_owner on public.seasons;
create policy seasons_write_owner on public.seasons
  for all
  using (public.is_league_owner(league_id))
  with check (public.is_league_owner(league_id));
