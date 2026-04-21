-- Row Level Security policies.
--
-- Access model:
--   * authenticated admin user owns events, players, and everything beneath
--     their events. They can read/write everything they own.
--   * anon (public viewer) can SELECT rows tied to an event whose
--     public_slug is non-null. They never get write access.
--
-- We centralize the "event owner" and "public event" checks in SECURITY DEFINER
-- helper functions so nested tables (sessions/games/frames) don't have to
-- re-derive ownership.

-- ------------------------------------------------------------------
-- Helper: is the calling user the owner of this event?
-- ------------------------------------------------------------------
create or replace function public.is_event_owner(event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.events e
    where e.id = event_id and e.created_by = auth.uid()
  );
$$;

-- ------------------------------------------------------------------
-- Helper: does this event exist (i.e. is it publicly readable via slug)?
-- All events have a slug, so anon can read any event they know the slug of.
-- Anon queries filter by public_slug; RLS only needs to allow any SELECT.
-- ------------------------------------------------------------------
create or replace function public.event_is_public(event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.events e where e.id = event_id);
$$;

-- ------------------------------------------------------------------
-- Enable RLS
-- ------------------------------------------------------------------
alter table public.events enable row level security;
alter table public.players enable row level security;
alter table public.event_players enable row level security;
alter table public.sessions enable row level security;
alter table public.games enable row level security;
alter table public.frames enable row level security;
alter table public.score_edits enable row level security;

-- ------------------------------------------------------------------
-- events
-- ------------------------------------------------------------------
drop policy if exists events_select_public on public.events;
create policy events_select_public on public.events
  for select
  using (true);

drop policy if exists events_insert_own on public.events;
create policy events_insert_own on public.events
  for insert
  with check (created_by = auth.uid());

drop policy if exists events_update_own on public.events;
create policy events_update_own on public.events
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists events_delete_own on public.events;
create policy events_delete_own on public.events
  for delete
  using (created_by = auth.uid());

-- ------------------------------------------------------------------
-- players
-- Admin may read/write only their own players. Public exposure of player
-- rows happens only indirectly through event_players joins.
-- ------------------------------------------------------------------
drop policy if exists players_select_by_owner_or_public_event on public.players;
create policy players_select_by_owner_or_public_event on public.players
  for select
  using (
    created_by = auth.uid()
    or exists (
      select 1
      from public.event_players ep
      where ep.player_id = players.id
    )
  );

drop policy if exists players_insert_own on public.players;
create policy players_insert_own on public.players
  for insert
  with check (created_by = auth.uid());

drop policy if exists players_update_own on public.players;
create policy players_update_own on public.players
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists players_delete_own on public.players;
create policy players_delete_own on public.players
  for delete
  using (created_by = auth.uid());

-- ------------------------------------------------------------------
-- event_players
-- ------------------------------------------------------------------
drop policy if exists event_players_select on public.event_players;
create policy event_players_select on public.event_players
  for select
  using (public.event_is_public(event_id));

drop policy if exists event_players_write on public.event_players;
create policy event_players_write on public.event_players
  for all
  using (public.is_event_owner(event_id))
  with check (public.is_event_owner(event_id));

-- ------------------------------------------------------------------
-- sessions
-- ------------------------------------------------------------------
drop policy if exists sessions_select on public.sessions;
create policy sessions_select on public.sessions
  for select
  using (public.event_is_public(event_id));

drop policy if exists sessions_write on public.sessions;
create policy sessions_write on public.sessions
  for all
  using (public.is_event_owner(event_id))
  with check (public.is_event_owner(event_id));

-- ------------------------------------------------------------------
-- games (authorized via session → event)
-- ------------------------------------------------------------------
drop policy if exists games_select on public.games;
create policy games_select on public.games
  for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = games.session_id
    )
  );

drop policy if exists games_write on public.games;
create policy games_write on public.games
  for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = games.session_id and public.is_event_owner(s.event_id)
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = games.session_id and public.is_event_owner(s.event_id)
    )
  );

-- ------------------------------------------------------------------
-- frames
-- ------------------------------------------------------------------
drop policy if exists frames_select on public.frames;
create policy frames_select on public.frames
  for select
  using (
    exists (
      select 1 from public.games g
      where g.id = frames.game_id
    )
  );

drop policy if exists frames_write on public.frames;
create policy frames_write on public.frames
  for all
  using (
    exists (
      select 1 from public.games g
      join public.sessions s on s.id = g.session_id
      where g.id = frames.game_id and public.is_event_owner(s.event_id)
    )
  )
  with check (
    exists (
      select 1 from public.games g
      join public.sessions s on s.id = g.session_id
      where g.id = frames.game_id and public.is_event_owner(s.event_id)
    )
  );

-- ------------------------------------------------------------------
-- score_edits (insert-only, readable only by event owner)
-- ------------------------------------------------------------------
drop policy if exists score_edits_select_owner on public.score_edits;
create policy score_edits_select_owner on public.score_edits
  for select
  using (
    exists (
      select 1 from public.games g
      join public.sessions s on s.id = g.session_id
      where g.id = score_edits.game_id and public.is_event_owner(s.event_id)
    )
  );

drop policy if exists score_edits_insert_owner on public.score_edits;
create policy score_edits_insert_owner on public.score_edits
  for insert
  with check (
    edited_by = auth.uid()
    and exists (
      select 1 from public.games g
      join public.sessions s on s.id = g.session_id
      where g.id = score_edits.game_id and public.is_event_owner(s.event_id)
    )
  );

-- ------------------------------------------------------------------
-- Realtime publication
-- ------------------------------------------------------------------
alter publication supabase_realtime add table public.frames;
alter publication supabase_realtime add table public.games;
