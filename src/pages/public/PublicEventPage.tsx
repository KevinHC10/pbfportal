import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Calendar, Download, FileText, Flag, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SessionLeaderboard } from '@/components/leaderboard/SessionLeaderboard';
import { PotGamesSection } from '@/components/pots/PotGamesSection';
import {
  fetchPublicEvent,
  fetchPublicEventGames,
  fetchPublicEventLaneAssignments,
  fetchPublicEventPlayers,
  fetchPublicLeagueById,
} from '@/lib/data/public';
import { fetchLeagueMembershipMap } from '@/lib/data/roster';
import { useEventRealtime } from '@/hooks/useEventRealtime';
import { downloadStandingsCsv } from '@/lib/export/csv';
import { computeEventStatus, formatStartMoment } from '@/lib/event-status';

export function PublicEventPage() {
  const { slug } = useParams();
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
  const { data: league } = useQuery({
    queryKey: ['public-event-league', event?.league_id],
    queryFn: () => fetchPublicLeagueById(event!.league_id!),
    enabled: Boolean(event?.league_id),
  });
  const { data: games = [] } = useQuery({
    queryKey: ['public-event-games', event?.id],
    queryFn: () => fetchPublicEventGames(event!.id),
    enabled: Boolean(event?.id),
  });
  const { data: laneAssignments = [] } = useQuery({
    queryKey: ['public-event-lanes', event?.id],
    queryFn: () => fetchPublicEventLaneAssignments(event!.id),
    enabled: Boolean(event?.id),
  });
  const { data: membershipByPlayerId } = useQuery({
    queryKey: ['public-membership-map', event?.league_id, event?.season_id],
    queryFn: () =>
      fetchLeagueMembershipMap(event!.league_id!, event!.season_id ?? null),
    enabled: Boolean(event?.league_id),
  });

  const { live } = useEventRealtime(event?.id);

  if (eventLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }
  if (!event) {
    return (
      <Card>
        <CardContent className="py-14 text-center">
          <p className="font-medium">Event not found.</p>
          <p className="text-sm text-muted-foreground">
            Double-check the link you were given.
          </p>
        </CardContent>
      </Card>
    );
  }

  const derivedStatus = computeEventStatus(event);
  const playingRoster = players.filter((ep) => ep.is_playing);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold">{event.name}</h1>
          <Badge variant="outline" className="capitalize">
            {event.type}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {derivedStatus}
          </Badge>
          {derivedStatus === 'active' && live && (
            <Badge variant="live" className="animate-pulse-live">
              ● LIVE
            </Badge>
          )}
          {league && (
            <Link
              to={`/leagues/${league.public_slug}`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground hover:underline"
            >
              <Flag className="h-3.5 w-3.5" />
              {league.acronym ?? league.name}
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {formatStartMoment(event)}
            {event.end_date ? ` → ${format(new Date(event.end_date), 'MMM d, yyyy')}` : ''}
          </span>
          {event.center_name && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {event.center_name}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {playingRoster.length} playing
            {players.length !== playingRoster.length && ` of ${players.length}`}
          </span>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadStandingsCsv(event, playingRoster, games)}
          disabled={playingRoster.length === 0}
        >
          <Download className="h-4 w-4" /> CSV
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            const { downloadStandingsPdf } = await import('@/lib/export/pdf');
            await downloadStandingsPdf(event, playingRoster, games);
          }}
          disabled={playingRoster.length === 0}
        >
          <FileText className="h-4 w-4" /> PDF
        </Button>
      </div>

      {playingRoster.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No bowlers checked in yet.
          </CardContent>
        </Card>
      ) : (
        <SessionLeaderboard
          event={event}
          eventPlayers={playingRoster}
          allEventGames={games}
          sessionGames={games}
          laneAssignments={laneAssignments}
          membershipByPlayerId={membershipByPlayerId}
          publicSlug={event.public_slug}
        />
      )}

      {playingRoster.length > 0 && (
        <PotGamesSection
          event={event}
          eventPlayers={playingRoster}
          allEventGames={games}
          sessionGames={games}
          adminMode={false}
        />
      )}
    </div>
  );
}
