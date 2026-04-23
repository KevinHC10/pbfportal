-- v3 RLS for leagues, memberships, pot games.
-- Pattern matches the event RLS: admin can CRUD own (tracked via created_by
-- or ownership-through-event); anon can SELECT.

-- ------------------------------------------------------------------
-- helper: is the calling user the owner of this league?
-- ------------------------------------------------------------------
create or replace function public.is_league_owner(league_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.leagues l
    where l.id = league_id and l.created_by = auth.uid()
  );
$$;

-- ------------------------------------------------------------------
-- leagues
-- ------------------------------------------------------------------
alter table public.leagues enable row level security;

drop policy if exists leagues_select_public on public.leagues;
create policy leagues_select_public on public.leagues
  for select
  using (true);

drop policy if exists leagues_insert_own on public.leagues;
create policy leagues_insert_own on public.leagues
  for insert
  with check (created_by = auth.uid());

drop policy if exists leagues_update_own on public.leagues;
create policy leagues_update_own on public.leagues
  for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists leagues_delete_own on public.leagues;
create policy leagues_delete_own on public.leagues
  for delete
  using (created_by = auth.uid());

-- ------------------------------------------------------------------
-- league_memberships
-- ------------------------------------------------------------------
alter table public.league_memberships enable row level security;

drop policy if exists league_memberships_select on public.league_memberships;
create policy league_memberships_select on public.league_memberships
  for select
  using (true);

drop policy if exists league_memberships_write on public.league_memberships;
create policy league_memberships_write on public.league_memberships
  for all
  using (public.is_league_owner(league_id))
  with check (public.is_league_owner(league_id));

-- ------------------------------------------------------------------
-- pot_games  (authorized via session → event)
-- ------------------------------------------------------------------
alter table public.pot_games enable row level security;

drop policy if exists pot_games_select on public.pot_games;
create policy pot_games_select on public.pot_games
  for select
  using (
    exists (
      select 1 from public.sessions s
      where s.id = pot_games.session_id
    )
  );

drop policy if exists pot_games_write on public.pot_games;
create policy pot_games_write on public.pot_games
  for all
  using (
    exists (
      select 1 from public.sessions s
      where s.id = pot_games.session_id and public.is_event_owner(s.event_id)
    )
  )
  with check (
    exists (
      select 1 from public.sessions s
      where s.id = pot_games.session_id and public.is_event_owner(s.event_id)
    )
  );

-- ------------------------------------------------------------------
-- pot_game_entries (authorized via pot_game → session → event)
-- ------------------------------------------------------------------
alter table public.pot_game_entries enable row level security;

drop policy if exists pot_game_entries_select on public.pot_game_entries;
create policy pot_game_entries_select on public.pot_game_entries
  for select
  using (
    exists (
      select 1 from public.pot_games pg
      where pg.id = pot_game_entries.pot_game_id
    )
  );

drop policy if exists pot_game_entries_write on public.pot_game_entries;
create policy pot_game_entries_write on public.pot_game_entries
  for all
  using (
    exists (
      select 1 from public.pot_games pg
      join public.sessions s on s.id = pg.session_id
      where pg.id = pot_game_entries.pot_game_id and public.is_event_owner(s.event_id)
    )
  )
  with check (
    exists (
      select 1 from public.pot_games pg
      join public.sessions s on s.id = pg.session_id
      where pg.id = pot_game_entries.pot_game_id and public.is_event_owner(s.event_id)
    )
  );
