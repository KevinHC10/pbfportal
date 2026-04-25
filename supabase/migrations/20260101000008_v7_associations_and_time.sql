-- v7: Associations + event start_time + auto-derived status
--
-- Domain corrections:
--   * Associations are a NEW entity. They are NOT leagues. A league can be
--     affiliated with one association (MTBA, CBA, ...). The pre-existing
--     leagues.parent_league_id self-ref turned out to be the wrong shape;
--     we leave the column behind for now and just stop using it in the UI.
--   * Events gain start_time so a "Week" can have a 8:30 PM kickoff. The
--     UI then derives status from (start_date + start_time, end_date) vs
--     now() — the events.status column stays as a fallback for legacy data
--     and tournaments without timing.

-- ------------------------------------------------------------------
-- associations
-- ------------------------------------------------------------------
create table if not exists public.associations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  acronym text,
  image_url text,
  description text,
  public_slug text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists associations_created_by_idx on public.associations (created_by);
create index if not exists associations_public_slug_idx on public.associations (public_slug);

drop trigger if exists associations_touch_updated_at on public.associations;
create trigger associations_touch_updated_at
before update on public.associations
for each row execute function public.touch_updated_at();

alter table public.associations enable row level security;

drop policy if exists associations_select_public on public.associations;
create policy associations_select_public on public.associations
  for select using (true);

drop policy if exists associations_insert_own on public.associations;
create policy associations_insert_own on public.associations
  for insert with check (created_by = auth.uid());

drop policy if exists associations_update_own on public.associations;
create policy associations_update_own on public.associations
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());

drop policy if exists associations_delete_own on public.associations;
create policy associations_delete_own on public.associations
  for delete using (created_by = auth.uid());

-- ------------------------------------------------------------------
-- leagues.association_id  (replaces the misshapen parent_league_id idea)
-- ------------------------------------------------------------------
alter table public.leagues
  add column if not exists association_id uuid references public.associations(id) on delete set null;

create index if not exists leagues_association_idx on public.leagues (association_id);

-- ------------------------------------------------------------------
-- events.start_time  (HH:MM:SS, local to the league/event)
-- ------------------------------------------------------------------
alter table public.events
  add column if not exists start_time time;
