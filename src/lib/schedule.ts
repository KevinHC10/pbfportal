import type { DayOfWeek } from '@/types/db';

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export function formatScheduleLine(
  dayOfWeek: DayOfWeek | null | undefined,
  startTimeLocal: string | null | undefined,
  timezone: string | null | undefined
): string {
  if (dayOfWeek == null) return '';
  const parts: string[] = [`${DAY_NAMES[dayOfWeek]}s`];
  if (startTimeLocal) {
    parts.push(formatTime(startTimeLocal));
  }
  if (timezone) {
    parts.push(shortTz(timezone));
  }
  return parts.join(' ');
}

function formatTime(hms: string): string {
  const [h, m] = hms.split(':').map((s) => Number(s));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hms;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m).padStart(2, '0')} ${suffix}`;
}

function shortTz(tz: string): string {
  const abbreviations: Record<string, string> = {
    'Asia/Manila': 'PHT',
    'Asia/Singapore': 'SGT',
    'Asia/Tokyo': 'JST',
    'America/Los_Angeles': 'PT',
    'America/New_York': 'ET',
    UTC: 'UTC',
  };
  return abbreviations[tz] ?? tz;
}
