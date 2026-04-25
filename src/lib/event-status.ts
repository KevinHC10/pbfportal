import type { EventRow, EventStatus } from '@/types/db';

/**
 * Derive an event's status from its date + start time, falling back to the
 * stored `status` column when timing data isn't usable.
 *
 *   upcoming  → now() < start moment
 *   active    → start moment ≤ now() ≤ end moment
 *   completed → now() > end moment
 *
 * The "end moment" is, in order of preference:
 *   1. end_date at 23:59:59 local
 *   2. start moment + 6 hours (if start_time is set, single-day event)
 *   3. start_date at 23:59:59 local (date-only event, ends that day)
 *
 * Times here are local to the user's browser. If the league spans
 * multiple timezones, this will be approximate. We keep it simple for now
 * and revisit when a multi-timezone use case shows up.
 */
export function computeEventStatus(
  event: Pick<EventRow, 'start_date' | 'start_time' | 'end_date' | 'status'>,
  now: Date = new Date()
): EventStatus {
  const startAt = parseLocal(event.start_date, event.start_time ?? '00:00:00');
  if (!startAt) return event.status;

  let endAt: Date;
  if (event.end_date) {
    const e = parseLocal(event.end_date, '23:59:59');
    endAt = e ?? new Date(startAt.getTime() + 6 * 60 * 60 * 1000);
  } else if (event.start_time) {
    endAt = new Date(startAt.getTime() + 6 * 60 * 60 * 1000);
  } else {
    const e = parseLocal(event.start_date, '23:59:59');
    endAt = e ?? new Date(startAt.getTime() + 24 * 60 * 60 * 1000);
  }

  if (now < startAt) return 'upcoming';
  if (now <= endAt) return 'active';
  return 'completed';
}

function parseLocal(date: string, time: string): Date | null {
  // Browsers parse "YYYY-MM-DDTHH:MM:SS" as local time (no Z, no offset).
  const t = time.length === 5 ? `${time}:00` : time;
  const d = new Date(`${date}T${t}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatStartMoment(
  event: Pick<EventRow, 'start_date' | 'start_time'>
): string {
  if (!event.start_time) return event.start_date;
  const [h, m] = event.start_time.split(':').map(Number);
  if (!Number.isFinite(h)) return event.start_date;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${event.start_date} ${hh}:${String(m).padStart(2, '0')} ${suffix}`;
}
