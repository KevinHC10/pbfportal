import * as React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Subscribe to realtime changes on games/frames for a given event.
 * When anything changes we invalidate the matching query keys so leaderboards
 * and scoresheets re-fetch.
 */
export function useEventRealtime(eventId: string | undefined) {
  const qc = useQueryClient();
  const [live, setLive] = React.useState(false);

  React.useEffect(() => {
    if (!eventId) return;
    const channel = supabase
      .channel(`event:${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'games' }, () => {
        setLive(true);
        qc.invalidateQueries({ queryKey: ['public-event-games', eventId] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'frames' }, () => {
        setLive(true);
        qc.invalidateQueries({ queryKey: ['public-event-frames', eventId] });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [eventId, qc]);

  return { live };
}
