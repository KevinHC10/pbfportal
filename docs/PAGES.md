# BowlTrack — Page Inventory

Every route in the app, what data it shows, and what an organizer or
spectator does on it. Use this as the input to a UI/UX redesign — every
existing screen has a one-paragraph mission and a list of the data slices
it pulls.

## Top-level shells

- `PublicShell` — header with logo, theme toggle, no auth needed.
- `AppShell` — same shell + nav (Events / Leagues / Associations / Players)
  + Logout. Wrapped in `ProtectedRoute`; redirects to `/login` if no session.

## Public routes (no auth)

### `/` — Landing
**Mission:** quick orientation for first-time visitors.

- "Have a link?" hint pointing to `/e/<slug>`, `/leagues/<slug>`,
  `/associations/<slug>`, `/players/<slug>`.
- "Organizer sign in" CTA → `/login`.

### `/e/:slug` — Public event
**Mission:** the live scoreboard for one bowling night.

Header:
- Event name, type badge (League / Tournament), derived status badge,
  optional pulsing **LIVE** badge during the active window.
- League pill linking to the league profile (if league_id set).
- Date + start time + center + "X playing of Y" count.

Body:
- CSV / PDF download buttons (lazy-loaded).
- `SessionLeaderboard`:
  - `# · Name (R/G/V badge) · Affiliation · Avg · HDCP · G1..GN · Scratch · w/HDCP · Lane`
  - Sort tabs: w/ HDCP (default), Scratch, Avg, Lane, Name.
  - Filtered to `is_playing = true`.
  - Bowler names link to `/players/:slug`.
- `PotGamesSection` (read-only): every pot for this event, with the live
  pot leaderboard.

Realtime: subscribed to `games` and `frames`. Updates within ~2s of an
admin saving a score on another tab/device.

### `/players/:slug` — Public player profile
**Mission:** "What has this bowler done across leagues?"

- Header: avatar, affiliation, handedness, home_average.
- Four stat cards: Total games, lifetime average, high game, high series.
- League memberships: cards linking to each league, badged R/G.
- Game-by-game progression chart (Recharts line) over all games.
- Event history table with games / avg / high / series per event.
- Recent 10 games linked back to source events.

### `/leagues/:slug` — Public league profile
**Mission:** the league's marketing + roster page.

- Optional banner image at top.
- Header: logo, name, acronym, current active season badge,
  affiliation link to association, schedule line ("Wednesdays 8:30 PM PHT"),
  center, member count.
- Description (whitespace-preserved).
- Tabs:
  - **Members** — Roster filtered by season selector. Split into Regular and
    Guest tables. Each row links to `/players/:slug`.
  - **Events** — list of events under the league. Each entry shows derived
    status badge + season name. Links to `/e/:slug`.
  - **Sub-leagues** — only renders if any leagues have this one as parent
    (legacy concept; UI no longer creates them).

### `/associations/:slug` — Public association
**Mission:** umbrella org's profile.

- Header: image, name, acronym.
- Description.
- "Affiliated leagues (n)" — list cards linking to each league.

### `/e/:slug/players/:playerId` — Event-scoped player view (legacy)
Still routed; kept around for in-event scoresheet links. Most cross-links
go to `/players/:slug` instead.

### `/login` — Sign in
Email + password (Supabase Auth). Redirects to `/admin` on success.

## Admin routes (auth required)

### `/admin` — Events dashboard
**Mission:** "What events do I run?"

- Filter tabs: type (All / Leagues / Tournaments), status (Any / Upcoming /
  Active / Completed) — both apply to the **derived** status.
- Grid of event cards: name, derived status badge, type, start_date,
  center, "Public link" code.
- "New event" CTA.

### `/admin/events/new` and `/admin/events/:id/edit` — Event editor
**Mission:** create/edit an event.

Form fields:
- Optional **League** dropdown (when set, inherits league's handicap
  formula and center).
