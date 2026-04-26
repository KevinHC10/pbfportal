import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ensureGamesForEvent, updateGameTotals } from '@/lib/data/sessions';
import { errorMessage, cn } from '@/lib/utils';
import type { EventPlayerRow, EventRow, GameRow, PlayerRow } from '@/types/db';

interface Props {
  event: EventRow;
  /** Already filtered to is_playing = true */
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>;
  games: GameRow[];
}

/**
 * Fast scratch-score entry. Pick a Game column, click a row, type the score,
 * press Enter to save and jump to the next bowler in the same column.
 *
 * Writes directly to games.total_score (no frames). The per-frame editor
 * still works alongside this — entering frames there will overwrite the
 * total via re-scoring.
 */
export function QuickScoresCard({ event, eventPlayers, games }: Props) {
  const qc = useQueryClient();
  const totalGames = event.total_games;
  const [editingGame, setEditingGame] = React.useState<number | null>(null);

  // Make sure a game row exists for every (player, gameNumber) combo so the
  // grid lines up with the bowlers actually playing.
  const ensure = useMutation({
    mutationFn: () =>
      ensureGamesForEvent(
        event.id,
        eventPlayers.map((ep) => ep.id),
        totalGames,
        event.start_date
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['event-games', event.id] }),
  });
  const ranEnsure = React.useRef(false);
  React.useEffect(() => {
    if (eventPlayers.length === 0 || ranEnsure.current) return;
    ranEnsure.current = true;
    ensure.mutate();
  }, [eventPlayers.length, ensure]);

  // (event_player_id, game_number) -> game row
  const gameByKey = React.useMemo(() => {
    const m = new Map<string, GameRow>();
    for (const g of games) m.set(`${g.event_player_id}:${g.game_number}`, g);
    return m;
  }, [games]);

  const setScore = useMutation({
    mutationFn: async ({
      gameId,
      total,
    }: {
      gameId: string;
      total: number | null;
    }) => updateGameTotals(gameId, total, total !== null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-games', event.id] });
      qc.invalidateQueries({ queryKey: ['public-event-games', event.id] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  function commit(gameId: string, raw: string) {
    const trimmed = raw.trim();
    let parsed: number | null = null;
    if (trimmed !== '') {
      const n = Number(trimmed);
      if (!Number.isFinite(n) || n < 0 || n > 300) {
        toast.error('Score must be a number 0–300');
        return false;
      }
      parsed = Math.round(n);
    }
    setScore.mutate({ gameId, total: parsed });
    return true;
  }

  function focusRow(gameNumber: number, rowIdx: number) {
    const el = document.getElementById(
      `quick-${gameNumber}-${rowIdx}`
    ) as HTMLInputElement | null;
    el?.focus();
    el?.select();
  }

  if (eventPlayers.length === 0) return null;

  const seriesByEp = new Map<string, number>();
  for (const g of games) {
    if (typeof g.total_score === 'number' && g.total_score > 0) {
      seriesByEp.set(
        g.event_player_id,
        (seriesByEp.get(g.event_player_id) ?? 0) + g.total_score
      );
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between flex-wrap gap-2">
        <div>
          <CardTitle className="text-lg">Quick scores</CardTitle>
          <p className="text-xs text-muted-foreground">
            Pick a game column to edit. Enter a final score and press{' '}
            <kbd className="px-1 border rounded">Enter</kbd> to advance to the next
            bowler. Per-frame editing still works in the Scores tab.
          </p>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-muted-foreground mr-1">Edit:</span>
          {Array.from({ length: totalGames }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              size="sm"
              variant={editingGame === n ? 'default' : 'outline'}
              onClick={() => {
                const next = editingGame === n ? null : n;
                setEditingGame(next);
                if (next !== null) {
                  // focus first input next paint
                  setTimeout(() => focusRow(next, 0), 30);
                }
              }}
            >
              {editingGame === n ? <Pencil className="h-3.5 w-3.5" /> : null}
              G{n}
            </Button>
          ))}
          {editingGame !== null && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingGame(null)}
              aria-label="Stop editing"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[160px]">Bowler</TableHead>
                {Array.from({ length: totalGames }, (_, i) => (
                  <TableHead key={i} className="text-right w-20">
                    G{i + 1}
                  </TableHead>
                ))}
                <TableHead className="text-right w-24">Series</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventPlayers.map((ep, rowIdx) => {
                const series = seriesByEp.get(ep.id) ?? 0;
                return (
                  <TableRow key={ep.id}>
                    <TableCell className="font-medium">{ep.player.full_name}</TableCell>
                    {Array.from({ length: totalGames }, (_, i) => {
                      const gameNumber = i + 1;
                      const game = gameByKey.get(`${ep.id}:${gameNumber}`);
                      const isEditing = editingGame === gameNumber;
                      const score = game?.total_score ?? null;
                      if (!game) {
                        return (
                          <TableCell
                            key={i}
                            className="text-right text-muted-foreground"
                          >
                            —
                          </TableCell>
                        );
                      }
                      if (isEditing) {
                        return (
                          <TableCell key={i} className="text-right p-1">
                            <Input
                              id={`quick-${gameNumber}-${rowIdx}`}
                              key={`v-${game.id}-${score ?? 'x'}`}
                              type="number"
                              inputMode="numeric"
                              min={0}
                              max={300}
                              defaultValue={score ?? ''}
                              className="h-8 w-20 text-right"
                              onFocus={(e) => e.currentTarget.select()}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (commit(game.id, e.currentTarget.value)) {
                                    if (rowIdx + 1 < eventPlayers.length) {
                                      focusRow(gameNumber, rowIdx + 1);
                                    } else {
                                      e.currentTarget.blur();
                                    }
                                  }
                                } else if (e.key === 'Escape') {
                                  e.preventDefault();
                                  e.currentTarget.value =
                                    score === null ? '' : String(score);
                                  e.currentTarget.blur();
                                }
                              }}
                              onBlur={(e) => {
                                const cur = e.currentTarget.value.trim();
                                const prev = score === null ? '' : String(score);
                                if (cur !== prev) commit(game.id, cur);
                              }}
                            />
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={i}
                          className={cn(
                            'text-right tabular-nums',
                            score === null && 'text-muted-foreground'
                          )}
                          onClick={() => {
                            setEditingGame(gameNumber);
                            setTimeout(() => focusRow(gameNumber, rowIdx), 30);
                          }}
                          role="button"
                          tabIndex={0}
                          title="Click to edit this column"
                        >
                          {score ?? '—'}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right tabular-nums font-semibold">
                      {series || '—'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
