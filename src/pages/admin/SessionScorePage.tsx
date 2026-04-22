import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ExternalLink } from 'lucide-react';
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getEvent } from '@/lib/data/events';
import { listEventPlayers } from '@/lib/data/players';
import {
  ensureGamesForSession,
  getSession,
  listAllEventGames,
  listFramesForGames,
} from '@/lib/data/sessions';
import { SessionLeaderboard } from '@/components/leaderboard/SessionLeaderboard';
import { GameEditModal } from '@/components/scoresheet/GameEditModal';
import { useEventRealtime } from '@/hooks/useEventRealtime';

export function SessionScorePage() {
  const { eventId, sessionId } = useParams();

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

  // Ensure the session has a game row per (player, gameNumber)
  const gamesQuery = useQuery({
    queryKey: ['session-games', sessionId, event?.total_games, eventPlayers.length],
    enabled: Boolean(sessionId && event && eventPlayers.length > 0),
    queryFn: async () =>
      ensureGamesForSession(
        sessionId!,
        eventPlayers.map((ep) => ep.id),
        event!.total_games
      ),
  });
  const sessionGames = gamesQuery.data ?? [];

  const framesQuery = useQuery({
    queryKey: ['session-frames', sessionId, sessionGames.map((g) => g.id).join(',')],
    enabled: sessionGames.length > 0,
    queryFn: () => listFramesForGames(sessionGames.map((g) => g.id)),
  });
  const sessionFrames = framesQuery.data ?? [];

  // all event games for the "Avg" column (running average across every session)
  const allGamesQuery = useQuery({
    queryKey: ['event-all-games', eventId],
    queryFn: () => listAllEventGames(eventId!),
    enabled: Boolean(eventId),
  });
  const allEventGames = allGamesQuery.data ?? [];

  useEventRealtime(eventId);

  const [editingEpId, setEditingEpId] = React.useState<string | null>(null);
  const editingEp = editingEpId ? eventPlayers.find((ep) => ep.id === editingEpId) ?? null : null;

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

      {eventPlayers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Add players to the event roster before entering scores.
          </CardContent>
        </Card>
      ) : gamesQuery.isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <SessionLeaderboard
          event={event}
          session={session}
          eventPlayers={eventPlayers}
          allEventGames={allEventGames}
          sessionGames={sessionGames}
          onRowClick={(id) => setEditingEpId(id)}
          publicSlug={event.public_slug}
        />
      )}

      <GameEditModal
        open={Boolean(editingEp)}
        onOpenChange={(o) => {
          if (!o) setEditingEpId(null);
        }}
        event={event}
        session={session}
        eventPlayer={editingEp}
        games={sessionGames}
        frames={sessionFrames}
      />
    </div>
  );
}
