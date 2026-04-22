/**
 * Generates a paste-into-Supabase SQL seed for a fictional 40-bowler open
 * tournament modeled after a real Mixed Masters championship sheet.
 *
 * Output: supabase/seeds/datba_open_2026.sql
 *
 * Run from the repo root:
 *   npx tsx scripts/generate-tournament-sql.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { webcrypto } from 'node:crypto';
import { scoreRolls, type Roll } from '../src/lib/scoring';

// ------------------------------------------------------------------
// Tunables
// ------------------------------------------------------------------
const EVENT_NAME = 'DATBA Invitational Open Championship 2026';
const CENTER = 'Sunrise Bowling Center, Manila';
const START_DATE = '2026-04-11';
const END_DATE = '2026-04-19';
const SESSION_DATE = '2026-04-19';
const TOTAL_GAMES = 10;

// 40 fictional bowlers, ranked roughly by intended skill.
// Skill ∈ [0..1] roughly maps to strike probability per first roll.
// Actual game totals will be simulated and may shuffle the rankings; that's
// fine — the public leaderboard sorts itself.
const BOWLERS: Array<{ name: string; skill: number; handicap: number }> = [
  { name: 'Anton Reyes',          skill: 0.46, handicap: 0 },
  { name: 'Bryan Lim',            skill: 0.42, handicap: 0 },
  { name: 'Carlos Mendoza',       skill: 0.41, handicap: 0 },
  { name: 'Dexter Tan',           skill: 0.40, handicap: 0 },
  { name: 'Edgar Bautista',       skill: 0.39, handicap: 0 },
  { name: 'Maya Coronel',         skill: 0.39, handicap: 8 },
  { name: 'Felix Cruz',           skill: 0.38, handicap: 0 },
  { name: 'Gilbert Mariano',      skill: 0.37, handicap: 0 },
  { name: 'Diana Lazaro',         skill: 0.37, handicap: 8 },
  { name: 'Hector Diwa',          skill: 0.36, handicap: 0 },
  { name: 'Ivan Martinez',        skill: 0.36, handicap: 0 },
  { name: 'Jared Rivera',         skill: 0.35, handicap: 0 },
  { name: 'Karl Santos',          skill: 0.35, handicap: 0 },
  { name: 'Lance Acosta',         skill: 0.34, handicap: 0 },
  { name: 'Miggy Chen',           skill: 0.34, handicap: 0 },
  { name: 'Nico Villa',           skill: 0.33, handicap: 0 },
  { name: 'Oscar Domingo',        skill: 0.33, handicap: 0 },
  { name: 'Patrick Dolor',        skill: 0.32, handicap: 0 },
  { name: 'Quentin Salas',        skill: 0.32, handicap: 0 },
  { name: 'Ramon Iglesias',       skill: 0.31, handicap: 0 },
  { name: 'Steven Abad',          skill: 0.31, handicap: 0 },
  { name: 'Toby Hernandez',       skill: 0.30, handicap: 0 },
  { name: 'Uriel Caballero',      skill: 0.30, handicap: 0 },
  { name: 'Victor Laderas',       skill: 0.29, handicap: 0 },
  { name: 'Wesley Wong',          skill: 0.29, handicap: 0 },
  { name: 'Xavier Kelsey',        skill: 0.28, handicap: 0 },
  { name: 'Paula Santi',          skill: 0.28, handicap: 8 },
  { name: 'Yves Calumpang',       skill: 0.28, handicap: 0 },
  { name: 'Zane Necesario',       skill: 0.27, handicap: 0 },
  { name: 'Aldrin Barbosa',       skill: 0.27, handicap: 0 },
  { name: 'Boyet Esmilla',        skill: 0.27, handicap: 0 },
  { name: 'Cris Turner',          skill: 0.26, handicap: 0 },
  { name: 'Dindo Madrid',         skill: 0.26, handicap: 0 },
  { name: 'Noelle Campos',        skill: 0.25, handicap: 8 },
  { name: 'Eman Nepomuceno',      skill: 0.25, handicap: 0 },
  { name: 'Fito De Guzman',       skill: 0.24, handicap: 0 },
  { name: 'Gary Sia',             skill: 0.24, handicap: 0 },
  { name: 'Kassandra Yuson',      skill: 0.23, handicap: 8 },
  { name: 'Henry Alqueza',        skill: 0.22, handicap: 0 },
  { name: 'Iggy Lichauco',        skill: 0.21, handicap: 0 },
];

// ------------------------------------------------------------------
// Roll simulation (validated through scoreRolls)
// ------------------------------------------------------------------
function rint(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function simulate(skill: number): Roll[] {
  const rolls: Roll[] = [];
  for (let f = 1; f <= 9; f++) {
    if (Math.random() < skill) {
      rolls.push(10);
    } else {
      const first = rint(0, 9);
      rolls.push(first);
      const spareChance = 0.25 + skill * 0.5;
      const second = Math.random() < spareChance ? 10 - first : rint(0, 10 - first);
      rolls.push(second);
    }
  }
  // frame 10
  const r1 = Math.random() < skill ? 10 : rint(0, 9);
  rolls.push(r1);
  if (r1 === 10) {
    const r2 = Math.random() < skill ? 10 : rint(0, 9);
    rolls.push(r2);
    if (r2 === 10) {
      rolls.push(Math.random() < skill ? 10 : rint(0, 10));
    } else {
      rolls.push(rint(0, 10 - r2));
    }
  } else {
    const spareChance = 0.25 + skill * 0.5;
    const r2 = Math.random() < spareChance ? 10 - r1 : rint(0, 10 - r1);
    rolls.push(r2);
    if (r1 + r2 === 10) {
      rolls.push(Math.random() < skill ? 10 : rint(0, 10));
    }
  }
  scoreRolls(rolls); // validates
  return rolls;
}

function slug(n = 10) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const arr = new Uint8Array(n);
  (webcrypto as unknown as { getRandomValues: (a: Uint8Array) => void }).getRandomValues(arr);
  let out = '';
  for (let i = 0; i < n; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

// SQL escape — single quotes only
function q(s: string) {
  return `'${s.replace(/'/g, "''")}'`;
}

// ------------------------------------------------------------------
// Build the SQL
// ------------------------------------------------------------------
function build(): string {
  const lines: string[] = [];
  const eventSlug = slug();

  lines.push(`-- ============================================================`);
  lines.push(`-- BowlTrack seed: ${EVENT_NAME}`);
  lines.push(`-- 40 bowlers × ${TOTAL_GAMES} games, fictional roster.`);
  lines.push(`--`);
  lines.push(`-- HOW TO USE`);
  lines.push(`--   1. In Supabase Studio → SQL Editor → New query.`);
  lines.push(`--   2. Edit the email below to match the admin user that should own this event.`);
  lines.push(`--      (The admin must already exist; create one in Authentication → Users.)`);
  lines.push(`--   3. Paste this whole file → Run.`);
  lines.push(`--   4. The slug is printed at the bottom; visit /e/<slug> on your deployed app.`);
  lines.push(`-- ============================================================`);
  lines.push('');
  lines.push(`do $$`);
  lines.push(`declare`);
  lines.push(`  admin_email     text := 'admin@bowltrack.local'; -- <-- EDIT ME`);
  lines.push(`  v_admin_id      uuid;`);
  lines.push(`  v_event_id      uuid;`);
  lines.push(`  v_session_id    uuid;`);
  lines.push(`  v_player_id     uuid;`);
  lines.push(`  v_event_player  uuid;`);
  lines.push(`  v_game_id       uuid;`);
  lines.push(`  v_slug          text := ${q(eventSlug)};`);
  lines.push(`begin`);
  lines.push(`  select id into v_admin_id from auth.users where email = admin_email limit 1;`);
  lines.push(`  if v_admin_id is null then`);
  lines.push(`    raise exception 'Admin user with email % not found. Create one in Authentication → Users first.', admin_email;`);
  lines.push(`  end if;`);
  lines.push('');
  lines.push(`  -- Event`);
  lines.push(`  insert into public.events (name, type, start_date, end_date, status, public_slug, center_name, total_games, created_by)`);
  lines.push(
    `  values (${q(EVENT_NAME)}, 'tournament', ${q(START_DATE)}, ${q(END_DATE)}, 'completed', v_slug, ${q(
      CENTER
    )}, ${TOTAL_GAMES}, v_admin_id)`
  );
  lines.push(`  returning id into v_event_id;`);
  lines.push('');
  lines.push(`  -- Single session for the whole tournament`);
  lines.push(`  insert into public.sessions (event_id, session_number, session_date)`);
  lines.push(`  values (v_event_id, 1, ${q(SESSION_DATE)})`);
  lines.push(`  returning id into v_session_id;`);
  lines.push('');

  for (const bowler of BOWLERS) {
    lines.push(`  -- ${bowler.name}`);
    lines.push(`  insert into public.players (full_name, handedness, home_average, created_by)`);
    lines.push(
      `  values (${q(bowler.name)}, 'right', ${rint(165, 215)}, v_admin_id)`
    );
    lines.push(`  returning id into v_player_id;`);
    lines.push(`  insert into public.event_players (event_id, player_id, handicap)`);
    lines.push(`  values (v_event_id, v_player_id, ${bowler.handicap})`);
    lines.push(`  returning id into v_event_player;`);

    for (let gameNumber = 1; gameNumber <= TOTAL_GAMES; gameNumber++) {
      const rolls = simulate(bowler.skill);
      const game = scoreRolls(rolls);
      const total = game.total ?? 0;
      lines.push(`  insert into public.games (session_id, event_player_id, game_number, total_score, is_complete)`);
      lines.push(
        `  values (v_session_id, v_event_player, ${gameNumber}, ${total}, true) returning id into v_game_id;`
      );
      // frames
      const frameValues: string[] = [];
      for (const frame of game.frames) {
        const r1 = frame.rolls[0] ?? null;
        const r2 = frame.rolls[1] ?? null;
        const r3 = frame.rolls[2] ?? null;
        const fs = frame.frameScore ?? null;
        frameValues.push(
          `(v_game_id, ${frame.frameNumber}, ${r1 ?? 'null'}, ${r2 ?? 'null'}, ${r3 ?? 'null'}, ${fs ?? 'null'})`
        );
      }
      lines.push(
        `  insert into public.frames (game_id, frame_number, roll_1, roll_2, roll_3, frame_score) values`
      );
      lines.push(`    ${frameValues.join(',\n    ')};`);
    }
    lines.push('');
  }

  lines.push(`  raise notice 'Created event with public slug: %', v_slug;`);
  lines.push(`end`);
  lines.push(`$$;`);
  lines.push('');
  lines.push(`-- After running, look in the Supabase logs for the slug, or run:`);
  lines.push(`--   select name, public_slug, status from public.events where name = ${q(EVENT_NAME)};`);
  return lines.join('\n');
}

const out = build();
const path = 'supabase/seeds/datba_open_2026.sql';
mkdirSync(dirname(path), { recursive: true });
writeFileSync(path, out, 'utf8');
console.log(`✓ wrote ${path} (${(out.length / 1024).toFixed(1)} KB)`);
