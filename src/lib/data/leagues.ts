import { supabase } from '@/lib/supabase';
import { generateSlug } from '@/lib/utils';
import type {
  DayOfWeek,
  LeagueMembershipRow,
  LeagueRow,
  MembershipStatus,
  PlayerRow,
} from '@/types/db';

export interface LeagueInput {
  name: string;
  acronym?: string | null;
  parent_league_id?: string | null;
  center_name?: string | null;
  day_of_week?: DayOfWeek | null;
  start_time_local?: string | null;
  timezone?: string | null;
  description?: string | null;
  logo_url?: string | null;
  banner_url?: string | null;
  hdcp_base?: number;
  hdcp_factor?: number;
  hdcp_max?: number;
  hdcp_min?: number;
}

export async function listLeagues(): Promise<LeagueRow[]> {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as LeagueRow[];
}

export async function getLeague(id: string): Promise<LeagueRow | null> {
  const { data, error } = await supabase.from('leagues').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as LeagueRow | null;
}

export async function getLeagueBySlug(slug: string): Promise<LeagueRow | null> {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('public_slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as LeagueRow | null;
}

export async function listSubLeagues(parentId: string): Promise<LeagueRow[]> {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('parent_league_id', parentId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as LeagueRow[];
}

export async function createLeague(input: LeagueInput): Promise<LeagueRow> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('leagues')
    .insert({ ...input, public_slug: generateSlug(), created_by: auth.user.id })
    .select()
    .single();
  if (error) throw error;
  return data as LeagueRow;
}

export async function updateLeague(id: string, patch: Partial<LeagueInput>): Promise<LeagueRow> {
  const { data, error } = await supabase
    .from('leagues')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as LeagueRow;
}

export async function deleteLeague(id: string): Promise<void> {
  const { error } = await supabase.from('leagues').delete().eq('id', id);
  if (error) throw error;
}

// ------------------------------------------------------------------
// Memberships
// ------------------------------------------------------------------

export interface MembershipWithPlayer extends LeagueMembershipRow {
  player: PlayerRow;
}

export async function listMemberships(leagueId: string): Promise<MembershipWithPlayer[]> {
  const { data, error } = await supabase
    .from('league_memberships')
    .select('*, player:players(*)')
    .eq('league_id', leagueId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as MembershipWithPlayer[];
}

export async function addMembership(input: {
  league_id: string;
  player_id: string;
  status: MembershipStatus;
  season_label: string;
}): Promise<LeagueMembershipRow> {
  const { data, error } = await supabase
    .from('league_memberships')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as LeagueMembershipRow;
}

export async function updateMembership(
  id: string,
  patch: Partial<Pick<LeagueMembershipRow, 'status' | 'season_label'>>
): Promise<void> {
  const { error } = await supabase.from('league_memberships').update(patch).eq('id', id);
  if (error) throw error;
}

export async function removeMembership(id: string): Promise<void> {
  const { error } = await supabase.from('league_memberships').delete().eq('id', id);
  if (error) throw error;
}
