/**
 * League handicap computation.
 *
 *   handicap = clamp( floor( (base - average) * factor ), min, max )
 *
 * Example: base=190, factor=0.8, min=0, max=80, average=160
 *   → floor((190-160)*0.8) = 24  → 24 (within [0..80])
 *
 * If the average is null / not yet established, returns 0 so the bowler
 * isn't handed a large bonus before playing.
 */

export interface HandicapFormula {
  base: number;
  factor: number;
  min: number;
  max: number;
}

export function computeHandicap(
  formula: HandicapFormula,
  average: number | null | undefined
): number {
  if (average === null || average === undefined || !Number.isFinite(average) || average <= 0) {
    return 0;
  }
  const raw = Math.floor((formula.base - average) * formula.factor);
  return Math.max(formula.min, Math.min(formula.max, raw));
}

export const DEFAULT_HANDICAP_FORMULA: HandicapFormula = {
  base: 200,
  factor: 0.8,
  min: 0,
  max: 80,
};
