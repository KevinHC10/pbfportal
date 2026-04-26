import { supabase } from '@/lib/supabase';
import type { EventRow, LeagueMembershipRow, PlayerRow } from '@/types/db';

/**
 * Find the most recent event under the same league + season — used to copy
 * its roster onto a brand-new event.
 */
export async function findPreviousEventInSeason(
  currentEvent: EventRow
): Promise<EventRow | null> {
  if (!currentEvent.league_id) return null;
  let q = supabase
    .from('events')
    .select('*')
    .eq('league_id', currentEvent.league_id)
    .neq('id', currentEvent.id)
    .order('start_date', { ascending: false })
    .limit(1);
  if (currentEvent.season_id) {
    q = q.eq('season_id', currentEvent.season_id);
  } else {
    q = q.is('season_id', null);
  }
  const { data, error } = await q;
  if (error) throw error;
  return ((data ?? [])[0] as EventRow | undefined) ?? null;
}

/**
 * Insert event_players rows for every player from `fromEventId` who isn't
 * already on `toEventId`. Carries handicap and lane_number forward; resets
 * is_playing to true so the admin can toggle it off as people skip the week.
 */
export async function copyRosterFromEvent(
  fromEventId: string,
  toEventId: string
): Promise<number> {
  const { data: source, error: srcErr } = await supabase
    .from('event_players')
    .select('player_id, handicap, lane_number')
    .eq('event_id', fromEventId);
  if (srcErr) throw srcErr;
  const { data: existing, error: exErr } = await supabase
    .from('event_players')
    .select('player_id')
    .eq('event_id', toEventId);
  if (exErr) throw exErr;
  const haveIds = new Set((existing ?? []).map((r) => r.player_id));
  const toInsert = (source ?? [])
    .filter((r) => !haveIds.has(r.player_id))
    .map((r) => ({
      event_id: toEventId,
      player_id: r.player_id,
      handicap: r.handicap,
      lane_number: r.lane_number,
      is_playing: true,
    }));
  if (toInsert.length === 0) return 0;
  const { error } = await supabase.from('event_players').insert(toInsert);
  if (error) throw error;
  return toInsert.length;
}

/**
 * Players known to this admin, with the relevant league memberships pulled
 * in so the add-player dialog can suggest them with their affiliation
 * already filled in.
 */
export interface SuggestiblePlayer {
  player: PlayerRow;
  memberships: Array<LeagueMembershipRow & { league: { id: string; name: string; acronym: string | null } }>;
}

export async function fetchSuggestiblePlayers(): Promise<SuggestiblePlayer[]> {
  const { data, error } = await supabase
    .from('players')
    .select('*, memberships:league_memberships(*, league:leagues(id,name,acronym))')
    .order('full_name', { ascending: true });
  if (error) throw error;
  return ((data ?? []) as Array<PlayerRow & { memberships: Array<LeagueMembershipRow & { league: { id: string; name: string; acronym: string | null } }> }>).map(
    (row) => ({
      player: {
        id: row.id,
        full_name: row.full_name,
        avatar_url: row.avatar_url,
        handedness: row.handedness,
        home_average: row.home_average,
        affiliation: row.affiliation,
        public_slug: row.public_slug,
        created_by: row.created_by,
        created_at: row.created_at,
      },
      memberships: row.memberships ?? [],
    })
  );
}

/**
 * Map of player_id → membership-status for a given league. Used by the
 * leaderboard to stamp each row with R / G.
 */
export async function fetchLeagueMembershipMap(
  leagueId: string,
  seasonId: string | null
): Promise<Map<string, 'regular' | 'guest'>> {
  let q = supabase
    .from('league_memberships')
    .select('player_id, status, season_id')
    .eq('league_id', leagueId);
  if (seasonId) q = q.eq('season_id', seasonId);
  const { data, error } = await q;
  if (error) throw error;
  const m = new Map<string, 'regular' | 'guest'>();
  for (const row of data ?? []) {
    // Prefer "regular" if a player has both regular and guest entries.
    const existing = m.get(row.player_id);
    if (existing === 'regular') continue;
    m.set(row.player_id, row.status as 'regular' | 'guest');
  }
  return m;
}

export async function listEventPlayerIds(eventId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('event_players')
    .select('player_id')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data ?? []).map((r) => r.player_id);
}
