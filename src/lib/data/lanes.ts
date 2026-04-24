import { supabase } from '@/lib/supabase';
import type { SessionLaneAssignmentRow } from '@/types/db';

export async function listSessionLaneAssignments(
  sessionId: string
): Promise<SessionLaneAssignmentRow[]> {
  const { data, error } = await supabase
    .from('session_lane_assignments')
    .select('*')
    .eq('session_id', sessionId);
  if (error) throw error;
  return (data ?? []) as SessionLaneAssignmentRow[];
}

export async function upsertSessionLane(
  sessionId: string,
  eventPlayerId: string,
  laneNumber: number | null
): Promise<void> {
  const { error } = await supabase
    .from('session_lane_assignments')
    .upsert(
      {
        session_id: sessionId,
        event_player_id: eventPlayerId,
        lane_number: laneNumber,
      },
      { onConflict: 'session_id,event_player_id' }
    );
  if (error) throw error;
}

/**
 * Replace all lane assignments for a session in one pass. Rows with null lanes
 * are deleted so the fallback (event_players.lane_number) shows through.
 */
export async function bulkSetSessionLanes(
  sessionId: string,
  assignments: Array<{ event_player_id: string; lane_number: number | null }>
): Promise<void> {
  const nullIds = assignments.filter((a) => a.lane_number == null).map((a) => a.event_player_id);
  const realRows = assignments.filter((a) => a.lane_number != null);
  if (nullIds.length > 0) {
    const { error } = await supabase
      .from('session_lane_assignments')
      .delete()
      .eq('session_id', sessionId)
      .in('event_player_id', nullIds);
    if (error) throw error;
  }
  if (realRows.length > 0) {
    const { error } = await supabase
      .from('session_lane_assignments')
      .upsert(
        realRows.map((r) => ({
          session_id: sessionId,
          event_player_id: r.event_player_id,
          lane_number: r.lane_number,
        })),
        { onConflict: 'session_id,event_player_id' }
      );
    if (error) throw error;
  }
}