- Optional **Season** dropdown (only when a league is selected).
- Name, type (league/tournament).
- Start date, **start time**, optional end date.
- Center (overrides the league's).
- Total games per event (1..20).
- Handicap formula: base / factor / min / max with a live preview
  ("a 160-avg bowler → HDCP X").

The Status field is **not present** — status is derived. Saved with
`status: 'upcoming'` as a column-level fallback for older clients.

### `/admin/events/:id` — Event detail
**Mission:** the operational hub for one bowling night.

Four tabs:

#### Roster tab
- Add player dialog (existing-or-new sub-tabs):
  - **Existing**: search-as-you-type, league members rise to top of the
    list, R/G badge if they're already a member, "Also in: <league
    acronyms>" hint.
  - **New player**: form. Affiliation defaults to the current league's
    acronym/name.
- "Recompute handicaps" — applies the event's formula to every player
  using their `home_average`.
- "Copy from <previous event>" — appears when the roster is empty and
  there's a prior event in the same `(league, season)`. Clones every
  player with `is_playing = true` and prior handicap/lane.
- Roster table: `Playing checkbox · Name · Affiliation · R/G/Member badge ·
  Home avg · HDCP · Lane · Delete`. All inputs auto-save on blur.

#### Scores tab
- "Assign lanes" dialog — bulk lane assignment for this event.
- `QuickScoresCard`:
  - Sorted by lane (override > default > unassigned at bottom).
  - Per-game column toggles: click `G1` → that column flips to inputs.
  - Type a score, **Enter** advances to the next bowler in the same column.
  - Saves go to `games.total_score` directly. Frames are not touched.
  - Lane dividers visually break rows whenever the lane number changes.

#### Standings tab
- `SessionLeaderboard` — sorted by total w/HDCP by default.
- Click any row → `GameEditModal` opens with frame-by-frame entry across
  all that bowler's games.

#### Pots tab
- `PotGamesSection` (admin):
  - "New pot" dialog with formula picker (Top-anchored / Ceiling-anchored /
    Scratch), factor / min / max / ceiling.
  - Each pot shows its own leaderboard. "Manage entrants" dialog has
    auto-pair (high+low) for doubles, plus inline formula edits.

The `GameEditModal` pops over the page from any tab when a Standings row
is clicked.

### `/admin/leagues` — Leagues dashboard
**Mission:** "What leagues do I run?"

- Card grid. Each card: name, acronym, center, schedule line,
  `/leagues/:slug` deep link.
- "New league" CTA.

### `/admin/leagues/new` and `/admin/leagues/:id/edit` — League editor
**Mission:** league CMS.

- Name + acronym.
- Association dropdown (links to `/admin/associations`).
- Center.
- Day-of-week + start time + timezone.
- Description (textarea).
- **Logo and banner uploads** (`ImageUpload` → Supabase Storage
  `league-assets` bucket; URL paste-in escape hatch).
- Default handicap formula (base / factor / min / max) with live preview.

### `/admin/leagues/:id` — League detail
**Mission:** the operational hub for the league between events.

Four tabs:

#### Members tab
- "Add member" dialog: pick player + status + season (defaults to active
  season).
- Member rows: per-row Status select (Regular/Guest) and Season select.

#### Seasons tab
- "New season" dialog: name, start, end, status.
- Inline-editable season rows.

#### Events tab
- List of all events under this league. Each row shows derived status
  badge + season name. "New event" button preselects the league.

#### Attendance tab
- Season selector at top (defaults to active season).
- `AttendanceGrid`: rows = members (regular & guest) + visitors,
  columns = events of the selected season.
  - ✓ played (with games-played count)
  - — on roster but absent
  - × not rostered
  - Per-row: attended / rostered count
  - Footer row: weekly turnout
  - Sticky-left Bowler + Status columns.

### `/admin/associations` — Associations dashboard
**Mission:** "What umbrella orgs do I track?"

- Grid of association cards (image, name, acronym, description preview,
  `/associations/:slug` link).

### `/admin/associations/new` and `/admin/associations/:id/edit` — Association editor
- Name + acronym.
- Image upload.
- Description.

### `/admin/associations/:id` — Association detail
- Header (image / name / acronym / description).
- "Public profile" + "Edit" buttons.
- "Affiliated leagues (n)" list — each row links to the admin league
  detail page.
- Delete button (sets affiliated leagues' association_id to NULL).

### `/admin/players` — Players list
**Mission:** address book.

- Table of every player you've ever added. Each name links to
  `/players/:slug`.

## Component / module index

| Module                                         | Purpose                                    |
| ---------------------------------------------- | ------------------------------------------ |
| `src/lib/scoring.ts`                           | Pure 10-pin math; 40 Vitest tests          |
| `src/lib/leaderboard.ts`                       | `buildLeaderboard`, `buildSessionLeaderboard`, sort helpers |
| `src/lib/handicap.ts`                          | League handicap formula                    |
| `src/lib/pot.ts`                               | Pot handicap (3 shapes), pair suggestion   |
| `src/lib/event-status.ts`                      | Derived status from date+time              |
| `src/lib/schedule.ts`                          | "Wednesdays 8:30 PM PHT" formatter         |
| `src/lib/data/{events,leagues,associations,seasons,players,sessions,lanes,pots,roster,public,storage,attendance}.ts` | Typed CRUD + read helpers per concept |
| `src/components/leaderboard/SessionLeaderboard.tsx` | Per-event leaderboard grid             |
| `src/components/leaderboard/Leaderboard.tsx`   | Aggregate leaderboard (kept for legacy)    |
| `src/components/scoresheet/FrameGrid.tsx`      | Keyboard-driven 10-frame entry             |
| `src/components/scoresheet/GameEditModal.tsx`  | Per-bowler scoresheet pop-up               |
| `src/components/scoresheet/QuickScoresCard.tsx`| Per-column score entry, lane-sorted        |
| `src/components/pots/PotGamesSection.tsx`      | Pot management + display                   |
| `src/components/league/AttendanceGrid.tsx`     | Season attendance matrix                   |
| `src/components/session/LaneAssignmentsDialog.tsx` | Bulk lane assignment                  |
| `src/components/ui/image-upload.tsx`           | Storage-backed file picker                 |
| `src/components/ui/*.tsx`                      | shadcn/ui primitives                       |

## Hot interaction loops

These are the flows you'll most likely want to redesign first because
they happen every league night.

### Score entry — "Lane 5 just finished Game 1"

1. Admin opens `/admin/events/<id>` → **Scores** tab.
2. The grid is sorted by lane. Bowlers on Lane 5 appear together.
3. Admin clicks the **G1** toggle → that column becomes inputs.
4. Click Lane 5's first bowler's G1 cell → it auto-focuses and selects.
5. Type `205` → press Enter → saves and jumps to the next Lane 5 bowler's
   G1 input.
6. Repeat down the lane.

### Frame correction — "Anton's score looks off"

1. Admin → **Standings** tab.
2. Click Anton's row → `GameEditModal` opens with all his games as
   `FrameGrid`s.
3. Click the offending frame → type the correct rolls.
4. Auto-saves; total recomputes; modal stays open.

### Adding a guest who showed up

1. **Roster** tab → **Add player** → search.
2. Player exists in the address book? Click them; they're added with
   their existing affiliation as a hint.
3. Player is new? Switch to **New player** sub-tab; affiliation defaults
   to this league's acronym; submit.

### End-of-night

1. Public link visible from the event header.
2. CSV/PDF buttons download standings.
3. Spectators with the link see the same thing in real time without
   logging in.

## What's intentionally NOT here yet

- CSV upload of full session scores (planned)
- CSV/PDF attendance export (planned)
- Bowler-self-managed accounts (out of scope)
- Notifications / chat (out of scope)
