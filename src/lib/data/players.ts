import { supabase } from '@/lib/supabase';
import type { EventPlayerRow, Handedness, PlayerRow } from '@/types/db';

export interface PlayerInput {
  full_name: string;
  handedness?: Handedness | null;
  home_average?: number | null;
  avatar_url?: string | null;
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

export async function updateEventPlayerHandicap(id: string, handicap: number) {
  const { error } = await supabase.from('event_players').update({ handicap }).eq('id', id);
  if (error) throw error;
}

export async function removePlayerFromEvent(id: string) {
  const { error } = await supabase.from('event_players').delete().eq('id', id);
  if (error) throw error;
}
