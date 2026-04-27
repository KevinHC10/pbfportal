import { supabase } from '@/lib/supabase';
import type { PotFormulaKind, PotGameEntryRow, PotGameRow, PotGameType } from '@/types/db';

export interface PotGameInput {
  event_id: string;
  type: PotGameType;
  name: string;
  game_number: number;
  factor?: number;
  hdcp_min?: number;
  hdcp_max?: number;
  formula?: PotFormulaKind;
  ceiling?: number | null;
}

export async function listPotGames(eventId: string): Promise<PotGameRow[]> {
  const { data, error } = await supabase
    .from('pot_games')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as PotGameRow[];
}

export async function createPotGame(input: PotGameInput): Promise<PotGameRow> {
  const { data, error } = await supabase.from('pot_games').insert(input).select().single();
  if (error) throw error;
  return data as PotGameRow;
}

export async function updatePotGame(
  id: string,
  patch: Partial<Omit<PotGameInput, 'event_id'>>
): Promise<void> {
  const { error } = await supabase.from('pot_games').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deletePotGame(id: string): Promise<void> {
  const { error } = await supabase.from('pot_games').delete().eq('id', id);
  if (error) throw error;
}

export async function listPotGameEntries(potGameId: string): Promise<PotGameEntryRow[]> {
  const { data, error } = await supabase
    .from('pot_game_entries')
    .select('*')
    .eq('pot_game_id', potGameId);
  if (error) throw error;
  return (data ?? []) as PotGameEntryRow[];
}

export async function replacePotGameEntries(
  potGameId: string,
  entries: Array<{ event_player_id: string; partner_event_player_id: string | null }>
): Promise<void> {
  await supabase.from('pot_game_entries').delete().eq('pot_game_id', potGameId);
  if (entries.length === 0) return;
  const rows = entries.map((e) => ({
    pot_game_id: potGameId,
    event_player_id: e.event_player_id,
    partner_event_player_id: e.partner_event_player_id,
  }));
  const { error } = await supabase.from('pot_game_entries').insert(rows);
  if (error) throw error;
}
