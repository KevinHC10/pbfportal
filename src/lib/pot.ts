/**
 * Pot-game handicap math.
 *
 * Pot games (singles and doubles) are side competitions that reuse the
 * event's existing game scores. They apply their own handicap formula that
 * is independent of the league handicap — the point of the pot is usually
 * to flatten the field among everyone who bought in.
 *
 * Three formula shapes are supported:
 *
 *   top_anchored      Top averager in the pot gets HDCP 0.
 *                     HDCP = clamp(floor((top_avg − bowler_avg) × factor), min, max)
 *
 *   ceiling_anchored  Admin-set ceiling (e.g. 220). Anyone above it caps at
 *                     min (usually 0). Below it scales by factor.
 *                     HDCP = clamp(floor((ceiling − bowler_avg) × factor), min, max)
 *
 *   scratch           Everyone bowls clean. HDCP = 0.
 *
 * All functions here are pure.
 */

import type { PotFormulaKind } from '@/types/db';

export interface PotFormula {
  kind: PotFormulaKind;
  factor: number;
  min: number;
  max: number;
  /** Only used when kind === 'ceiling_anchored'. */
  ceiling?: number | null;
}

export function computePotHandicap(
  formula: PotFormula,
  topAverage: number,
  bowlerAverage: number | null | undefined
): number {
  if (formula.kind === 'scratch') return 0;
  if (bowlerAverage == null || !Number.isFinite(bowlerAverage)) {
    // No baseline established → grant max so the bowler isn't punished.
    return formula.max;
  }
  let raw: number;
  if (formula.kind === 'ceiling_anchored') {
    const ceiling = formula.ceiling ?? 220;
    raw = Math.floor((ceiling - bowlerAverage) * formula.factor);
  } else {
    // top_anchored
    raw = Math.floor((topAverage - bowlerAverage) * formula.factor);
  }
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
    const needsTop = formula.kind === 'top_anchored';
    const hdcp =
      needsTop && top === 0 ? 0 : computePotHandicap(formula, top, e.average);
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
  kind: 'top_anchored',
  factor: 1.0,
  min: 0,
  max: 100,
  ceiling: 220,
};

export const POT_FORMULA_LABELS: Record<PotFormulaKind, string> = {
  top_anchored: 'Top-anchored',
  ceiling_anchored: 'Ceiling-anchored',
  scratch: 'Scratch (no HDCP)',
};

export function describePotFormula(formula: PotFormula): string {
  switch (formula.kind) {
    case 'scratch':
      return 'Scratch — no handicap applied.';
    case 'ceiling_anchored':
      return `floor((${formula.ceiling ?? 220} − avg) × ${formula.factor}), clamped to [${formula.min}, ${formula.max}].`;
    case 'top_anchored':
    default:
      return `Top averager = HDCP 0. Others: floor((top − avg) × ${formula.factor}), clamped to [${formula.min}, ${formula.max}].`;
  }
}
