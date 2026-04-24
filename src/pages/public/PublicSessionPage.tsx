import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SessionLeaderboard } from '@/components/leaderboard/SessionLeaderboard';
import { PotGamesSection } from '@/components/pots/PotGamesSection';
import { Badge } from '@/components/ui/badge';
import {
  fetchPublicEvent,
  fetchPublicEventGames,
  fetchPublicEventPlayers,
  fetchPublicSessionLaneAssignments,
  fetchSessionWithGames,
} from '@/lib/data/public';
import { useEventRealtime } from '@/hooks/useEventRealtime';

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
  const { data: allEventGames = [] } = useQuery({
    queryKey: ['public-event-games', event?.id],
    queryFn: () => fetchPublicEventGames(event!.id),
    enabled: Boolean(event?.id),
  });
  const { data } = useQuery({
    queryKey: ['public-session', sessionId],
    queryFn: () => fetchSessionWithGames(sessionId!),
    enabled: Boolean(sessionId),
  });
  const { data: laneAssignments = [] } = useQuery({
    queryKey: ['public-session-lanes', sessionId],
    queryFn: () => fetchPublicSessionLaneAssignments(sessionId!),
    enabled: Boolean(sessionId),
  });

  const { live } = useEventRealtime(event?.id);

  if (!event || !data) {
    return <Skeleton className="h-48" />;
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

      {players.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No players in this event yet.
          </CardContent>
        </Card>
      ) : (
        <>
          <SessionLeaderboard
            event={event}
            session={data.session}
            eventPlayers={players}
            allEventGames={allEventGames}
            sessionGames={data.games}
            laneAssignments={laneAssignments}
            publicSlug={event.public_slug}
          />
          <PotGamesSection
            event={event}
            session={data.session}
            eventPlayers={players}
            allEventGames={allEventGames}
            sessionGames={data.games}
            adminMode={false}
          />
        </>
      )}
    </div>
  );
}
