# BowlTrack — Domain Model

The mental model and business rules behind the schema. Read this if you're
designing UI/UX and you need to know what each entity actually means in
bowling-organizer life.

## Roles

| Role          | How they sign in           | What they can do                                      |
| ------------- | -------------------------- | ----------------------------------------------------- |
| **Organizer** (admin) | Email + password (Supabase Auth) | Create/edit associations, leagues, seasons, players, events; enter scores; manage rosters and pot games. |
| **Spectator**         | Anonymous (no login)             | Read every public profile (events, leagues, players, associations) by URL. Cannot write. |

There are no per-bowler logins. Bowlers are *records* the organizer manages.

## Entity glossary (in bowling terms)

### Association
An umbrella body that several leagues affiliate with.
*Examples:* MTBA (Manila Tenpin Bowlers Association), CBA (Cubao Bowling
Association). It's just a name + acronym + image + description.

### League
A specific recurring league night (e.g., "MTBA-Remate Night League"). A league
has a home center, a regular meeting day & time ("Wednesdays 8:30 PM PHT"),
and its own default handicap formula. A league may but does not have to be
affiliated with an Association.

### Season
A cycle within one league (e.g., "2026 S1", "Summer 2026"). 10 weeks is
typical. Status is `upcoming | active | completed`. **Membership is per
season.** A bowler who's a Regular in 2026 S1 might be a Guest in 2026 S2.

### League membership
A row that says *"player X is a `regular | guest` in league Y for season Z"*.
- `regular` — paid for the whole season; counted toward season prizes; gets
  a permanent roster spot at every weekly event.
- `guest` — drop-in. Pays per night.

### Player
A bowler. Owned by the organizer who first created them. Globally addressable
by `public_slug` (`/players/<slug>`). One player can be a member of multiple
leagues across multiple associations.

Fields that matter:
- `home_average` is what the league handicap formula uses to compute the
  bowler's HDCP.
- `affiliation` is a free-text club tag shown on leaderboards (often the
  league or association acronym).
- `handedness` — left / right / ambi — informational.

### Event
**One bowling night.** For a league: "Week 1", "Week 2", … For a tournament:
the whole event. After v8, an event has Players + Games directly; there is no
intermediate "session".

An event can:
- Belong to a League + Season (regular weekly play), or
- Stand alone as a Tournament (no league_id, no season_id).

The event inherits the handicap formula from its league on creation, but the
admin can override per-event.

`total_games` — how many games each bowler bowls that night (3 is typical for
league night; 10 for masters; etc.).

`start_date + start_time` drive the **derived status**:
- `now < start` → upcoming
- `start ≤ now ≤ end` → active (LIVE badge appears on public pages)
- `now > end` → completed

`end` defaults to `end_date 23:59` if set, otherwise `start + 6h` if a time
is set, otherwise end of `start_date`.

### Event player
The roster row for an event. Carries:
- `handicap` — the bowler's HDCP for *this* event (set per season for leagues,
  inherited from prior week via "Copy roster from previous event").
- `lane_number` — default lane assignment (overridable per event).
- `is_playing` — attendance toggle. Unchecked = "registered but didn't show
  up this week". Filtered out of the leaderboard but kept on roster so the
  attendance grid stays accurate.

### Event lane assignment
Per-event override of the bowler's default lane (used for weekly lane
rotation). If absent, the event_player's `lane_number` is used.

### Game
One game (10 frames) bowled by one bowler at one event. There are
`total_games × playingBowlers` rows per event.

A game is "complete" when frames 1–10 are scored or when the admin entered
a final scratch total via Quick Scores. `is_complete` drives series counting.

### Frame
One of the 10 frames in a game. Stores up to three rolls (frame 10) and a
running total. Scoring math (strikes, spares, frame-10 bonus, perfect 300)
lives in `src/lib/scoring.ts`.

### Pot game
A side competition layered on the existing event games. The same scratch
scores get re-handicapped under a different formula chosen by the admin:
- `top_anchored` — top averager in the pot = HDCP 0; everyone else gets a
  bonus from `(top − their_avg) × factor`.
- `ceiling_anchored` — fixed ceiling (e.g., 220); HDCP from `(ceiling − avg)`.
- `scratch` — no handicap.

A pot scopes to one specific game (`game_number`) at the event. Singles =
one bowler per entry; doubles = entries paired up.

