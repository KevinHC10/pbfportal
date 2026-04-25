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
import { format } from 'date-fns';
import { Flag, MapPin, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  fetchPublicPlayerBySlug,
  fetchPublicPlayerMemberships,
  fetchPublicPlayerParticipation,
} from '@/lib/data/public';
import type { GameRow } from '@/types/db';

export function PublicPlayerProfilePage() {
  const { slug } = useParams();

  const { data: player, isLoading } = useQuery({
    queryKey: ['public-player', slug],
    queryFn: () => fetchPublicPlayerBySlug(slug!),
    enabled: Boolean(slug),
  });

  const { data: memberships = [] } = useQuery({
    queryKey: ['public-player-memberships', player?.id],
    queryFn: () => fetchPublicPlayerMemberships(player!.id),
    enabled: Boolean(player?.id),
  });

  const { data: participation = [] } = useQuery({
    queryKey: ['public-player-participation', player?.id],
    queryFn: () => fetchPublicPlayerParticipation(player!.id),
    enabled: Boolean(player?.id),
  });

  if (isLoading) {
    return <Skeleton className="h-60" />;
  }
  if (!player) {
    return (
      <Card>
        <CardContent className="py-14 text-center">
          <p className="font-medium">Bowler not found.</p>
        </CardContent>
      </Card>
    );
  }

  // -------- aggregate lifetime stats --------
  const allGames: Array<GameRow & { eventName: string; eventSlug: string }> = [];
  let highSeries = 0;
  const eventRows: Array<{
    eventId: string;
    eventName: string;
    eventSlug: string;
    type: string;
    startDate: string;
    gamesPlayed: number;
    highGame: number;
    scratchSeries: number;
    average: number | null;
  }> = [];

  for (const p of participation) {
    const scores = p.games
      .map((g) => g.total_score)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const series = scores.reduce((s, v) => s + v, 0);
    if (series > highSeries) highSeries = series;
    eventRows.push({
      eventId: p.event.id,
      eventName: p.event.name,
      eventSlug: p.event.public_slug,
      type: p.event.type,
      startDate: p.event.start_date,
      gamesPlayed: scores.length,
      highGame: scores.length ? Math.max(...scores) : 0,
      scratchSeries: series,
      average: scores.length ? series / scores.length : null,
    });
    for (const g of p.games) {
      if (typeof g.total_score === 'number' && g.total_score > 0) {
        allGames.push({ ...g, eventName: p.event.name, eventSlug: p.event.public_slug });
      }
    }
  }

  const lifetimeGames = allGames.length;
  const lifetimePins = allGames.reduce((s, g) => s + (g.total_score ?? 0), 0);
  const highGame = allGames.length > 0 ? Math.max(...allGames.map((g) => g.total_score ?? 0)) : 0;
  const overallAverage = lifetimeGames > 0 ? lifetimePins / lifetimeGames : null;

  // -------- progression chart data (chronological) --------
  const chronological = [...allGames].sort(
    (a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
  );
  const chartData = chronological.map((g, i) => ({
    n: i + 1,
    score: g.total_score ?? 0,
  }));

  // -------- recent games --------
  const recent = [...allGames]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 10);

  // -------- sorted event history --------
  eventRows.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const initials = player.full_name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start gap-4">
        <Avatar className="h-16 w-16">
          {player.avatar_url && (
            <AvatarImage src={player.avatar_url} alt={player.full_name} />
          )}
          <AvatarFallback>{initials || 'BB'}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold">{player.full_name}</h1>
            {player.affiliation && (
              <Badge variant="outline">{player.affiliation}</Badge>
            )}
            {player.handedness && (
              <Badge variant="secondary" className="capitalize">
                {player.handedness}-handed
              </Badge>
            )}
          </div>
          {player.home_average != null && (
            <p className="text-sm text-muted-foreground mt-1">
              Home average <span className="font-semibold text-foreground">{player.home_average}</span>
            </p>
          )}
        </div>
      </header>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <StatCard label="Games" value={lifetimeGames} />
        <StatCard
          label="Average"
          value={overallAverage !== null ? overallAverage.toFixed(1) : '—'}
        />
        <StatCard label="High game" value={highGame || '—'} />
        <StatCard label="High series" value={highSeries || '—'} />
      </div>

      {memberships.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">League memberships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {memberships.map((m) => (
                <Link
                  key={m.id}
                  to={`/leagues/${m.league.public_slug}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {m.league.logo_url ? (
                      <img
                        src={m.league.logo_url}
                        alt=""
                        className="h-8 w-8 rounded border bg-card object-contain"
                      />
                    ) : (
                      <Flag className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-medium">
                        {m.league.name}
                        {m.league.acronym && (
                          <Badge variant="outline" className="ml-2">
                            {m.league.acronym}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {m.league.center_name ?? ''}
                        {m.season ? ` · ${m.season.name}` : ''}
                      </div>
                    </div>
                  </div>
                  <Badge variant={m.status === 'regular' ? 'success' : 'secondary'}>
                    {m.status === 'regular' ? 'Regular' : 'Guest'}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Game-by-game progression</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="n" className="text-xs" />
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
            <p className="text-xs text-muted-foreground mt-2">
              Every completed game across every event, in chronological order.
            </p>
          </CardContent>
        </Card>
      )}

      {eventRows.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Event history</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Games</TableHead>
                  <TableHead className="text-right">Avg</TableHead>
                  <TableHead className="text-right">High</TableHead>
                  <TableHead className="text-right">Series</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventRows.map((e) => (
                  <TableRow key={e.eventId}>
                    <TableCell className="font-medium">
                      <Link to={`/e/${e.eventSlug}`} className="hover:underline">
                        {e.eventName}
                      </Link>
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {e.type}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(e.startDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{e.gamesPlayed}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {e.average !== null ? e.average.toFixed(1) : '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {e.highGame || '—'}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {e.scratchSeries || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {recent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Medal className="h-4 w-4" /> Recent games
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((g) => (
                  <TableRow key={g.id}>
                    <TableCell>
                      <Link to={`/e/${g.eventSlug}`} className="hover:underline">
                        {g.eventName}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      Game {g.game_number}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {g.total_score ?? '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {eventRows.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            <MapPin className="h-8 w-8 mx-auto mb-2" />
            This bowler hasn't completed any games yet.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="py-4 px-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold tabular-nums mt-0.5">{value}</div>
      </CardContent>
    </Card>
  );
}
