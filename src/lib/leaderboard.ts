import type { EventPlayerRow, FrameRow, GameRow, PlayerRow } from '@/types/db';

// ------------------------------------------------------------------
// Event-level aggregate leaderboard (used on the public event page)
// ------------------------------------------------------------------

export interface LeaderboardRow {
  eventPlayerId: string;
  playerId: string;
  playerName: string;
  affiliation: string | null;
  handicap: number;
  laneNumber: number | null;
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
      affiliation: ep.player.affiliation ?? null,
      handicap: ep.handicap,
      laneNumber: ep.lane_number ?? null,
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

// ------------------------------------------------------------------
// Session-scoped leaderboard (used by both admin + public session pages).
//
// Columns: #  Name  Affiliation  Avg  HDCP  G1…GN  Total Scratch  Total w/ HDCP  Lane
// ------------------------------------------------------------------

export interface SessionLeaderboardRow {
  eventPlayerId: string;
  playerId: string;
  playerName: string;
  affiliation: string | null;
  average: number | null;     // running average across the whole event so far
  handicap: number;            // stored event_players.handicap
  laneNumber: number | null;
  gameScores: Array<{ gameNumber: number; score: number | null; isComplete: boolean; gameId: string }>;
  gamesPlayed: number;
  totalScratch: number;
  totalWithHdcp: number;
}

export function buildSessionLeaderboard({
  eventPlayers,
  allEventGames,
  sessionGames,
  totalGames,
}: {
  eventPlayers: Array<EventPlayerRow & { player: PlayerRow }>;
  /** every game across every session in the event — used for the Avg column */
  allEventGames: GameRow[];
  /** games scoped to the current session */
  sessionGames: GameRow[];
  /** total games per session for this event */
  totalGames: number;
}): SessionLeaderboardRow[] {
  const eventGamesByEp = new Map<string, GameRow[]>();
  for (const g of allEventGames) {
    const arr = eventGamesByEp.get(g.event_player_id) ?? [];
    arr.push(g);
    eventGamesByEp.set(g.event_player_id, arr);
  }
  const sessionGamesByEp = new Map<string, GameRow[]>();
  for (const g of sessionGames) {
    const arr = sessionGamesByEp.get(g.event_player_id) ?? [];
    arr.push(g);
    sessionGamesByEp.set(g.event_player_id, arr);
  }

  return eventPlayers.map((ep) => {
    const evAll = eventGamesByEp.get(ep.id) ?? [];
    const evScores = evAll
      .map((g) => g.total_score)
      .filter((v): v is number => typeof v === 'number' && v > 0);
    const runningAverage =
      evScores.length > 0 ? evScores.reduce((s, v) => s + v, 0) / evScores.length : ep.player.home_average;

    const inSession = (sessionGamesByEp.get(ep.id) ?? []).sort(
      (a, b) => a.game_number - b.game_number
    );

    const gameScores = Array.from({ length: totalGames }, (_, i) => {
      const n = i + 1;
      const match = inSession.find((g) => g.game_number === n);
      return {
        gameNumber: n,
        gameId: match?.id ?? '',
        score: match?.total_score ?? null,
        isComplete: match?.is_complete ?? false,
      };
    });

    const scratchScores = gameScores
      .map((g) => g.score)
      .filter((v): v is number => typeof v === 'number');
    const totalScratch = scratchScores.reduce((s, v) => s + v, 0);
    const gamesPlayed = scratchScores.length;
    const totalWithHdcp = totalScratch + ep.handicap * gamesPlayed;

    return {
      eventPlayerId: ep.id,
      playerId: ep.player_id,
      playerName: ep.player.full_name,
      affiliation: ep.player.affiliation ?? null,
      average: runningAverage ?? null,
      handicap: ep.handicap,
      laneNumber: ep.lane_number ?? null,
      gameScores,
      gamesPlayed,
      totalScratch,
      totalWithHdcp,
    };
  });
}

export type SessionLeaderboardSort =
  | 'totalWithHdcp'
  | 'totalScratch'
  | 'average'
  | 'name'
  | 'lane';

export function sortSessionLeaderboard(
  rows: SessionLeaderboardRow[],
  sort: SessionLeaderboardSort
): SessionLeaderboardRow[] {
  const copy = [...rows];
  copy.sort((a, b) => {
    switch (sort) {
      case 'name':
        return a.playerName.localeCompare(b.playerName);
      case 'lane':
        return (a.laneNumber ?? Number.MAX_SAFE_INTEGER) - (b.laneNumber ?? Number.MAX_SAFE_INTEGER);
      case 'average':
        return (b.average ?? -1) - (a.average ?? -1);
      case 'totalScratch':
        return b.totalScratch - a.totalScratch;
      case 'totalWithHdcp':
      default:
        return b.totalWithHdcp - a.totalWithHdcp;
    }
  });
  return copy;
}
