/**
 * Seed a BowlTrack Supabase database with a demo admin, a league (8 players, 3
 * weeks of sessions), and a completed tournament (16 players).
 *
 * Run with:
 *   npm run seed
 *
 * Requires SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_ADMIN_EMAIL,
 * SEED_ADMIN_PASSWORD in the environment (see .env.example).
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { webcrypto } from 'node:crypto';
import { scoreRolls } from '../src/lib/scoring';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@bowltrack.local';
const password = process.env.SEED_ADMIN_PASSWORD ?? 'bowltrack-demo';

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function slug(n = 10) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const arr = new Uint8Array(n);
  (webcrypto as unknown as { getRandomValues: (a: Uint8Array) => void }).getRandomValues(arr);
  let out = '';
  for (let i = 0; i < n; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Build a plausible game. Skill controls strike probability.
 * Returns a flat array of rolls that is guaranteed valid.
 */
function simulateRolls(skill: number): number[] {
  const rolls: number[] = [];
  for (let f = 1; f <= 9; f++) {
    if (Math.random() < skill) {
      rolls.push(10); // strike
    } else {
      const first = randomInt(0, 9);
      rolls.push(first);
      const spareChance = 0.25 + skill * 0.4;
      if (Math.random() < spareChance) {
        rolls.push(10 - first);
      } else {
        rolls.push(randomInt(0, 10 - first));
      }
    }
  }
  // frame 10
  const r1 = Math.random() < skill ? 10 : randomInt(0, 9);
  rolls.push(r1);
  if (r1 === 10) {
    const r2 = Math.random() < skill ? 10 : randomInt(0, 9);
    rolls.push(r2);
    if (r2 === 10) {
      rolls.push(Math.random() < skill ? 10 : randomInt(0, 10));
    } else {
      rolls.push(randomInt(0, 10 - r2));
    }
  } else {
    const spareChance = 0.25 + skill * 0.4;
    const r2 = Math.random() < spareChance ? 10 - r1 : randomInt(0, 10 - r1);
    rolls.push(r2);
    if (r1 + r2 === 10) {
      rolls.push(Math.random() < skill ? 10 : randomInt(0, 10));
    }
  }
  // Sanity check: re-score to make sure the simulation is valid.
  scoreRolls(rolls);
  return rolls;
}

async function ensureAdmin(): Promise<string> {
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list.users.find((u) => u.email === email);
  if (existing) {
    console.log(`→ admin exists: ${existing.email}`);
    return existing.id;
  }
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    throw new Error(`Failed to create admin: ${error?.message ?? 'unknown'}`);
  }
  console.log(`→ created admin: ${email} / ${password}`);
  return data.user.id;
}

async function wipeAll(createdBy: string) {
  console.log('→ wiping existing data for this admin');
  await supabase.from('events').delete().eq('created_by', createdBy);
  await supabase.from('players').delete().eq('created_by', createdBy);
}

async function createPlayers(createdBy: string, names: string[]) {
  const rows = names.map((n) => ({
    full_name: n,
    created_by: createdBy,
    home_average: randomInt(120, 210),
    handedness: Math.random() < 0.9 ? 'right' : 'left',
  }));
  const { data, error } = await supabase.from('players').insert(rows).select();
  if (error) throw error;
  return data!;
}

async function writeGame(gameId: string, rolls: number[]) {
  const scored = scoreRolls(rolls);
  const frameRows = scored.frames.map((f) => ({
    game_id: gameId,
    frame_number: f.frameNumber,
    roll_1: f.rolls[0] ?? null,
    roll_2: f.rolls[1] ?? null,
    roll_3: f.rolls[2] ?? null,
    frame_score: f.frameScore,
  }));
  await supabase.from('frames').upsert(frameRows, { onConflict: 'game_id,frame_number' });
  await supabase
    .from('games')
    .update({ total_score: scored.total, is_complete: scored.isComplete })
    .eq('id', gameId);
}

async function createLeague(adminId: string) {
  console.log('→ creating league');
  const { data: event, error } = await supabase
    .from('events')
    .insert({
      name: 'Tuesday Night League',
      type: 'league',
      start_date: '2026-03-03',
      status: 'active',
      public_slug: slug(),
      center_name: 'Strike Lanes',
      total_games: 3,
      created_by: adminId,
    })
    .select()
    .single();
  if (error || !event) throw error;

  const players = await createPlayers(adminId, [
    'Ava Martinez',
    'Ben Cho',
    'Carla Reyes',
    'Derek Patel',
    'Elena Khan',
    'Felix Wu',
    'Gina Park',
    'Henry Okafor',
  ]);
  const eps = await Promise.all(
    players.map(async (p, idx) => {
      const { data } = await supabase
        .from('event_players')
        .insert({
          event_id: event.id,
          player_id: p.id,
          handicap: [0, 5, 10, 15, 20, 25, 30, 35][idx] ?? 10,
        })
        .select()
        .single();
      return data!;
    })
  );

  for (let week = 1; week <= 3; week++) {
    const dateStr = `2026-03-${String(week * 7).padStart(2, '0')}`;
    const { data: session } = await supabase
      .from('sessions')
      .insert({ event_id: event.id, session_number: week, session_date: dateStr })
      .select()
      .single();
    for (const ep of eps) {
      for (let gn = 1; gn <= 3; gn++) {
        const { data: game } = await supabase
          .from('games')
          .insert({ session_id: session!.id, event_player_id: ep.id, game_number: gn })
          .select()
          .single();
        const skill = 0.15 + Math.random() * 0.3;
        await writeGame(game!.id, simulateRolls(skill));
      }
    }
  }
  console.log(`  /e/${event.public_slug}`);
}

async function createTournament(adminId: string) {
  console.log('→ creating tournament');
  const { data: event } = await supabase
    .from('events')
    .insert({
      name: 'Spring Classic Singles',
      type: 'tournament',
      start_date: '2026-02-15',
      end_date: '2026-02-15',
      status: 'completed',
      public_slug: slug(),
      center_name: 'Strike Lanes',
      total_games: 5,
      created_by: adminId,
    })
    .select()
    .single();

  const names = [
    'Ivy Brooks',
    'Jonah Hart',
    'Kim Lee',
    'Luis Ortega',
    'Maya Iyer',
    'Niko Singh',
    'Opal Chen',
    'Pat Nguyen',
    'Quinn Davis',
    'Rafi Barr',
    'Sonia Kim',
    'Tomas Silva',
    'Uma Ford',
    'Vik Ray',
    'Wes Jin',
    'Xio Ruiz',
  ];
  const players = await createPlayers(adminId, names);
  const eps = await Promise.all(
    players.map(async (p, idx) =>
      (
        await supabase
          .from('event_players')
          .insert({ event_id: event!.id, player_id: p.id, handicap: (idx % 5) * 5 })
          .select()
          .single()
      ).data!
    )
  );

  const { data: session } = await supabase
    .from('sessions')
    .insert({ event_id: event!.id, session_number: 1, session_date: '2026-02-15' })
    .select()
    .single();

  for (const ep of eps) {
    const skill = 0.1 + Math.random() * 0.4;
    for (let gn = 1; gn <= 5; gn++) {
      const { data: game } = await supabase
        .from('games')
        .insert({ session_id: session!.id, event_player_id: ep.id, game_number: gn })
        .select()
        .single();
      await writeGame(game!.id, simulateRolls(skill));
    }
  }
  console.log(`  /e/${event!.public_slug}`);
}

async function main() {
  const adminId = await ensureAdmin();
  await wipeAll(adminId);
  await createLeague(adminId);
  await createTournament(adminId);
  console.log('✓ seed complete');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
