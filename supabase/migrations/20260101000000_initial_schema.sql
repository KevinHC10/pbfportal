-- BowlTrack initial schema
-- Entities: events, players, event_players, sessions, games, frames, score_edits
-- Admins own everything they create. Anonymous users may read data scoped to a
-- published event (by public_slug) and nothing else.

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------
-- events
-- ------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('league', 'tournament')),
  start_date date not null,
  end_date date,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'completed')),
  public_slug text not null unique,
  center_name text,
  total_games integer not null default 3 check (total_games between 1 and 20),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_created_by_idx on public.events (created_by);
create index if not exists events_public_slug_idx on public.events (public_slug);

-- ------------------------------------------------------------------
-- players
-- ------------------------------------------------------------------
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  avatar_url text,
  handedness text check (handedness in ('left', 'right', 'ambi')),
  home_average numeric(5,2),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists players_created_by_idx on public.players (created_by);

-- ------------------------------------------------------------------
-- event_players (join table)
-- ------------------------------------------------------------------
create table if not exists public.event_players (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  handicap integer not null default 0 check (handicap between 0 and 100),
  entry_date timestamptz not null default now(),
  unique (event_id, player_id)
);

create index if not exists event_players_event_idx on public.event_players (event_id);
create index if not exists event_players_player_idx on public.event_players (player_id);

-- ------------------------------------------------------------------
-- sessions
-- ------------------------------------------------------------------
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  session_number integer not null,
  session_date date not null,
  created_at timestamptz not null default now(),
  unique (event_id, session_number)
);

create index if not exists sessions_event_idx on public.sessions (event_id);

-- ------------------------------------------------------------------
-- games
-- ------------------------------------------------------------------
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  event_player_id uuid not null references public.event_players(id) on delete cascade,
  game_number integer not null check (game_number >= 1),
  total_score integer,
  is_complete boolean not null default false,
  updated_at timestamptz not null default now(),
  unique (session_id, event_player_id, game_number)
);

create index if not exists games_session_idx on public.games (session_id);
create index if not exists games_event_player_idx on public.games (event_player_id);

-- ------------------------------------------------------------------
-- frames
-- ------------------------------------------------------------------
create table if not exists public.frames (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  frame_number smallint not null check (frame_number between 1 and 10),
  roll_1 smallint check (roll_1 between 0 and 10),
  roll_2 smallint check (roll_2 between 0 and 10),
  roll_3 smallint check (roll_3 between 0 and 10),
  frame_score integer,
  updated_at timestamptz not null default now(),
  unique (game_id, frame_number)
);

create index if not exists frames_game_idx on public.frames (game_id);

-- ------------------------------------------------------------------
-- score_edits (audit log)
-- ------------------------------------------------------------------
create table if not exists public.score_edits (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games(id) on delete cascade,
  frame_id uuid references public.frames(id) on delete set null,
  edited_by uuid not null references auth.users(id) on delete cascade,
  field text not null,
  old_value text,
  new_value text,
  created_at timestamptz not null default now()
);

create index if not exists score_edits_game_idx on public.score_edits (game_id);

-- ------------------------------------------------------------------
-- updated_at trigger helper
-- ------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists events_touch_updated_at on public.events;
create trigger events_touch_updated_at
before update on public.events
for each row execute function public.touch_updated_at();

drop trigger if exists games_touch_updated_at on public.games;
create trigger games_touch_updated_at
before update on public.games
for each row execute function public.touch_updated_at();

drop trigger if exists frames_touch_updated_at on public.frames;
create trigger frames_touch_updated_at
before update on public.frames
for each row execute function public.touch_updated_at();
