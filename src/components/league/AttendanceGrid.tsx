import { Link } from 'react-router-dom';
import { Check, Minus, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type {
  AttendanceCell,
  AttendanceRow,
  SeasonAttendance,
} from '@/lib/data/attendance';

interface Props {
  data: SeasonAttendance;
}

export function AttendanceGrid({ data }: Props) {
  const { events, members, visitors } = data;

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No events in this season yet. Create at least one event to see attendance.
      </p>
    );
  }

  const completedEventCount = events.filter(
    (c) => c.status === 'active' || c.status === 'completed'
  ).length;
  const playedPerEvent = new Map<string, number>();
  for (const c of events) playedPerEvent.set(c.event.id, 0);
  const allRows = [...members, ...visitors];
  for (const row of allRows) {
    for (const c of events) {
      const cell = row.attendance[c.event.id];
      if (cell.kind === 'played') {
        playedPerEvent.set(c.event.id, (playedPerEvent.get(c.event.id) ?? 0) + 1);
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border overflow-x-auto">
        <table className="text-sm border-separate border-spacing-0">
          <thead>
            <tr>
              <th
                className="sticky left-0 z-10 bg-card border-b border-r p-2 text-left min-w-[180px]"
                rowSpan={2}
              >
                Bowler
              </th>
              <th
                className="sticky left-[180px] z-10 bg-card border-b border-r p-2 text-center w-12"
                rowSpan={2}
              >
                Status
              </th>
              {events.map((c) => (
                <th
                  key={c.event.id}
                  className="border-b p-2 text-center min-w-[80px] align-bottom"
                >
                  <div className="text-xs font-semibold">{c.event.name}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {c.event.start_date.slice(5)}
                  </div>
                  <Badge
                    variant={
                      c.status === 'active'
                        ? 'success'
                        : c.status === 'upcoming'
                          ? 'outline'
                          : 'secondary'
                    }
                    className="mt-1 text-[10px] capitalize"
                  >
                    {c.status}
                  </Badge>
                </th>
              ))}
              <th className="border-b border-l p-2 text-center w-20" rowSpan={2}>
                Attended
              </th>
            </tr>
            <tr></tr>
          </thead>
          <tbody>
            {members.length === 0 && visitors.length === 0 && (
              <tr>
                <td
                  colSpan={events.length + 3}
                  className="p-4 text-center text-muted-foreground"
                >
                  No registered members and no visitors yet.
                </td>
              </tr>
            )}
            {members.map((row) => (
              <Row key={row.player.id} row={row} eventIds={events.map((c) => c.event.id)} />
            ))}
            {visitors.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan={events.length + 3}
                    className="bg-muted/40 px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    Visitors (non-members who showed up)
                  </td>
                </tr>
                {visitors.map((row) => (
                  <Row
                    key={row.player.id}
                    row={row}
                    eventIds={events.map((c) => c.event.id)}
                    visitor
                  />
                ))}
              </>
            )}
            <tr className="bg-muted/30">
              <td className="sticky left-0 bg-muted/60 border-r p-2 font-medium" colSpan={2}>
                Showed up that week
              </td>
              {events.map((c) => (
                <td key={c.event.id} className="text-center p-2 tabular-nums font-medium">
                  {playedPerEvent.get(c.event.id) ?? 0}
                </td>
              ))}
              <td className="border-l text-center p-2 tabular-nums font-medium">
                {completedEventCount > 0 ? `× ${completedEventCount}` : '—'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">
        ✓ played · — on roster but absent · ✗ not rostered. "Attended" counts only
        events where the bowler was checked in as playing.
      </p>
    </div>
  );
}

function Row({
  row,
  eventIds,
  visitor,
}: {
  row: AttendanceRow;
  eventIds: string[];
  visitor?: boolean;
}) {
  const initials = row.player.full_name
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return (
    <tr className="hover:bg-accent/30">
      <td className="sticky left-0 bg-card border-r border-b p-2 align-middle">
        <Link
          to={`/players/${row.player.public_slug}`}
          className="flex items-center gap-2 hover:underline"
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
            {initials || 'BB'}
          </span>
          <span className="font-medium">{row.player.full_name}</span>
        </Link>
      </td>
      <td className="sticky left-[180px] bg-card border-r border-b p-2 text-center">
        {visitor ? (
          <Badge variant="outline">V</Badge>
        ) : row.status === 'regular' ? (
          <Badge variant="success">R</Badge>
        ) : (
          <Badge variant="secondary">G</Badge>
        )}
      </td>
      {eventIds.map((id) => {
        const cell = row.attendance[id];
        return (
          <td key={id} className="border-b p-2 text-center align-middle">
            <CellIcon cell={cell} />
          </td>
        );
      })}
      <td className="border-l border-b p-2 text-center font-medium tabular-nums">
        {row.attendedCount}
        <span className="text-xs text-muted-foreground">/{row.rosteredCount}</span>
      </td>
    </tr>
  );
}

function CellIcon({ cell }: { cell: AttendanceCell }) {
  if (cell.kind === 'played') {
    return (
      <span className="inline-flex flex-col items-center gap-0.5">
        <Check className="h-4 w-4 text-emerald-500" />
        {cell.gamesPlayed > 0 && (
          <span className="text-[10px] text-muted-foreground">
            {cell.gamesPlayed}g
          </span>
        )}
      </span>
    );
  }
  if (cell.kind === 'absent') {
    return <Minus className={cn('h-4 w-4 text-muted-foreground')} />;
  }
  return <X className="h-4 w-4 text-muted-foreground/40" />;
}
