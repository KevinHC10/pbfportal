import { supabase } from '@/lib/supabase';
import { computeEventStatus } from '@/lib/event-status';
import type {
  EventPlayerRow,
  EventRow,
  EventStatus,
  LeagueMembershipRow,
  MembershipStatus,
  PlayerRow,
} from '@/types/db';

export type AttendanceCell =
  | { kind: 'played'; gamesPlayed: number }
  | { kind: 'absent' }       // on the roster but is_playing = false
  | { kind: 'not-rostered' };

export interface AttendanceEventColumn {
  event: EventRow;
  status: EventStatus;
}

export interface AttendanceRow {
  player: PlayerRow;
  status: MembershipStatus;
  attendance: Record<string, AttendanceCell>; // keyed by event id
  attendedCount: number;
  rosteredCount: number;
}

export interface SeasonAttendance {
  events: AttendanceEventColumn[];
  members: AttendanceRow[];
  /** non-member walk-ins who showed up at some event(s) under this season */
  visitors: AttendanceRow[];
}

/**
 * Build the attendance matrix for one league + season.
 *
 * Rows = league members (regular + guest, one per membership) in this season.
 *        plus a `visitors` group for non-members who appeared on any event roster.
 * Cols = events in the season, chronological by start_date.
 * Cells = whether the player was on the event_players roster, and if so,
 *         whether they were marked as playing.
 */
export async function fetchSeasonAttendance(
  leagueId: string,
  seasonId: string | null
): Promise<SeasonAttendance> {
  // 1) events in this league+season
  let eventsQuery = supabase
    .from('events')
    .select('*')
    .eq('league_id', leagueId)
    .order('start_date', { ascending: true });
  if (seasonId) eventsQuery = eventsQuery.eq('season_id', seasonId);
  else eventsQuery = eventsQuery.is('season_id', null);
  const { data: events, error: eErr } = await eventsQuery;
  if (eErr) throw eErr;
  const eventRows = (events ?? []) as EventRow[];
  const eventIds = eventRows.map((e) => e.id);

  // 2) memberships in this league+season
  let memQuery = supabase
    .from('league_memberships')
    .select('*, player:players(*)')
    .eq('league_id', leagueId);
  if (seasonId) memQuery = memQuery.eq('season_id', seasonId);
  const { data: memberships, error: mErr } = await memQuery;
  if (mErr) throw mErr;
  const memberRows = (memberships ?? []) as Array<
    LeagueMembershipRow & { player: PlayerRow }
  >;

  // 3) event_players for those events with the player joined
  let epRows: Array<EventPlayerRow & { player: PlayerRow }> = [];
  if (eventIds.length > 0) {
    const { data: eps, error: epErr } = await supabase
      .from('event_players')
      .select('*, player:players(*)')
      .in('event_id', eventIds);
    if (epErr) throw epErr;
    epRows = (eps ?? []) as Array<EventPlayerRow & { player: PlayerRow }>;
  }

  // 4) games per (event, event_player) for the gamesPlayed pill on each cell
  const gameCount = new Map<string, number>(); // key: `${eventId}:${eventPlayerId}` => count
  if (eventIds.length > 0) {
    const { data: games, error: gErr } = await supabase
      .from('games')
      .select('event_id, event_player_id, total_score')
      .in('event_id', eventIds);
    if (gErr) throw gErr;
    for (const g of games ?? []) {
      if ((g.total_score ?? 0) > 0) {
        const k = `${g.event_id}:${g.event_player_id}`;
        gameCount.set(k, (gameCount.get(k) ?? 0) + 1);
      }
    }
  }

  // index event_players by (event_id, player_id)
  const epByEventPlayer = new Map<string, EventPlayerRow & { player: PlayerRow }>();
  for (const ep of epRows) {
    epByEventPlayer.set(`${ep.event_id}:${ep.player_id}`, ep);
  }

  function buildRow(player: PlayerRow, status: MembershipStatus): AttendanceRow {
    const attendance: Record<string, AttendanceCell> = {};
    let attended = 0;
    let rostered = 0;
    for (const e of eventRows) {
      const ep = epByEventPlayer.get(`${e.id}:${player.id}`);
      if (!ep) {
        attendance[e.id] = { kind: 'not-rostered' };
        continue;
      }
      rostered += 1;
      if (!ep.is_playing) {
        attendance[e.id] = { kind: 'absent' };
        continue;
      }
      attended += 1;
      const games = gameCount.get(`${e.id}:${ep.id}`) ?? 0;
      attendance[e.id] = { kind: 'played', gamesPlayed: games };
    }
    return {
      player,
      status,
      attendance,
      attendedCount: attended,
      rosteredCount: rostered,
    };
  }

  // member rows
  const seenPlayerIds = new Set<string>();
  // dedupe: a player could in theory have both regular + guest rows; prefer regular
  const memberByPlayer = new Map<string, AttendanceRow>();
  // sort regular before guest so the "regular" row wins when both exist
  const sortedMemberships = [...memberRows].sort(
    (a, b) => (a.status === 'regular' ? -1 : 1) - (b.status === 'regular' ? -1 : 1)
  );
  for (const m of sortedMemberships) {
    if (memberByPlayer.has(m.player_id)) continue;
    memberByPlayer.set(m.player_id, buildRow(m.player, m.status));
    seenPlayerIds.add(m.player_id);
  }

  // visitor rows: anyone on event_players for these events who isn't a member
  const visitorByPlayer = new Map<string, AttendanceRow>();
  for (const ep of epRows) {
    if (seenPlayerIds.has(ep.player_id)) continue;
    if (visitorByPlayer.has(ep.player_id)) continue;
    visitorByPlayer.set(ep.player_id, buildRow(ep.player, 'guest'));
  }

  const members = [...memberByPlayer.values()].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'regular' ? -1 : 1;
    return b.attendedCount - a.attendedCount || a.player.full_name.localeCompare(b.player.full_name);
  });
  const visitors = [...visitorByPlayer.values()].sort(
    (a, b) =>
      b.attendedCount - a.attendedCount || a.player.full_name.localeCompare(b.player.full_name)
  );

  const eventColumns: AttendanceEventColumn[] = eventRows.map((event) => ({
    event,
    status: computeEventStatus(event),
  }));

  return { events: eventColumns, members, visitors };
}
