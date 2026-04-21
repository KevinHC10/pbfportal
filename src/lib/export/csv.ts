import { buildLeaderboard, sortLeaderboard } from '@/lib/leaderboard';
import type { EventPlayerRow, EventRow, GameRow, PlayerRow } from '@/types/db';

function escapeCell(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Array<Array<string | number | null>>): string {
  return rows.map((row) => row.map(escapeCell).join(',')).join('\n') + '\n';
}

export function downloadStandingsCsv(
  event: EventRow,
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>,
  games: GameRow[]
) {
  const rows = sortLeaderboard(buildLeaderboard(eventPlayers, games, []), 'scratchSeries');
  const gameCount = Math.max(1, ...rows.map((r) => r.perGame.length));
  const header: string[] = [
    'Rank',
    'Player',
    'Handicap',
    'Games played',
    ...Array.from({ length: gameCount }, (_, i) => `Game ${i + 1}`),
    'Scratch series',
    'Handicap series',
    'High game',
    'Average',
  ];
  const body = rows.map((r, i) => {
    const gs = Array.from({ length: gameCount }, (_, gi) => {
      const g = r.perGame.find((x) => x.gameNumber === gi + 1);
      return g?.score ?? '';
    });
    return [
      i + 1,
      r.playerName,
      r.handicap,
      r.gamesPlayed,
      ...gs,
      r.scratchSeries,
      r.handicapSeries,
      r.highGame,
      r.average !== null ? r.average.toFixed(1) : '',
    ];
  });
  const csv = toCsv([header, ...body]);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, `${slugify(event.name)}-standings.csv`);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'standings';
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
