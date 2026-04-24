import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import type { EventRow, EventStatus, EventType } from '@/types/db';

export interface EventInput {
  name: string;
  type: EventType;
  start_date: string;
  end_date: string | null;
  status: EventStatus;
  center_name: string | null;
  total_games: number;
  hdcp_base?: number;
  hdcp_factor?: number;
  hdcp_max?: number;
  hdcp_min?: number;
  league_id?: string | null;
  season_id?: string | null;
}

export async function listEventsByLeague(leagueId: string): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('league_id', leagueId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export async function listEvents(): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export async function getEvent(id: string): Promise<EventRow | null> {
  const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as EventRow | null;
}

export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('public_slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as EventRow | null;
}

export async function createEvent(input: EventInput): Promise<EventRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const row = {
    ...input,
    public_slug: generateSlug(),
    created_by: auth.user.id,
  };
  const { data, error } = await supabase.from('events').insert(row).select().single();
  if (error) throw error;
  return data as EventRow;
}

export async function updateEvent(id: string, input: Partial<EventInput>): Promise<EventRow> {
  const { data, error } = await supabase
    .from('events')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as EventRow;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
