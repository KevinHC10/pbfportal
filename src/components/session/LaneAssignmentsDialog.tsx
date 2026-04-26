import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MapPinned } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { bulkSetEventLanes } from '@/lib/data/lanes';
import type {
  EventLaneAssignmentRow,
  EventPlayerRow,
  PlayerRow,
} from '@/types/db';
import { errorMessage } from '@/lib/utils';

interface Props {
  eventId: string;
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>;
  assignments: EventLaneAssignmentRow[];
}

export function LaneAssignmentsDialog({ eventId, eventPlayers, assignments }: Props) {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (!open) return;
    const next: Record<string, string> = {};
    for (const ep of eventPlayers) {
      const override = assignments.find((a) => a.event_player_id === ep.id);
      next[ep.id] = override?.lane_number != null ? String(override.lane_number) : '';
    }
    setDraft(next);
  }, [open, eventPlayers, assignments]);

  const save = useMutation({
    mutationFn: async () => {
      const payload = eventPlayers.map((ep) => {
        const raw = (draft[ep.id] ?? '').trim();
        return {
          event_player_id: ep.id,
          lane_number: raw === '' ? null : Number(raw),
        };
      });
      await bulkSetEventLanes(eventId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['event-lanes', eventId] });
      toast.success('Lane assignments saved');
      setOpen(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <MapPinned className="h-4 w-4" /> Assign lanes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[95vw]">
        <DialogHeader>
          <DialogTitle>Lane assignments</DialogTitle>
          <DialogDescription>
            Per-event override of the bowler's default lane. Leave a field
            blank to fall back to the roster default.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[50vh] overflow-y-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bowler</TableHead>
                <TableHead className="w-24">Default</TableHead>
                <TableHead className="w-28">This event</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eventPlayers.map((ep) => (
                <TableRow key={ep.id}>
                  <TableCell className="font-medium">{ep.player.full_name}</TableCell>
                  <TableCell className="text-muted-foreground tabular-nums">
                    {ep.lane_number ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      className="h-8"
                      value={draft[ep.id] ?? ''}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, [ep.id]: e.target.value }))
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <DialogFooter>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
