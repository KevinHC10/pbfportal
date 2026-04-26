import { supabase } from '@/lib/supabase';
import type { EventLaneAssignmentRow } from '@/types/db';

export async function listEventLaneAssignments(
  eventId: string
): Promise<EventLaneAssignmentRow[]> {
  const { data, error } = await supabase
    .from('event_lane_assignments')
    .select('*')
    .eq('event_id', eventId);
  if (error) throw error;
  return (data ?? []) as EventLaneAssignmentRow[];
}

/**
 * Replace all lane assignments for an event in one pass. Rows with null lanes
 * are deleted so the fallback (event_players.lane_number) shows through.
 */
export async function bulkSetEventLanes(
  eventId: string,
  assignments: Array<{ event_player_id: string; lane_number: number | null }>
): Promise<void> {
  const nullIds = assignments.filter((a) => a.lane_number == null).map((a) => a.event_player_id);
  const realRows = assignments.filter((a) => a.lane_number != null);
  if (nullIds.length > 0) {
    const { error } = await supabase
      .from('event_lane_assignments')
      .delete()
      .eq('event_id', eventId)
      .in('event_player_id', nullIds);
    if (error) throw error;
  }
  if (realRows.length > 0) {
    const { error } = await supabase
      .from('event_lane_assignments')
      .upsert(
        realRows.map((r) => ({
          event_id: eventId,
          event_player_id: r.event_player_id,
          lane_number: r.lane_number,
        })),
        { onConflict: 'event_id,event_player_id' }
      );
    if (error) throw error;
  }
}
