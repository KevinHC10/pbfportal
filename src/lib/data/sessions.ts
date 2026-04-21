import { supabase } from '@/lib/supabase';
import type { FrameRow, GameRow, SessionRow } from '@/types/db';

export async function listSessions(eventId: string): Promise<SessionRow[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('event_id', eventId)
    .order('session_number', { ascending: true });
  if (error) throw error;
  return (data ?? []) as SessionRow[];
}

export async function getSession(id: string): Promise<SessionRow | null> {
  const { data, error } = await supabase.from('sessions').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as SessionRow | null;
}

export async function createSession(
  eventId: string,
  sessionNumber: number,
  sessionDate: string
): Promise<SessionRow> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ event_id: eventId, session_number: sessionNumber, session_date: sessionDate })
    .select()
    .single();
  if (error) throw error;
  return data as SessionRow;
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) throw error;
}

export async function listGames(sessionId: string): Promise<GameRow[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('session_id', sessionId)
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

export async function ensureGamesForSession(
  sessionId: string,
  eventPlayerIds: string[],
  totalGames: number
): Promise<GameRow[]> {
  const existing = await listGames(sessionId);
  const existingKey = new Set(existing.map((g) => `${g.event_player_id}:${g.game_number}`));
  const toInsert: Array<{
    session_id: string;
    event_player_id: string;
    game_number: number;
  }> = [];
  for (const epId of eventPlayerIds) {
    for (let n = 1; n <= totalGames; n++) {
      if (!existingKey.has(`${epId}:${n}`)) {
        toInsert.push({ session_id: sessionId, event_player_id: epId, game_number: n });
      }
    }
  }
  if (toInsert.length > 0) {
    const { error } = await supabase.from('games').insert(toInsert);
    if (error) throw error;
  }
  return listGames(sessionId);
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
      {
        game_id: gameId,
        frame_number: frameNumber,
        ...rolls,
        frame_score: frameScore,
      },
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
