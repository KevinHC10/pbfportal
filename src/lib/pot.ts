/**
 * Pot-game handicap math.
 *
 * Pot games (singles and doubles) are side competitions that reuse the
 * session's existing game scores. They apply their own handicap formula that
 * is DIFFERENT from the league/event handicap — the point of the pot is to
 * flatten the field among everyone who bought in.
 *
 * Singles:
 *   The highest averaging bowler in the pot has HDCP 0.
 *   Everyone else's HDCP = clamp((top_avg - bowler_avg) * factor, min, max)
 *
 * Doubles:
 *   Admin pairs bowlers (high with low typically). Each entry has a partner.
 *   Each individual's pot HDCP is computed with the singles formula using
 *   the pot's entrant pool as the average basis. Team pot HDCP = sum of
 *   the two partner HDCPs.
 *
 * All functions here are pure.
 */

export interface PotFormula {
  factor: number;
  min: number;
  max: number;
}

export function computePotHandicap(
  formula: PotFormula,
  topAverage: number,
  bowlerAverage: number | null | undefined
): number {
  if (bowlerAverage == null || !Number.isFinite(bowlerAverage)) return formula.max;
  const raw = Math.floor((topAverage - bowlerAverage) * formula.factor);
  return Math.max(formula.min, Math.min(formula.max, raw));
}

export interface SinglesPotRow {
  eventPlayerId: string;
  name: string;
  average: number | null;
  potHandicap: number;
  scratchScore: number | null;
  finalScore: number | null;
}

export function buildSinglesPot({
  entries,
  formula,
}: {
  entries: Array<{
    eventPlayerId: string;
    name: string;
    average: number | null;
    scratchScore: number | null;
  }>;
  formula: PotFormula;
}): SinglesPotRow[] {
  const avgs = entries
    .map((e) => e.average)
    .filter((v): v is number => typeof v === 'number' && v > 0);
  const top = avgs.length > 0 ? Math.max(...avgs) : 0;
  return entries.map((e) => {
    const hdcp = top > 0 ? computePotHandicap(formula, top, e.average) : 0;
    return {
      eventPlayerId: e.eventPlayerId,
      name: e.name,
      average: e.average,
      potHandicap: hdcp,
      scratchScore: e.scratchScore,
      finalScore: e.scratchScore === null ? null : e.scratchScore + hdcp,
    };
  });
}

export interface DoublesPotRow {
  pairKey: string;
  a: SinglesPotRow;
  b: SinglesPotRow;
  teamScratch: number | null;
  teamHandicap: number;
  teamFinal: number | null;
}

/**
 * Given singles rows (already computed) and a list of pair assignments
 * (a, b event_player_ids), returns the team-level totals.
 */
export function buildDoublesPot({
  singles,
  pairs,
}: {
  singles: SinglesPotRow[];
  pairs: Array<{ a: string; b: string }>;
}): DoublesPotRow[] {
  const byId = new Map(singles.map((s) => [s.eventPlayerId, s]));
  const out: DoublesPotRow[] = [];
  for (const p of pairs) {
    const a = byId.get(p.a);
    const b = byId.get(p.b);
    if (!a || !b) continue;
    const teamScratch =
      a.scratchScore !== null && b.scratchScore !== null
        ? a.scratchScore + b.scratchScore
        : null;
    const teamHandicap = a.potHandicap + b.potHandicap;
    out.push({
      pairKey: [p.a, p.b].sort().join(':'),
      a,
      b,
      teamScratch,
      teamHandicap,
      teamFinal: teamScratch === null ? null : teamScratch + teamHandicap,
    });
  }
  return out;
}

/**
 * Suggest doubles pairs from a list of entrants sorted by average, pairing
 * strongest with weakest. Admin-facing helper — final pairing is still their
 * call, they can override by editing the pairs.
 */
export function suggestDoublesPairs<T extends { eventPlayerId: string; average: number | null }>(
  entrants: T[]
): Array<{ a: string; b: string }> {
  const sorted = [...entrants].sort(
    (x, y) => (y.average ?? 0) - (x.average ?? 0)
  );
  const pairs: Array<{ a: string; b: string }> = [];
  let i = 0;
  let j = sorted.length - 1;
  while (i < j) {
    pairs.push({ a: sorted[i].eventPlayerId, b: sorted[j].eventPlayerId });
    i++;
    j--;
  }
  return pairs;
}

export const DEFAULT_POT_FORMULA: PotFormula = {
  factor: 1.0,
  min: 0,
  max: 100,
};
