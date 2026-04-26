import { supabase } from '@/lib/supabase';
import type {
  AssociationRow,
  EventLaneAssignmentRow,
  EventPlayerRow,
  EventRow,
  FrameRow,
  GameRow,
  LeagueMembershipRow,
  LeagueRow,
  PlayerRow,
  SeasonRow,
} from '@/types/db';

export async function fetchPublicEvent(slug: string): Promise<EventRow | null> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('public_slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as EventRow | null;
}

export async function fetchPublicEventPlayers(
  eventId: string
): Promise<Array<EventPlayerRow & { player: PlayerRow }>> {
  const { data, error } = await supabase
    .from('event_players')
    .select('*, player:players(*)')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data ?? []) as Array<EventPlayerRow & { player: PlayerRow }>;
}

export async function fetchPublicEventGames(
  eventId: string
): Promise<GameRow[]> {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data ?? []) as GameRow[];
}

export async function fetchPublicEventFrames(
  eventId: string
): Promise<FrameRow[]> {
  const games = await fetchPublicEventGames(eventId);
  const ids = games.map((g) => g.id);
  if (ids.length === 0) return [];
  const { data, error } = await supabase.from('frames').select('*').in('game_id', ids);
  if (error) throw error;
  return (data ?? []) as FrameRow[];
}

export async function fetchPublicLeague(slug: string): Promise<LeagueRow | null> {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('public_slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as LeagueRow | null;
}

export async function fetchPublicAssociation(slug: string): Promise<AssociationRow | null> {
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .eq('public_slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as AssociationRow | null;
}

export async function fetchPublicAssociationLeagues(
  associationId: string
): Promise<LeagueRow[]> {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('association_id', associationId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as LeagueRow[];
}

export async function fetchPublicAssociationById(
  id: string
): Promise<AssociationRow | null> {
  const { data, error } = await supabase
    .from('associations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as AssociationRow | null;
}

export async function fetchPublicLeagueById(id: string): Promise<LeagueRow | null> {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as LeagueRow | null;
}

export async function fetchPublicLeagueMemberships(
  leagueId: string
): Promise<Array<LeagueMembershipRow & { player: PlayerRow; season: SeasonRow | null }>> {
  const { data, error } = await supabase
    .from('league_memberships')
    .select('*, player:players(*), season:seasons(*)')
    .eq('league_id', leagueId);
  if (error) throw error;
  return (data ?? []) as Array<
    LeagueMembershipRow & { player: PlayerRow; season: SeasonRow | null }
  >;
}

export async function fetchPublicLeagueSeasons(leagueId: string): Promise<SeasonRow[]> {
  const { data, error } = await supabase
    .from('seasons')
    .select('*')
    .eq('league_id', leagueId)
    .order('start_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as SeasonRow[];
}

export async function fetchPublicLeagueEvents(leagueId: string): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('league_id', leagueId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as EventRow[];
}

export async function fetchPublicSubLeagues(parentId: string): Promise<LeagueRow[]> {
  const { data, error } = await supabase
    .from('leagues')
    .select('*')
    .eq('parent_league_id', parentId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as LeagueRow[];
}

export async function fetchPublicPlayerBySlug(slug: string): Promise<PlayerRow | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('public_slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data as PlayerRow | null;
}

export interface PlayerLeagueMembership extends LeagueMembershipRow {
  league: LeagueRow;
  season: SeasonRow | null;
}

export async function fetchPublicPlayerMemberships(
  playerId: string
): Promise<PlayerLeagueMembership[]> {
  const { data, error } = await supabase
    .from('league_memberships')
    .select('*, league:leagues(*), season:seasons(*)')
    .eq('player_id', playerId);
  if (error) throw error;
  return (data ?? []) as PlayerLeagueMembership[];
}

export interface PlayerEventParticipation extends EventPlayerRow {
  event: EventRow;
  games: GameRow[];
}

export async function fetchPublicPlayerParticipation(
  playerId: string
): Promise<PlayerEventParticipation[]> {
  const { data, error } = await supabase
    .from('event_players')
    .select('*, event:events(*), games:games(*)')
    .eq('player_id', playerId);
  if (error) throw error;
  return (data ?? []) as PlayerEventParticipation[];
}

export async function fetchPublicEventLaneAssignments(
  eventId: string
): Promise<EventLaneAssignmentRow[]> {
  const { data, error } = await supabase
    .from('event_lane_assignments')
    .select('*')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data ?? []) as EventLaneAssignmentRow[];
}
