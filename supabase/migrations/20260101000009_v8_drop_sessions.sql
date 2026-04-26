-- v8: drop the "session" concept. Each event IS the bowling night.
--
-- Domain shift per user clarification:
--   * Removed: sessions table (and session_id on games / pot_games).
--   * Games + pot games + lane assignments now reference event_id directly.
--   * Added event_players.is_playing for weekly attendance toggle (Regulars
--     who didn't show up this week stay in the roster but get filtered from
--     the leaderboard).
--
-- Backfill: existing rows transfer cleanly. Wiping data first via
-- supabase/seeds/wipe.sql is the cleanest path though.

-- ------------------------------------------------------------------
-- 1. Drop policies that join through the soon-to-be-gone sessions table
-- ------------------------------------------------------------------
drop policy if exists games_select on public.games;
drop policy if exists games_write on public.games;
drop policy if exists frames_select on public.frames;
drop policy if exists frames_write on public.frames;
drop policy if exists score_edits_select_owner on public.score_edits;
drop policy if exists score_edits_insert_owner on public.score_edits;
drop policy if exists pot_games_select on public.pot_games;
drop policy if exists pot_games_write on public.pot_games;
drop policy if exists pot_game_entries_select on public.pot_game_entries;
drop policy if exists pot_game_entries_write on public.pot_game_entries;

-- ------------------------------------------------------------------
-- 2. Add new event-scoped columns
-- ------------------------------------------------------------------
alter table public.games
  add column if not exists event_id uuid references public.events(id) on delete cascade,
  add column if not exists played_on date;

alter table public.pot_games
  add column if not exists event_id uuid references public.events(id) on delete cascade;

-- ------------------------------------------------------------------
-- 3. Backfill from sessions where it still exists
-- ------------------------------------------------------------------
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'sessions'
  ) then
    update public.games g
       set event_id = s.event_id,
           played_on = coalesce(g.played_on, s.session_date)
      from public.sessions s
     where g.session_id = s.id and g.event_id is null;

    update public.pot_games pg
       set event_id = s.event_id
      from public.sessions s
     where pg.session_id = s.id and pg.event_id is null;
  end if;
end $$;

-- ------------------------------------------------------------------
-- 4. event_lane_assignments + backfill
-- ------------------------------------------------------------------
create table if not exists public.event_lane_assignments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  event_player_id uuid not null references public.event_players(id) on delete cascade,
  lane_number smallint check (lane_number is null or lane_number between 1 and 999),
  updated_at timestamptz not null default now(),
  unique (event_id, event_player_id)
);

create index if not exists event_lane_assignments_event_idx
  on public.event_lane_assignments (event_id);

drop trigger if exists event_lane_assignments_touch on public.event_lane_assignments;
create trigger event_lane_assignments_touch
before update on public.event_lane_assignments
for each row execute function public.touch_updated_at();

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'session_lane_assignments'
  ) then
    insert into public.event_lane_assignments (event_id, event_player_id, lane_number)
    select s.event_id, sla.event_player_id, sla.lane_number
      from public.session_lane_assignments sla
      join public.sessions s on s.id = sla.session_id
      on conflict (event_id, event_player_id)
      do update set lane_number = excluded.lane_number;
  end if;
end $$;

-- ------------------------------------------------------------------
-- 5. Drop legacy unique constraint on games (it referenced session_id)
-- ------------------------------------------------------------------
alter table public.games
  drop constraint if exists games_session_id_event_player_id_game_number_key;

-- ------------------------------------------------------------------
-- 6. Drop the sessions infrastructure
-- ------------------------------------------------------------------
drop table if exists public.session_lane_assignments cascade;

alter table public.games
  drop column if exists session_id;

alter table public.pot_games
  drop column if exists session_id;

drop table if exists public.sessions cascade;

-- ------------------------------------------------------------------
-- 7. Tighten constraints on the new event-scoped columns
-- ------------------------------------------------------------------
alter table public.games   alter column event_id set not null;
alter table public.pot_games alter column event_id set not null;

create index if not exists games_event_idx     on public.games (event_id);
create index if not exists pot_games_event_idx on public.pot_games (event_id);

-- A bowler can only have one game N per event.
alter table public.games
  drop constraint if exists games_event_player_game_unique;
alter table public.games
  add constraint games_event_player_game_unique
  unique (event_id, event_player_id, game_number);

-- ------------------------------------------------------------------
-- 8. Re-create RLS policies with event_id
-- ------------------------------------------------------------------
create policy games_select on public.games
  for select
  using (exists (select 1 from public.events e where e.id = games.event_id));

create policy games_write on public.games
  for all
  using (public.is_event_owner(games.event_id))
  with check (public.is_event_owner(games.event_id));

create policy frames_select on public.frames
  for select
  using (exists (select 1 from public.games g where g.id = frames.game_id));

create policy frames_write on public.frames
  for all
  using (
    exists (
      select 1 from public.games g
      where g.id = frames.game_id and public.is_event_owner(g.event_id)
    )
  )
  with check (
    exists (
      select 1 from public.games g
      where g.id = frames.game_id and public.is_event_owner(g.event_id)
    )
  );

create policy score_edits_select_owner on public.score_edits
  for select
  using (
    exists (
      select 1 from public.games g
      where g.id = score_edits.game_id and public.is_event_owner(g.event_id)
    )
  );

create policy score_edits_insert_owner on public.score_edits
  for insert
  with check (
    edited_by = auth.uid()
    and exists (
      select 1 from public.games g
      where g.id = score_edits.game_id and public.is_event_owner(g.event_id)
    )
  );

create policy pot_games_select on public.pot_games
  for select
  using (exists (select 1 from public.events e where e.id = pot_games.event_id));

create policy pot_games_write on public.pot_games
  for all
  using (public.is_event_owner(pot_games.event_id))
  with check (public.is_event_owner(pot_games.event_id));

create policy pot_game_entries_select on public.pot_game_entries
  for select
  using (
    exists (select 1 from public.pot_games pg where pg.id = pot_game_entries.pot_game_id)
  );

create policy pot_game_entries_write on public.pot_game_entries
  for all
  using (
    exists (
      select 1 from public.pot_games pg
      where pg.id = pot_game_entries.pot_game_id and public.is_event_owner(pg.event_id)
    )
  )
  with check (
    exists (
      select 1 from public.pot_games pg
      where pg.id = pot_game_entries.pot_game_id and public.is_event_owner(pg.event_id)
    )
  );

-- ------------------------------------------------------------------
-- 9. RLS for event_lane_assignments
-- ------------------------------------------------------------------
alter table public.event_lane_assignments enable row level security;

drop policy if exists event_lane_select on public.event_lane_assignments;
create policy event_lane_select on public.event_lane_assignments
  for select using (
    exists (select 1 from public.events e where e.id = event_lane_assignments.event_id)
  );

drop policy if exists event_lane_write on public.event_lane_assignments;
create policy event_lane_write on public.event_lane_assignments
  for all
  using (public.is_event_owner(event_id))
  with check (public.is_event_owner(event_id));

-- ------------------------------------------------------------------
-- 10. Attendance toggle on the roster
-- ------------------------------------------------------------------
alter table public.event_players
  add column if not exists is_playing boolean not null default true;
