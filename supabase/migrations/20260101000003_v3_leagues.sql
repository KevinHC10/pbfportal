-- v3: leagues, memberships, pot games
--
-- Leagues are the persistent association entity (MTBA-Remate, CBA, etc).
-- Events/sessions still exist and can now link back to a league.
-- Memberships track who is a Regular vs Guest for a given season.
-- Pot games are side competitions within a session — singles or doubles —
-- with their own handicap math that reuses the already-entered game scores.

-- ------------------------------------------------------------------
-- leagues
-- ------------------------------------------------------------------
create table if not exists public.leagues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  acronym text,
  parent_league_id uuid references public.leagues(id) on delete set null,

  center_name text,
  day_of_week smallint check (day_of_week between 0 and 6),     -- 0 = Sunday
  start_time_local time,                                         -- wall-clock start
  timezone text default 'Asia/Manila',

  description text,
  logo_url text,
  banner_url text,

  public_slug text not null unique,

  -- default handicap formula for league events
  hdcp_base   smallint      not null default 200,
  hdcp_factor numeric(4,2)  not null default 0.80,
  hdcp_max    smallint      not null default 80,
  hdcp_min    smallint      not null default 0,

  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint leagues_hdcp_factor_range check (hdcp_factor between 0 and 2),
  constraint leagues_hdcp_min_max      check (hdcp_min >= 0 and hdcp_max >= hdcp_min),
  constraint leagues_no_self_parent    check (parent_league_id is null or parent_league_id <> id)
);

create index if not exists leagues_parent_idx on public.leagues (parent_league_id);
create index if not exists leagues_created_by_idx on public.leagues (created_by);
create index if not exists leagues_public_slug_idx on public.leagues (public_slug);

drop trigger if exists leagues_touch_updated_at on public.leagues;
create trigger leagues_touch_updated_at
before update on public.leagues
for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------------
-- events.league_id (optional back-reference)
-- ------------------------------------------------------------------
alter table public.events
  add column if not exists league_id uuid references public.leagues(id) on delete set null;

create index if not exists events_league_id_idx on public.events (league_id);

-- ------------------------------------------------------------------
-- league_memberships
-- ------------------------------------------------------------------
create table if not exists public.league_memberships (
  id uuid primary key default gen_random_uuid(),
  league_id uuid not null references public.leagues(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  status    text not null default 'regular' check (status in ('regular', 'guest')),
  season_label text not null default '',
  joined_at timestamptz not null default now(),

  unique (league_id, player_id, season_label)
);

create index if not exists league_memberships_league_idx on public.league_memberships (league_id);
create index if not exists league_memberships_player_idx on public.league_memberships (player_id);

-- ------------------------------------------------------------------
-- pot_games  (side competition within a session)
-- ------------------------------------------------------------------
create table if not exists public.pot_games (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  type text not null check (type in ('singles', 'doubles')),
  name text not null,
  game_number smallint not null check (game_number between 1 and 20),
  factor  numeric(4,2)  not null default 1.00,
  hdcp_min smallint     not null default 0,
  hdcp_max smallint     not null default 100,
  created_at timestamptz not null default now(),
  constraint pot_games_factor_range check (factor between 0 and 2),
  constraint pot_games_min_max     check (hdcp_min >= 0 and hdcp_max >= hdcp_min)
);

create index if not exists pot_games_session_idx on public.pot_games (session_id);

-- ------------------------------------------------------------------
-- pot_game_entries
-- ------------------------------------------------------------------
create table if not exists public.pot_game_entries (
  id uuid primary key default gen_random_uuid(),
  pot_game_id uuid not null references public.pot_games(id) on delete cascade,
  event_player_id uuid not null references public.event_players(id) on delete cascade,
  partner_event_player_id uuid references public.event_players(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (pot_game_id, event_player_id)
);

create index if not exists pot_game_entries_pot_idx on public.pot_game_entries (pot_game_id);
create index if not exists pot_game_entries_event_player_idx on public.pot_game_entries (event_player_id);