### Score edit
Audit row. When an organizer edits a frame, the old + new values are written
to `score_edits`. Insert-only, readable only by the event owner.

## State machines

### Event status (derived)

```
[upcoming]
   │ (now ≥ start_at)
   ▼
[active]                  ← LIVE badge shows here
   │ (now > end_at)
   ▼
[completed]
```

The `events.status` column exists for legacy rows and is generally a
fallback. UI always renders `computeEventStatus(event)`.

### Season status (manual)

```
[upcoming] → [active] → [completed]
```

Admin changes this through the Seasons tab in the league detail page.

### League membership status

```
regular  ⇄  guest
```

Toggle in the league members table. Status is per-season.

### Game completeness

```
empty  ──→  partial frames  ──→  complete (10 frames or manual total)
       └─→  manual total only  ──→  complete
```

If a game has both frames AND a manual total, the latest frame edit wins
because `saveGameRolls()` recomputes the total via `scoreRolls()`.

## Handicap formulas

### League handicap (used for the regular leaderboard)

Formula stored on `events.hdcp_*` (inherited from `leagues.hdcp_*`):

```
HDCP = clamp(floor((hdcp_base − home_average) × hdcp_factor), hdcp_min, hdcp_max)
```

Stored on `event_players.handicap`. Recomputed via the **Recompute handicaps**
action on the roster page using each player's current `home_average`.

Per the user's spec: handicap is **fixed for the season**, not running. Once
set, it stays.

### Pot handicap

Independent of the league handicap. See `src/lib/pot.ts` for the three shapes
(top_anchored / ceiling_anchored / scratch). Pot HDCP is computed live, never
stored.

## Scoring rules (10-pin)

Pure functions in `src/lib/scoring.ts`. Test matrix in
`src/lib/scoring.test.ts` covers gutter, perfect 300, all-spares, turkeys,
strike-then-spare, frame-10 bonus rules, and invalid inputs.

Display:
- Strike → `X`
- Spare → `/`
- Zero → `-`
- Otherwise the digit

Frame-10 bonus rules:
- Strike on roll 1 → two bonus rolls
- Spare on rolls 1+2 → one bonus roll
- Otherwise no bonus rolls

Validation:
- Roll ∈ [0..10] and integer
- Frames 1–9: rolls 1+2 ≤ 10
- Frame 10: roll-2-after-non-strike + roll-1 ≤ 10; bonus rolls validate
  similarly

## Common reads (UI data shapes)

These are the queries every screen ends up needing. If you're designing a
new screen, ask yourself "which of these am I reading?" first.

### Event detail (admin & public)
```
event ← events
roster ← event_players join players  WHERE event_id
games ← games join frames            WHERE event_id
lanes ← event_lane_assignments       WHERE event_id
membership map ← league_memberships  WHERE league_id, season_id
                                       (optional, for R/G badges)
pots ← pot_games join pot_game_entries WHERE event_id
```

### League detail
```
league ← leagues
association? ← associations          WHERE id = league.association_id
seasons ← seasons                    WHERE league_id
members ← league_memberships join players, seasons WHERE league_id
events ← events                      WHERE league_id
attendance ← derived from event_players, games WHERE in {events of season}
```

### Player profile
```
player ← players
memberships ← league_memberships join leagues, seasons WHERE player_id
participation ← event_players join events, games  WHERE player_id
recent games ← derived
```

### Public association
```
association ← associations
leagues ← leagues                    WHERE association_id
```

## Identity & uniqueness

Every public-facing entity has a `public_slug` (random short code or
name-derived for players). Use those, not UUIDs, in URLs.

`SECURITY DEFINER` helpers that simplify RLS:
- `is_league_owner(league_id)` → bool
- `is_event_owner(event_id)` → bool

## Data lifecycle / cascades

| Delete                     | Cascades to                                           |
| -------------------------- | ----------------------------------------------------- |
| `auth.users`               | All `created_by` rows on associations / leagues / events / players |
| `associations`             | `leagues.association_id` set to null                  |
| `leagues`                  | seasons, league_memberships, events.league_id NULL    |
| `seasons`                  | league_memberships.season_id NULL                     |
| `events`                   | event_players, games, frames (via games), pot_games, lane_assignments |
| `players`                  | event_players, league_memberships, games (via event_players) |

Soft-delete is not implemented. Use the wipe SQL in `supabase/seeds/wipe.sql`
to reset to a blank schema.
