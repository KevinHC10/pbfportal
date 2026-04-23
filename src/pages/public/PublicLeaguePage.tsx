import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchPublicLeague,
  fetchPublicLeagueEvents,
  fetchPublicLeagueMemberships,
  fetchPublicSubLeagues,
} from '@/lib/data/public';
import { formatScheduleLine } from '@/lib/schedule';

export function PublicLeaguePage() {
  const { slug } = useParams();
  const { data: league, isLoading } = useQuery({
    queryKey: ['public-league', slug],
    queryFn: () => fetchPublicLeague(slug!),
    enabled: Boolean(slug),
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['public-league-memberships', league?.id],
    queryFn: () => fetchPublicLeagueMemberships(league!.id),
    enabled: Boolean(league?.id),
  });
  const { data: events = [] } = useQuery({
    queryKey: ['public-league-events', league?.id],
    queryFn: () => fetchPublicLeagueEvents(league!.id),
    enabled: Boolean(league?.id),
  });
  const { data: subLeagues = [] } = useQuery({
    queryKey: ['public-sub-leagues', league?.id],
    queryFn: () => fetchPublicSubLeagues(league!.id),
    enabled: Boolean(league?.id),
  });

  if (isLoading) {
    return <Skeleton className="h-60" />;
  }
  if (!league) {
    return (
      <Card>
        <CardContent className="py-14 text-center">
          <p className="font-medium">League not found.</p>
        </CardContent>
      </Card>
    );
  }

  const regulars = memberships.filter((m) => m.status === 'regular');
  const guests = memberships.filter((m) => m.status === 'guest');
  const schedule = formatScheduleLine(
    league.day_of_week,
    league.start_time_local,
    league.timezone
  );

  return (
    <div className="space-y-6">
      {league.banner_url && (
        <div
          className="h-48 md:h-64 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${league.banner_url})` }}
        />
      )}

      <header className="flex flex-wrap items-start gap-4">
        {league.logo_url && (
          <img
            src={league.logo_url}
            alt={`${league.name} logo`}
            className="h-16 w-16 rounded-md border bg-card object-contain"
          />
        )}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{league.name}</h1>
            {league.acronym && <Badge variant="outline">{league.acronym}</Badge>}
          </div>
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {league.center_name && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {league.center_name}
              </span>
            )}
            {schedule && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {schedule}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {memberships.length} members
            </span>
          </div>
        </div>
      </header>

      {league.description && (
        <Card>
          <CardContent className="py-4 text-sm whitespace-pre-wrap">
            {league.description}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">
            Members ({memberships.length})
          </TabsTrigger>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          {subLeagues.length > 0 && (
            <TabsTrigger value="sub-leagues">Sub-leagues ({subLeagues.length})</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Roster</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <MemberTable title="Regular" rows={regulars} />
              {guests.length > 0 && <MemberTable title="Guest" rows={guests} />}
              {memberships.length === 0 && (
                <p className="text-sm text-muted-foreground">No members listed yet.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Events</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet.</p>
              ) : (
                <div className="space-y-2">
                  {events.map((e) => (
                    <Link
                      key={e.id}
                      to={`/e/${e.public_slug}`}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {e.type} · {e.start_date}
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {e.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {subLeagues.length > 0 && (
          <TabsContent value="sub-leagues">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sub-leagues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {subLeagues.map((sl) => (
                    <Link
                      key={sl.id}
                      to={`/leagues/${sl.public_slug}`}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                    >
                      <div>
                        <div className="font-medium">
                          {sl.name}
                          {sl.acronym && (
                            <Badge variant="outline" className="ml-2">
                              {sl.acronym}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatScheduleLine(
                            sl.day_of_week,
                            sl.start_time_local,
                            sl.timezone
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

function MemberTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ id: string; season_label: string; player: { full_name: string; home_average: number | null; affiliation: string | null } }>;
}) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="font-semibold text-sm mb-2">{title}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Home avg</TableHead>
            <TableHead>Season</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-medium">{m.player.full_name}</TableCell>
              <TableCell className="text-muted-foreground">
                {m.player.home_average ?? '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {m.season_label || '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
