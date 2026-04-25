-- ============================================================
-- BowlTrack: wipe all data
-- ============================================================
-- Use case: clear out a hosted Supabase project to test on a
-- fresh database without dropping the schema or migrations.
--
-- DOES delete:   every row in every BowlTrack table
-- DOES NOT delete:
--   - the tables / columns / RLS policies (schema is intact)
--   - auth.users (your admin login keeps working)
--   - Storage bucket files (logos, banners) — see notes below
--
-- HOW TO USE
--   1. Supabase Studio → SQL Editor → New query.
--   2. Paste the entire block below.
--   3. Run.
-- ============================================================

truncate table
  public.score_edits,
  public.frames,
  public.pot_game_entries,
  public.session_lane_assignments,
  public.games,
  public.pot_games,
  public.sessions,
  public.event_players,
  public.league_memberships,
  public.seasons,
  public.events,
  public.leagues,
  public.associations,
  public.players
restart identity cascade;

-- Sanity check: every count should be 0 after running the above.
select 'players'             as table, count(*) from public.players
union all select 'associations',          count(*) from public.associations
union all select 'leagues',               count(*) from public.leagues
union all select 'seasons',               count(*) from public.seasons
union all select 'league_memberships',    count(*) from public.league_memberships
union all select 'events',                count(*) from public.events
union all select 'event_players',         count(*) from public.event_players
union all select 'sessions',              count(*) from public.sessions
union all select 'games',                 count(*) from public.games
union all select 'frames',                count(*) from public.frames
union all select 'session_lane_assignments', count(*) from public.session_lane_assignments
union all select 'pot_games',             count(*) from public.pot_games
union all select 'pot_game_entries',      count(*) from public.pot_game_entries
union all select 'score_edits',           count(*) from public.score_edits;
