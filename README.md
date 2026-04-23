# BowlTrack

Real-time 10-pin bowling scoring for leagues and tournaments. Admins manage
events and enter scores; players and spectators view live leaderboards through
a shareable public link, no login required.

## Stack

- **Frontend**: React 18 + Vite + TypeScript
- **UI**: shadcn/ui on Tailwind CSS
- **Backend**: Supabase (Postgres, Row Level Security, Auth, Realtime)
- **Data**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **PDF**: `@react-pdf/renderer`
- **Tests**: Vitest

## Project structure

```
src/
  components/
    ui/              shadcn primitives
    scoresheet/      FrameGrid + GameEditModal
    leaderboard/     Leaderboard + SessionLeaderboard
    pots/            PotGamesSection (singles/doubles side games)
    layout/          AppShell, ProtectedRoute
  pages/
    admin/           events dashboard/editor/detail, sessions,
                     leagues dashboard/editor/detail, players
    public/          landing, event, session, player, league profile
    auth/            login
  lib/
    scoring.ts       pure 10-pin scoring (unit-tested)
    leaderboard.ts   pure event + session leaderboard computation
    handicap.ts      league handicap formula
    pot.ts           pot-game handicap (singles + doubles pair balance)
    schedule.ts      day-of-week / time-zone formatting for leagues
    supabase.ts      supabase client
    auth.tsx         AuthProvider + useAuth
    theme.tsx        next-themes wrapper
    query.ts         TanStack Query client
    data/            typed CRUD helpers per entity
    export/          csv + pdf builders
  hooks/             useEventRealtime
  types/             db row types
supabase/
  migrations/
    20260101000000_initial_schema.sql
    20260101000001_rls.sql
    20260101000002_v2_leagues.sql           (affiliation, lane, event formula)
    20260101000003_v3_leagues.sql            (leagues, memberships, pot games)
    20260101000004_v3_rls.sql                (RLS for the above)
scripts/
  seed.ts            demo admin + league + tournament
  generate-tournament-sql.ts
```

## Domain model

- **League** (`/admin/leagues`) — the persistent association (MTBA-Remate,
  CBA, etc). Owns the default handicap formula, bowling center, meeting
  day/time, description, logo, banner, and can nest via `parent_league_id`
  (e.g. MTBA → MTBA-Remate).
- **League membership** — links a player to a league with status
  `regular` or `guest` and a free-text `season_label`. Drives the
  Regular / Guest split on the public league profile.
- **Event** (`/admin`) — a league week or a standalone tournament.
  Optionally `league_id`-linked; inherits the league's formula + center
  on create.
- **Session** — a single bowling date within an event.
- **Game / Frame** — as before. One game per (player × game number) per
  session.
- **Pot game** — a singles or doubles side competition scoped to a
  session and a specific game number. Its handicap is independent of the
  league handicap: the top averager in the pot gets HDCP 0; everyone
  else's HDCP = `clamp((top_avg − bowler_avg) × factor, min, max)`.
  Doubles pair up bowlers (admin-assigned or auto-paired high+low).

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start Supabase locally

```bash
npx supabase start
npx supabase db reset     # runs the migrations in supabase/migrations
```

`supabase start` prints the API URL, anon key, and service role key. Copy them
into `.env.local`:

```bash
cp .env.example .env.local
# then paste the Supabase values
```

### 3. (Optional) seed demo data

```bash
npm run seed
```

Creates an admin (`admin@bowltrack.local` / `bowltrack-demo` by default) plus:
- `Tuesday Night League` — 8 players, 3 weeks, 3 games each, status `active`
- `Spring Classic Singles` — 16 players, 5 games, status `completed`

The script prints each event's public slug so you can visit `/e/<slug>` to see
the public leaderboard.

### 4. Run dev server

```bash
npm run dev
```

Open `http://localhost:5173`.

## Scripts

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm run dev`       | Vite dev server                                 |
| `npm run build`     | Typecheck + production build                    |
| `npm run preview`   | Preview production build                        |
| `npm test`          | Run the Vitest suite (scoring, etc.)            |
| `npm run typecheck` | Run `tsc` without emitting files                |
| `npm run seed`      | Populate Supabase with demo data                |

## Scoring

All scoring math lives in `src/lib/scoring.ts` — pure functions, no React, no
I/O. See `src/lib/scoring.test.ts` for the test matrix (gutter, perfect game,
all-spares, turkey, strike-then-spare, frame 10 edge cases, invalid inputs).

## Access model

- **Admins** (authenticated) own events, players, and everything under their
  events. Enforced by `is_event_owner(event_id)` in the RLS policies
  (`supabase/migrations/20260101000001_rls.sql`).
- **Anonymous visitors** can read rows scoped to an event they know the
  `public_slug` of. They never get write access.
- **Realtime** is enabled on `games` and `frames` so the public leaderboard
  updates live during a session.

## Keyboard shortcuts (score entry)

Focus a cell in the FrameGrid and:

- `0`–`9` — record that pin count
- `x` or `X` — strike (only when 10 pins are available)
- `/` — spare (auto-fills the delta)
- `-` or `.` — zero
- `Backspace` — clear the current roll
- `ArrowLeft` / `ArrowRight` — move between rolls
