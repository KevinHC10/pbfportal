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
    scoresheet/      FrameGrid (keyboard-friendly 10-frame grid)
    leaderboard/     Leaderboard table
    layout/          AppShell, ProtectedRoute
  pages/
    admin/           dashboard, event editor, event detail, session score entry
    public/          event, player, session, landing pages
    auth/            login
  lib/
    scoring.ts       pure 10-pin scoring (unit-tested)
    leaderboard.ts   pure leaderboard computation
    supabase.ts      supabase client
    auth.tsx         AuthProvider + useAuth
    theme.tsx        next-themes wrapper
    query.ts         TanStack Query client
    data/            typed CRUD helpers per entity
    export/          csv + pdf builders
  hooks/             useEventRealtime
  types/             db row types
supabase/
  migrations/        initial_schema.sql + rls.sql
scripts/
  seed.ts            demo admin + league + tournament
```

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
