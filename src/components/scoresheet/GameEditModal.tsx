import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { FrameGrid } from '@/components/scoresheet/FrameGrid';
import { saveGameRolls } from '@/lib/data/sessions';
import { errorMessage } from '@/lib/utils';
import type {
  EventPlayerRow,
  EventRow,
  FrameRow,
  GameRow,
  PlayerRow,
  SessionRow,
} from '@/types/db';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventRow;
  session: SessionRow;
  eventPlayer: (EventPlayerRow & { player: PlayerRow }) | null;
  /** Games for this bowler in this session, any order. */
  games: GameRow[];
  /** Frames for those games, any order. */
  frames: FrameRow[];
}

export function GameEditModal({
  open,
  onOpenChange,
  event,
  session,
  eventPlayer,
  games,
  frames,
}: Props) {
  const qc = useQueryClient();

  const persist = useMutation({
    mutationFn: async ({ gameId, rolls }: { gameId: string; rolls: number[] }) => {
      const gameFrames = frames.filter((f) => f.game_id === gameId);
      await saveGameRolls(gameId, rolls, gameFrames);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['session-games', session.id] });
      qc.invalidateQueries({ queryKey: ['session-frames', session.id] });
      qc.invalidateQueries({ queryKey: ['event-all-games', event.id] });
      qc.invalidateQueries({ queryKey: ['public-event-games', event.id] });
      qc.invalidateQueries({ queryKey: ['public-event-frames', event.id] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (!eventPlayer) return null;

  const bowlerGames = [...games]
    .filter((g) => g.event_player_id === eventPlayer.id)
    .sort((a, b) => a.game_number - b.game_number);

  const rollsByGame = new Map<string, number[]>();
  for (const g of bowlerGames) {
    const fs = frames
      .filter((f) => f.game_id === g.id)
      .sort((a, b) => a.frame_number - b.frame_number);
    const rolls: number[] = [];
    for (const f of fs) {
      if (f.roll_1 !== null) rolls.push(f.roll_1);
      if (f.roll_2 !== null) rolls.push(f.roll_2);
      if (f.roll_3 !== null) rolls.push(f.roll_3);
    }
    rollsByGame.set(g.id, rolls);
  }

  const series = bowlerGames.reduce((s, g) => s + (g.total_score ?? 0), 0);
  const hdcpSeries = series + eventPlayer.handicap * bowlerGames.filter((g) => g.is_complete).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <DialogTitle>{eventPlayer.player.full_name}</DialogTitle>
              <DialogDescription className="mt-1 flex flex-wrap items-center gap-2">
                <span>Session {session.session_number}</span>
                {eventPlayer.player.affiliation && (
                  <Badge variant="outline">{eventPlayer.player.affiliation}</Badge>
                )}
                <Badge variant="secondary">HDCP {eventPlayer.handicap}</Badge>
                {eventPlayer.lane_number != null && (
                  <Badge variant="outline">Lane {eventPlayer.lane_number}</Badge>
                )}
                <span className="ml-auto text-xs">
                  Series{' '}
                  <span className="font-semibold text-foreground">{series || '—'}</span>
                  {series > 0 && (
                    <>
                      {' '}
                      / w/ HDCP{' '}
                      <span className="font-semibold text-foreground">{hdcpSeries}</span>
                    </>
                  )}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {bowlerGames.map((g) => {
            const rolls = rollsByGame.get(g.id) ?? [];
            return (
              <div key={g.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Game {g.game_number}</span>
                  <div className="flex items-center gap-2">
                    {g.is_complete && <Badge variant="success">Complete</Badge>}
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
                  onChange={(next) => persist.mutate({ gameId: g.id, rolls: next })}
                />
              </div>
            );
          })}
        </div>

        <p className="text-xs text-muted-foreground pt-2">
          Tip: type digits, <kbd className="px-1 border rounded">X</kbd> for strike,{' '}
          <kbd className="px-1 border rounded">/</kbd> for spare,{' '}
          <kbd className="px-1 border rounded">-</kbd> for zero. Backspace clears the
          current roll. Changes save automatically.
        </p>
      </DialogContent>
    </Dialog>
  );
}
