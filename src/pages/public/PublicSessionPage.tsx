import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FrameGrid } from '@/components/scoresheet/FrameGrid';
import {
  fetchPublicEvent,
  fetchPublicEventPlayers,
  fetchSessionWithGames,
} from '@/lib/data/public';
import { useEventRealtime } from '@/hooks/useEventRealtime';
import { Badge } from '@/components/ui/badge';
import type { FrameRow } from '@/types/db';

export function PublicSessionPage() {
  const { slug, sessionId } = useParams();
  const { data: event } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => fetchPublicEvent(slug!),
    enabled: Boolean(slug),
  });
  const { data: players = [] } = useQuery({
    queryKey: ['public-event-players', event?.id],
    queryFn: () => fetchPublicEventPlayers(event!.id),
    enabled: Boolean(event?.id),
  });
  const { data } = useQuery({
    queryKey: ['public-session', sessionId],
    queryFn: () => fetchSessionWithGames(sessionId!),
    enabled: Boolean(sessionId),
  });

  const { live } = useEventRealtime(event?.id);

  if (!event || !data) {
    return <Skeleton className="h-48" />;
  }

  const playersById = new Map(players.map((p) => [p.id, p]));
  const framesByGame = new Map<string, FrameRow[]>();
  for (const f of data.frames) {
    const arr = framesByGame.get(f.game_id) ?? [];
    arr.push(f);
    framesByGame.set(f.game_id, arr);
  }
  const byPlayer = new Map<string, typeof data.games>();
  for (const g of data.games) {
    const arr = byPlayer.get(g.event_player_id) ?? [];
    arr.push(g);
    byPlayer.set(g.event_player_id, arr);
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to={`/e/${slug}`}>
          <ChevronLeft className="h-4 w-4" /> {event.name}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">Session {data.session.session_number}</h1>
        <Badge variant="secondary">
          {format(new Date(data.session.session_date), 'EEE, MMM d, yyyy')}
        </Badge>
        {event.status === 'active' && live && (
          <Badge variant="live" className="animate-pulse-live">
            ● LIVE
          </Badge>
        )}
      </div>

      <div className="space-y-4">
        {[...byPlayer.entries()]
          .sort((a, b) => {
            const pa = playersById.get(a[0])?.player.full_name ?? '';
            const pb = playersById.get(b[0])?.player.full_name ?? '';
            return pa.localeCompare(pb);
          })
          .map(([epId, gs]) => {
            const ep = playersById.get(epId);
            if (!ep) return null;
            const sorted = [...gs].sort((x, y) => x.game_number - y.game_number);
            const series = sorted.reduce((s, g) => s + (g.total_score ?? 0), 0);
            return (
              <Card key={epId}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <Link
                      to={`/e/${slug}/players/${ep.player_id}`}
                      className="hover:underline"
                    >
                      {ep.player.full_name}
                    </Link>
                    <span className="tabular-nums text-sm font-normal text-muted-foreground">
                      Series {series}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sorted.map((g) => {
                    const fs = (framesByGame.get(g.id) ?? []).sort(
                      (a, b) => a.frame_number - b.frame_number
                    );
                    const rolls: number[] = [];
                    for (const f of fs) {
                      if (f.roll_1 !== null) rolls.push(f.roll_1);
                      if (f.roll_2 !== null) rolls.push(f.roll_2);
                      if (f.roll_3 !== null) rolls.push(f.roll_3);
                    }
                    return (
                      <div key={g.id} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Game {g.game_number}</span>
                          <span className="tabular-nums">{g.total_score ?? '—'}</span>
                        </div>
                        <FrameGrid rolls={rolls} onChange={() => {}} readOnly />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
      </div>
    </div>
  );
}
