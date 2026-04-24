import { supabase } from '@/lib/supabase';
import type { SeasonRow, SeasonStatus } from '@/types/db';

export interface SeasonInput {
  league_id: string;
  name: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: SeasonStatus;
}

export async function listSeasons(leagueId: string): Promise<SeasonRow[]> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('league_id', leagueId)
    .order('start_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SeasonRow[];
}

export async function createSeason(input: SeasonInput): Promise<SeasonRow> {
  const { data, error } = await supabase.from('seasons').insert(input).select().single();
  if (error) throw error;
  return data as SeasonRow;
}

export async function updateSeason(
  id: string,
  patch: Partial<Omit<SeasonInput, 'league_id'>>
): Promise<void> {
  const { error } = await supabase.from('seasons').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteSeason(id: string): Promise<void> {
  const { error } = await supabase.from('seasons').delete().eq('id', id);
  if (error) throw error;
}
