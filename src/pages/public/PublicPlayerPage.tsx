import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  fetchPublicEvent,
  fetchPublicEventFrames,
  fetchPublicEventGames,
  fetchPublicEventPlayers,
} from '@/lib/data/public';
import { FrameGrid } from '@/components/scoresheet/FrameGrid';
import type { FrameRow } from '@/types/db';

export function PublicPlayerPage() {
  const { slug, playerId } = useParams();
  const { data: event, isLoading: eventLoading } = useQuery({
    queryKey: ['public-event', slug],
    queryFn: () => fetchPublicEvent(slug!),
    enabled: Boolean(slug),
  });
  const { data: players = [] } = useQuery({
    queryKey: ['public-event-players', event?.id],
    queryFn: () => fetchPublicEventPlayers(event!.id),
    enabled: Boolean(event?.id),
  });
  const { data: games = [] } = useQuery({
    queryKey: ['public-event-games', event?.id],
    queryFn: () => fetchPublicEventGames(event!.id),
    enabled: Boolean(event?.id),
  });
  const { data: frames = [] } = useQuery({
    queryKey: ['public-event-frames', event?.id],
    queryFn: () => fetchPublicEventFrames(event!.id),
    enabled: Boolean(event?.id),
  });

  if (eventLoading || !event) {
    return <Skeleton className="h-48" />;
  }

  const ep = players.find((p) => p.player_id === playerId);
  if (!ep) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p>Player not registered for this event.</p>
        </CardContent>
      </Card>
    );
  }

  const playerGames = games
    .filter((g) => g.event_player_id === ep.id)
    .sort((a, b) => a.game_number - b.game_number);
  const chartData = playerGames.map((g) => ({
    game: `G${g.game_number}`,
    score: g.total_score ?? 0,
  }));
  const scores = playerGames.map((g) => g.total_score ?? 0).filter((v) => v > 0);
  const high = scores.length ? Math.max(...scores) : 0;
  const total = scores.reduce((a, b) => a + b, 0);
  const avg = scores.length ? total / scores.length : 0;

  const framesByGame = new Map<string, FrameRow[]>();
  for (const f of frames) {
    const arr = framesByGame.get(f.game_id) ?? [];
    arr.push(f);
    framesByGame.set(f.game_id, arr);
  }

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to={`/e/${slug}`}>
          <ChevronLeft className="h-4 w-4" /> {event.name}
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold">{ep.player.full_name}</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
          <Badge variant="outline">hdcp {ep.handicap}</Badge>
          <span>High game {high}</span>
          <span>Avg {avg.toFixed(1)}</span>
          <span>Series {total}</span>
        </div>
      </div>

      {playerGames.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Game scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="game" className="text-xs" />
                  <YAxis domain={[0, 300]} className="text-xs" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    strokeWidth={2}
                    stroke="hsl(var(--primary))"
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {playerGames.map((g) => {
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
            <Card key={g.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Game {g.game_number}</span>
                  <span className="tabular-nums">{g.total_score ?? '—'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FrameGrid rolls={rolls} onChange={() => {}} readOnly />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
