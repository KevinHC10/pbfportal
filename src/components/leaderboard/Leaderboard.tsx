import * as React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  buildLeaderboard,
  sortLeaderboard,
  type LeaderboardSort,
} from '@/lib/leaderboard';
import type { EventPlayerRow, FrameRow, GameRow, PlayerRow } from '@/types/db';

interface Props {
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>;
  games: GameRow[];
  frames: FrameRow[];
}

export function Leaderboard({ eventPlayers, games, frames }: Props) {
  const [sort, setSort] = React.useState<LeaderboardSort>('scratchSeries');
  const { slug } = useParams();
  const rows = React.useMemo(
    () => sortLeaderboard(buildLeaderboard(eventPlayers, games, frames), sort),
    [eventPlayers, games, frames, sort]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="text-lg font-semibold">Standings</h2>
        <Tabs value={sort} onValueChange={(v) => setSort(v as LeaderboardSort)}>
          <TabsList>
            <TabsTrigger value="scratchSeries">Scratch</TabsTrigger>
            <TabsTrigger value="handicapSeries">Handicap</TabsTrigger>
            <TabsTrigger value="highGame">High game</TabsTrigger>
            <TabsTrigger value="average">Average</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">#</TableHead>
              <TableHead>Player</TableHead>
              <TableHead className="text-right">Games</TableHead>
              <TableHead className="text-right">Hdcp</TableHead>
              <TableHead className="text-right">Scratch</TableHead>
              <TableHead className="text-right">Handicap</TableHead>
              <TableHead className="text-right">High</TableHead>
              <TableHead className="text-right">Avg</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, idx) => (
              <TableRow key={r.eventPlayerId}>
                <TableCell className="text-muted-foreground tabular-nums">{idx + 1}</TableCell>
                <TableCell className="font-medium">
                  <Link
                    to={`/e/${slug}/players/${r.playerId}`}
                    className="hover:underline"
                  >
                    {r.playerName}
                  </Link>
                  {idx === 0 && r.gamesPlayed > 0 && (
                    <Badge variant="default" className="ml-2">
                      Lead
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right tabular-nums">{r.gamesPlayed}</TableCell>
                <TableCell className="text-right tabular-nums">{r.handicap}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {r.scratchSeries}
                </TableCell>
                <TableCell className="text-right font-semibold tabular-nums">
                  {r.handicapSeries}
                </TableCell>
                <TableCell className="text-right tabular-nums">{r.highGame}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {r.average !== null ? r.average.toFixed(1) : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
