import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Subscribe to realtime changes on games/frames for a given event.
 * When anything changes we invalidate every admin + public query that might
 * show stale data so leaderboards and scoresheets re-fetch.
 */
export function useEventRealtime(eventId: string | undefined) {
  const qc = useQueryClient();
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    if (!eventId) return;
    const invalidate = () => {
      setLive(true);
      qc.invalidateQueries({ queryKey: ['public-event-games', eventId] });
      qc.invalidateQueries({ queryKey: ['public-event-frames', eventId] });
      qc.invalidateQueries({ queryKey: ['event-all-games', eventId] });
      qc.invalidateQueries({ queryKey: ['public-session'] });
      qc.invalidateQueries({ queryKey: ['session-games'] });
      qc.invalidateQueries({ queryKey: ['session-frames'] });
    };
    const channel = supabase
      .channel(`event:${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, invalidate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'frames' }, invalidate)
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, qc]);

  return { live };
}
