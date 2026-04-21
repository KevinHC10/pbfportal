import type { EventPlayerRow, FrameRow, GameRow, PlayerRow } from '@/types/db';

export interface LeaderboardRow {
  eventPlayerId: string;
  playerId: string;
  playerName: string;
  handicap: number;
  gamesPlayed: number;
  scratchSeries: number;
  handicapSeries: number;
  highGame: number;
  average: number | null;
  perGame: Array<{ gameNumber: number; score: number | null; isComplete: boolean }>;
}

export function buildLeaderboard(
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>,
  games: GameRow[],
  _frames: FrameRow[]
): LeaderboardRow[] {
  const gamesByEp = new Map<string, GameRow[]>();
  for (const g of games) {
    const arr = gamesByEp.get(g.event_player_id) ?? [];
    arr.push(g);
    gamesByEp.set(g.event_player_id, arr);
  }

  return eventPlayers.map((ep) => {
    const playerGames = (gamesByEp.get(ep.id) ?? []).sort(
      (a, b) => a.game_number - b.game_number
    );
    const scores = playerGames
      .map((g) => g.total_score)
      .filter((v): v is number => typeof v === 'number');
    const scratchSeries = scores.reduce((s, v) => s + v, 0);
    const highGame = scores.length ? Math.max(...scores) : 0;
    const average = scores.length ? scratchSeries / scores.length : null;
    const handicapSeries = scratchSeries + ep.handicap * scores.length;
    return {
      eventPlayerId: ep.id,
      playerId: ep.player_id,
      playerName: ep.player.full_name,
      handicap: ep.handicap,
      gamesPlayed: scores.length,
      scratchSeries,
      handicapSeries,
      highGame,
      average,
      perGame: playerGames.map((g) => ({
        gameNumber: g.game_number,
        score: g.total_score,
        isComplete: g.is_complete,
      })),
    };
  });
}

export type LeaderboardSort =
  | 'scratchSeries'
  | 'handicapSeries'
  | 'highGame'
  | 'average'
  | 'name';

export function sortLeaderboard(
  rows: LeaderboardRow[],
  sort: LeaderboardSort
): LeaderboardRow[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (sort) {
      case 'name':
        return a.playerName.localeCompare(b.playerName);
      case 'average':
        return (b.average ?? -1) - (a.average ?? -1);
      case 'highGame':
        return b.highGame - a.highGame;
      case 'handicapSeries':
        return b.handicapSeries - a.handicapSeries;
      case 'scratchSeries':
      default:
        return b.scratchSeries - a.scratchSeries;
    }
  });
  return copy;
}
