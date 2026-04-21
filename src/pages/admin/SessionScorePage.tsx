import { Link, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getEvent } from '@/lib/data/events';
import { listEventPlayers } from '@/lib/data/players';
import {
  ensureGamesForSession,
  getSession,
  listFramesForGames,
  logScoreEdit,
  updateGameTotals,
  upsertFrame,
} from '@/lib/data/sessions';
import { FrameGrid } from '@/components/scoresheet/FrameGrid';
import { scoreRolls } from '@/lib/scoring';
import type { FrameRow } from '@/types/db';

export function SessionScorePage() {
  const { eventId, sessionId } = useParams();
  const qc = useQueryClient();

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: Boolean(eventId),
  });
  const { data: session } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => getSession(sessionId!),
    enabled: Boolean(sessionId),
  });
  const { data: eventPlayers = [] } = useQuery({
    queryKey: ['event-players', eventId],
    queryFn: () => listEventPlayers(eventId!),
    enabled: Boolean(eventId),
  });

  // Ensure game rows exist for every (player, gameNumber) combo
  const gamesQuery = useQuery({
    queryKey: ['session-games', sessionId, event?.total_games, eventPlayers.length],
    enabled: Boolean(sessionId && event && eventPlayers.length > 0),
    queryFn: async () => {
      return ensureGamesForSession(
        sessionId!,
        eventPlayers.map((ep) => ep.id),
        event!.total_games
      );
    },
  });
  const games = gamesQuery.data ?? [];

  const framesQuery = useQuery({
    queryKey: ['session-frames', sessionId, games.map((g) => g.id).join(',')],
    enabled: games.length > 0,
    queryFn: () => listFramesForGames(games.map((g) => g.id)),
  });
  const frames = framesQuery.data ?? [];

  const framesByGame = React.useMemo(() => {
    const m = new Map<string, FrameRow[]>();
    for (const f of frames) {
      const arr = m.get(f.game_id) ?? [];
      arr.push(f);
      m.set(f.game_id, arr);
    }
    return m;
  }, [frames]);

  const rollsByGame = React.useMemo(() => {
    const m = new Map<string, number[]>();
    for (const [gameId, fs] of framesByGame.entries()) {
      const sorted = [...fs].sort((a, b) => a.frame_number - b.frame_number);
      const rolls: number[] = [];
      for (const f of sorted) {
        if (f.roll_1 !== null) rolls.push(f.roll_1);
        if (f.roll_2 !== null) rolls.push(f.roll_2);
        if (f.roll_3 !== null) rolls.push(f.roll_3);
      }
      m.set(gameId, rolls);
    }
    return m;
  }, [framesByGame]);

  const persistMutation = useMutation({
    mutationFn: async ({ gameId, rolls }: { gameId: string; rolls: number[] }) => {
      const game = scoreRolls(rolls);
      const existing = framesByGame.get(gameId) ?? [];
      const existingByFrame = new Map(existing.map((f) => [f.frame_number, f]));
      for (const frame of game.frames) {
        const r1 = frame.rolls[0] ?? null;
        const r2 = frame.rolls[1] ?? null;
        const r3 = frame.rolls[2] ?? null;
        const prior = existingByFrame.get(frame.frameNumber);
        const changed =
          !prior ||
          prior.roll_1 !== r1 ||
          prior.roll_2 !== r2 ||
          prior.roll_3 !== r3 ||
          prior.frame_score !== frame.frameScore;
        if (changed) {
          await upsertFrame(
            gameId,
            frame.frameNumber,
            { roll_1: r1, roll_2: r2, roll_3: r3 },
            frame.frameScore
          );
          if (prior) {
            await logScoreEdit(
              gameId,
              prior.id,
              `frame_${frame.frameNumber}`,
              JSON.stringify({ r1: prior.roll_1, r2: prior.roll_2, r3: prior.roll_3 }),
              JSON.stringify({ r1, r2, r3 })
            );
          }
        }
      }
      await updateGameTotals(gameId, game.total, game.isComplete);
    },
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ['session-frames', sessionId],
      });
      qc.invalidateQueries({ queryKey: ['session-games', sessionId] });
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Could not save');
    },
  });

  if (!event || !session) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const publicUrl = `${window.location.origin}/e/${event.public_slug}/sessions/${session.id}`;

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm">
        <Link to={`/admin/events/${event.id}`}>
          <ChevronLeft className="h-4 w-4" /> {event.name}
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Session {session.session_number}
            <Badge variant="secondary" className="ml-2">
              {new Date(session.session_date).toLocaleDateString()}
            </Badge>
          </h1>
          <p className="text-sm text-muted-foreground">
            {eventPlayers.length} players · {event.total_games} games each
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={publicUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="h-4 w-4" /> View public session
          </a>
        </Button>
      </div>

      {gamesQuery.isLoading ? (
        <Skeleton className="h-40" />
      ) : (
        <div className="space-y-4">
          {eventPlayers.map((ep) => {
            const playerGames = games
              .filter((g) => g.event_player_id === ep.id)
              .sort((a, b) => a.game_number - b.game_number);
            const scratchSeries = playerGames.reduce((sum, g) => sum + (g.total_score ?? 0), 0);
            return (
              <Card key={ep.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <CardTitle className="text-base">
                      {ep.player.full_name}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        hdcp {ep.handicap}
                      </span>
                    </CardTitle>
                    <div className="text-sm">
                      Series:{' '}
                      <span className="font-semibold tabular-nums">{scratchSeries}</span>
                      <span className="text-muted-foreground">
                        {' '}
                        (+{event.total_games * ep.handicap} hdcp ={' '}
                        <span className="font-semibold text-foreground">
                          {scratchSeries + event.total_games * ep.handicap}
                        </span>
                        )
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {playerGames.map((g) => {
                    const rolls = rollsByGame.get(g.id) ?? [];
                    return (
                      <div key={g.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Game {g.game_number}</span>
                          <div className="flex items-center gap-2">
                            {g.is_complete && (
                              <Badge variant="success">Complete</Badge>
                            )}
                            <span className="text-muted-foreground">
                              Total{' '}
                              <span className="font-semibold text-foreground tabular-nums">
                                {g.total_score ?? '—'}
                              </span>
                            </span>
                          </div>
                        </div>
                        <FrameGrid
                          rolls={rolls}
                          onChange={(next) => {
                            persistMutation.mutate({ gameId: g.id, rolls: next });
                          }}
                        />
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
