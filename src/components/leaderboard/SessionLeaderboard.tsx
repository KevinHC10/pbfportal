import * as React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  buildSessionLeaderboard,
  sortSessionLeaderboard,
  type SessionLeaderboardSort,
} from '@/lib/leaderboard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type {
  EventPlayerRow,
  EventRow,
  GameRow,
  PlayerRow,
  SessionRow,
} from '@/types/db';

interface Props {
  event: EventRow;
  session: SessionRow;
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>;
  allEventGames: GameRow[];
  sessionGames: GameRow[];
  /** If provided, each row becomes a button that opens the editor for that player. */
  onRowClick?: (eventPlayerId: string) => void;
  /** Link each player name to their public profile under this slug. If absent, not clickable. */
  publicSlug?: string;
}

export function SessionLeaderboard({
  event,
  session,
  eventPlayers,
  allEventGames,
  sessionGames,
  onRowClick,
  publicSlug,
}: Props) {
  const [sort, setSort] = React.useState<SessionLeaderboardSort>('totalWithHdcp');
  const rows = React.useMemo(
    () =>
      sortSessionLeaderboard(
        buildSessionLeaderboard({
          eventPlayers,
          allEventGames,
          sessionGames,
          totalGames: event.total_games,
        }),
        sort
      ),
    [eventPlayers, allEventGames, sessionGames, event.total_games, sort]
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">
            Session {session.session_number} standings
          </h2>
          <p className="text-xs text-muted-foreground">
            {onRowClick ? 'Click a row to edit a bowler’s games.' : 'Live scoresheet.'}
          </p>
        </div>
        <Tabs value={sort} onValueChange={(v) => setSort(v as SessionLeaderboardSort)}>
          <TabsList>
            <TabsTrigger value="totalWithHdcp">w/ HDCP</TabsTrigger>
            <TabsTrigger value="totalScratch">Scratch</TabsTrigger>
            <TabsTrigger value="average">Avg</TabsTrigger>
            <TabsTrigger value="lane">Lane</TabsTrigger>
            <TabsTrigger value="name">Name</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead className="min-w-[150px]">Name</TableHead>
              <TableHead className="min-w-[110px]">Affiliation</TableHead>
              <TableHead className="text-right w-16">Avg</TableHead>
              <TableHead className="text-right w-16">HDCP</TableHead>
              {Array.from({ length: event.total_games }, (_, i) => (
                <TableHead key={i} className="text-right w-14">
                  G{i + 1}
                </TableHead>
              ))}
              <TableHead className="text-right w-20">Scratch</TableHead>
              <TableHead className="text-right w-20">w/ HDCP</TableHead>
              <TableHead className="text-right w-14">Lane</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => {
              const interactive = Boolean(onRowClick);
              return (
                <TableRow
                  key={r.eventPlayerId}
                  className={cn(
                    interactive && 'cursor-pointer hover:bg-accent/60',
                    'align-middle'
                  )}
                  onClick={interactive ? () => onRowClick?.(r.eventPlayerId) : undefined}
                >
                  <TableCell className="text-muted-foreground tabular-nums">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="font-medium">
                    {publicSlug ? (
                      <Link
                        to={`/e/${publicSlug}/players/${r.playerId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {r.playerName}
                      </Link>
                    ) : (
                      r.playerName
                    )}
                    {idx === 0 && r.gamesPlayed > 0 && (
                      <Badge variant="default" className="ml-2">
                        Lead
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.affiliation ?? '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {r.average !== null ? r.average.toFixed(1) : '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{r.handicap}</TableCell>
                  {r.gameScores.map((g) => (
                    <TableCell
                      key={g.gameNumber}
                      className="text-right tabular-nums"
                    >
                      {g.score !== null ? g.score : <span className="text-muted-foreground">—</span>}
                    </TableCell>
                  ))}
                  <TableCell className="text-right tabular-nums font-semibold">
                    {r.totalScratch || '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {r.totalWithHdcp || '—'}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">
                    {r.laneNumber ?? '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
