// Kept under the "sessions" filename for now to minimize import churn.
// All helpers are event-scoped after v8 (sessions table removed).
import { supabase } from '@/lib/supabase';
import { scoreRolls } from '@/lib/scoring';
import type { FrameRow, GameRow } from '@/types/db';

export async function listGames(eventId: string): Promise<GameRow[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('event_id', eventId)
    .order('game_number', { ascending: true });
  if (error) throw error;
  return (data ?? []) as GameRow[];
}

export async function listFramesForGames(gameIds: string[]): Promise<FrameRow[]> {
  if (gameIds.length === 0) return [];
  const { data, error } = await supabase
    .from('frames')
    .select('*')
    .in('game_id', gameIds)
    .order('frame_number', { ascending: true });
  if (error) throw error;
  return (data ?? []) as FrameRow[];
}

/**
 * Make sure a row exists in `games` for every (event_player, game_number)
 * combination on this event. Safe to re-call any time the roster or
 * total_games count changes.
 */
export async function ensureGamesForEvent(
  eventId: string,
  eventPlayerIds: string[],
  totalGames: number,
  playedOn: string | null
): Promise<GameRow[]> {
  const existing = await listGames(eventId);
  const existingKey = new Set(existing.map((g) => `${g.event_player_id}:${g.game_number}`));
  const toInsert: Array<{
    event_id: string;
    event_player_id: string;
    game_number: number;
    played_on: string | null;
  }> = [];
  for (const epId of eventPlayerIds) {
    for (let n = 1; n <= totalGames; n++) {
      if (!existingKey.has(`${epId}:${n}`)) {
        toInsert.push({
          event_id: eventId,
          event_player_id: epId,
          game_number: n,
          played_on: playedOn,
        });
      }
    }
  }
  if (toInsert.length > 0) {
    const { error } = await supabase.from('games').insert(toInsert);
    if (error) throw error;
  }
  return listGames(eventId);
}

export async function upsertFrame(
  gameId: string,
  frameNumber: number,
  rolls: { roll_1: number | null; roll_2: number | null; roll_3: number | null },
  frameScore: number | null
): Promise<void> {
  const { error } = await supabase
    .from('frames')
    .upsert(
      { game_id: gameId, frame_number: frameNumber, ...rolls, frame_score: frameScore },
      { onConflict: 'game_id,frame_number' }
    );
  if (error) throw error;
}

export async function updateGameTotals(
  gameId: string,
  totalScore: number | null,
  isComplete: boolean
): Promise<void> {
  const { error } = await supabase
    .from('games')
    .update({ total_score: totalScore, is_complete: isComplete })
    .eq('id', gameId);
  if (error) throw error;
}

export async function logScoreEdit(
  gameId: string,
  frameId: string | null,
  field: string,
  oldValue: string | null,
  newValue: string | null
) {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from('score_edits').insert({
    game_id: gameId,
    frame_id: frameId,
    edited_by: auth.user.id,
    field,
    old_value: oldValue,
    new_value: newValue,
  });
}

export async function saveGameRolls(
  gameId: string,
  rolls: number[],
  existingFrames: FrameRow[]
): Promise<void> {
  const scored = scoreRolls(rolls);
  const existingByFrame = new Map(existingFrames.map((f) => [f.frame_number, f]));
  for (const frame of scored.frames) {
    const r1 = frame.rolls[0] ?? null;
    const r2 = frame.rolls[1] ?? null;
    const r3 = frame.rolls[2] ?? null;
    const prior = existingByFrame.get(frame.frameNumber);
    const changed =
      !prior ||
      prior.roll_1 !== r1 ||
      prior.roll_2 !== r2 ||
      prior.roll_3 !== r3 ||
      prior.frame_score !== frame.frameScore;
    if (!changed) continue;
    await upsertFrame(
      gameId,
      frame.frameNumber,
      { roll_1: r1, roll_2: r2, roll_3: r3 },
      frame.frameScore
    );
    if (prior) {
      await logScoreEdit(
        gameId,
        prior.id,
        `frame_${frame.frameNumber}`,
        JSON.stringify({ r1: prior.roll_1, r2: prior.roll_2, r3: prior.roll_3 }),
        JSON.stringify({ r1, r2, r3 })
      );
    }
  }
  await updateGameTotals(gameId, scored.total, scored.isComplete);
}

/**
 * For backwards-compatible naming the rest of the app uses.
 * "Event games" used to be "all event games across all sessions" — the
 * concept collapsed in v8.
 */
export async function listAllEventGames(eventId: string): Promise<GameRow[]> {
  return listGames(eventId);
}
