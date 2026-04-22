import { supabase } from '@/lib/supabase';
import type { EventPlayerRow, Handedness, PlayerRow } from '@/types/db';

export interface PlayerInput {
  full_name: string;
  handedness?: Handedness | null;
  home_average?: number | null;
  avatar_url?: string | null;
  affiliation?: string | null;
}

export async function listPlayers(): Promise<PlayerRow[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .order('full_name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PlayerRow[];
}

export async function getPlayer(id: string): Promise<PlayerRow | null> {
  const { data, error } = await supabase.from('players').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as PlayerRow | null;
}

export async function createPlayer(input: PlayerInput): Promise<PlayerRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('players')
    .insert({ ...input, created_by: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  return data as PlayerRow;
}

export async function updatePlayer(id: string, patch: Partial<PlayerInput>) {
  const { error } = await supabase.from('players').update(patch).eq('id', id);
  if (error) throw error;
}

export async function listEventPlayers(
  eventId: string
): Promise<Array<EventPlayerRow & { player: PlayerRow }>> {
  const { data, error } = await supabase
    .from('event_players')
    .select('*, player:players(*)')
    .eq('event_id', eventId)
    .order('entry_date', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Array<EventPlayerRow & { player: PlayerRow }>;
}

export async function addPlayerToEvent(
  eventId: string,
  playerId: string,
  handicap = 0
): Promise<EventPlayerRow> {
  const { data, error } = await supabase
    .from('event_players')
    .insert({ event_id: eventId, player_id: playerId, handicap })
    .select()
    .single();
  if (error) throw error;
  return data as EventPlayerRow;
}

export async function updateEventPlayer(
  id: string,
  patch: Partial<Pick<EventPlayerRow, 'handicap' | 'lane_number'>>
) {
  const { error } = await supabase.from('event_players').update(patch).eq('id', id);
  if (error) throw error;
}

export async function updateEventPlayerHandicap(id: string, handicap: number) {
  return updateEventPlayer(id, { handicap });
}

export async function removePlayerFromEvent(id: string) {
  const { error } = await supabase.from('event_players').delete().eq('id', id);
  if (error) throw error;
}

export async function bulkUpdateHandicaps(
  updates: Array<{ id: string; handicap: number }>
): Promise<void> {
  // Supabase doesn't support multi-row conditional updates in a single call.
  // Sequential awaits are fine for typical league sizes (< 100 bowlers).
  for (const u of updates) {
    const { error } = await supabase
      .from('event_players')
      .update({ handicap: u.handicap })
      .eq('id', u.id);
    if (error) throw error;
  }
}
