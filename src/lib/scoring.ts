/**
 * Pure 10-pin bowling scoring logic.
 *
 * A "roll" is a pin count 0..10.
 * A "frame" holds the rolls bowled in that frame (1, 2, or 3 rolls for frame 10).
 * `frameScore` is the running total through this frame — or null if the bonus
 * rolls needed to finalize it haven't happened yet.
 *
 * All functions are pure: they take inputs and return new values. No mutation
 * of inputs. No I/O. Safe to call from React render paths.
 */

export type Roll = number;

export interface Frame {
  frameNumber: number;
  rolls: Roll[];
  frameScore: number | null;
}

export interface GameState {
  frames: Frame[];
  total: number | null;
  isComplete: boolean;
}

export const TOTAL_FRAMES = 10;
export const MAX_PINS = 10;

export class ScoringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScoringError';
  }
}

export function isStrike(frame: Frame): boolean {
  return frame.frameNumber < 10 && frame.rolls[0] === MAX_PINS;
}

export function isSpare(frame: Frame): boolean {
  if (frame.frameNumber === 10) return false;
  if (frame.rolls.length < 2) return false;
  return !isStrike(frame) && frame.rolls[0] + frame.rolls[1] === MAX_PINS;
}

/**
 * Given a flat list of rolls (in roll order), returns the resulting game state
 * with per-frame running totals.
 *
 * Throws ScoringError if the rolls violate the rules (invalid pin count,
 * second-roll pin total > 10 in a non-10th frame, etc).
 */
export function scoreRolls(rolls: Roll[]): GameState {
  rolls.forEach((r, i) => {
    if (!Number.isInteger(r) || r < 0 || r > MAX_PINS) {
      throw new ScoringError(`Roll ${i + 1} invalid: ${r}`);
    }
  });

  const frames: Frame[] = [];
  let i = 0;
  let frameNumber = 1;

  while (frameNumber <= TOTAL_FRAMES && i < rolls.length) {
    const frame: Frame = { frameNumber, rolls: [], frameScore: null };

    if (frameNumber < TOTAL_FRAMES) {
      const r1 = rolls[i];
      frame.rolls.push(r1);
      i++;
      if (r1 !== MAX_PINS) {
        if (i < rolls.length) {
          const r2 = rolls[i];
          if (r1 + r2 > MAX_PINS) {
            throw new ScoringError(
              `Frame ${frameNumber}: rolls ${r1}+${r2} exceed 10 pins`
            );
          }
          frame.rolls.push(r2);
          i++;
        }
      }
    } else {
      // 10th frame: can have up to 3 rolls
      const r1 = rolls[i];
      frame.rolls.push(r1);
      i++;
      if (i < rolls.length) {
        const r2 = rolls[i];
        if (r1 !== MAX_PINS && r1 + r2 > MAX_PINS) {
          throw new ScoringError(
            `Frame 10: first two rolls ${r1}+${r2} exceed 10 pins without a strike`
          );
        }
        if (r1 === MAX_PINS && r2 > MAX_PINS) {
          throw new ScoringError(`Frame 10: invalid second roll ${r2}`);
        }
        frame.rolls.push(r2);
        i++;
        const earnedBonus = r1 === MAX_PINS || r1 + r2 === MAX_PINS;
        if (earnedBonus && i < rolls.length) {
          const r3 = rolls[i];
          // if r1 was strike and r2 < 10, r2+r3 must not exceed 10
          if (r1 === MAX_PINS && r2 !== MAX_PINS && r2 + r3 > MAX_PINS) {
            throw new ScoringError(
              `Frame 10: bonus rolls ${r2}+${r3} exceed 10 pins`
            );
          }
          frame.rolls.push(r3);
          i++;
        }
      }
    }
    frames.push(frame);
    frameNumber++;
  }

  if (i < rolls.length) {
    throw new ScoringError(`Too many rolls: ${rolls.length - i} extra`);
  }

  // pad any frames we didn't reach with empty frames (not bowled yet)
  for (let fn = frames.length + 1; fn <= TOTAL_FRAMES; fn++) {
    frames.push({ frameNumber: fn, rolls: [], frameScore: null });
  }

  return computeRunningTotals(frames);
}

function computeRunningTotals(frames: Frame[]): GameState {
  const flat = flatRolls(frames);
  // Build a map from (frame index, roll index) back to position in flat.
  // Simpler approach: walk frames, track cursor into flat rolls.
  let cursor = 0;
  let running = 0;
  let allComplete = true;

  const scored: Frame[] = frames.map((f) => ({ ...f, rolls: [...f.rolls], frameScore: null }));

  for (let fi = 0; fi < scored.length; fi++) {
    const frame = scored[fi];
    if (frame.rolls.length === 0) {
      allComplete = false;
      continue;
    }

    if (frame.frameNumber < TOTAL_FRAMES) {
      if (frame.rolls[0] === MAX_PINS) {
        // strike — need next two rolls in flat
        const bonus1 = flat[cursor + 1];
        const bonus2 = flat[cursor + 2];
        if (bonus1 === undefined || bonus2 === undefined) {
          allComplete = false;
        } else {
          running += MAX_PINS + bonus1 + bonus2;
          frame.frameScore = running;
        }
        cursor += 1;
      } else if (frame.rolls.length === 2) {
        const sum = frame.rolls[0] + frame.rolls[1];
        if (sum === MAX_PINS) {
          // spare — need next one roll
          const bonus1 = flat[cursor + 2];
          if (bonus1 === undefined) {
            allComplete = false;
          } else {
            running += MAX_PINS + bonus1;
            frame.frameScore = running;
          }
        } else {
          running += sum;
          frame.frameScore = running;
        }
        cursor += 2;
      } else {
        // open frame, only 1 roll recorded, still bowling
        allComplete = false;
        cursor += 1;
      }
    } else {
      // Frame 10
      const r1 = frame.rolls[0];
      const r2 = frame.rolls[1];
      const r3 = frame.rolls[2];
      const needsBonus = r1 === MAX_PINS || (r1 !== undefined && r2 !== undefined && r1 + r2 === MAX_PINS);
      const finished =
        (r1 !== undefined && r2 !== undefined && !needsBonus) ||
        (needsBonus && r3 !== undefined);
      if (!finished) {
        allComplete = false;
      } else {
        running += (r1 ?? 0) + (r2 ?? 0) + (r3 ?? 0);
        frame.frameScore = running;
      }
      cursor += frame.rolls.length;
    }
  }

  return {
    frames: scored,
    total: allComplete ? running : null,
    isComplete: allComplete,
  };
}

function flatRolls(frames: Frame[]): Roll[] {
  const out: Roll[] = [];
  for (const f of frames) out.push(...f.rolls);
  return out;
}

/**
 * Build an empty game state with 10 empty frames.
 */
export function emptyGame(): GameState {
  const frames: Frame[] = [];
  for (let fn = 1; fn <= TOTAL_FRAMES; fn++) {
    frames.push({ frameNumber: fn, rolls: [], frameScore: null });
  }
  return { frames, total: null, isComplete: false };
}

/**
 * Returns the maximum pins available for the next roll in a given frame,
 * given the rolls already made. Useful for input validation.
 */
export function maxPinsForNextRoll(
  frameNumber: number,
  rollsInFrame: Roll[]
): number {
  if (frameNumber < TOTAL_FRAMES) {
    if (rollsInFrame.length === 0) return MAX_PINS;
    if (rollsInFrame.length === 1 && rollsInFrame[0] === MAX_PINS) return 0;
    return MAX_PINS - rollsInFrame[0];
  }
  // 10th
  if (rollsInFrame.length === 0) return MAX_PINS;
  if (rollsInFrame.length === 1) {
    return rollsInFrame[0] === MAX_PINS ? MAX_PINS : MAX_PINS - rollsInFrame[0];
  }
  if (rollsInFrame.length === 2) {
    const [r1, r2] = rollsInFrame;
    if (r1 === MAX_PINS && r2 === MAX_PINS) return MAX_PINS;
    if (r1 === MAX_PINS) return MAX_PINS - r2;
    if (r1 + r2 === MAX_PINS) return MAX_PINS;
  }
  return 0;
}

/**
 * True when the frame expects no further rolls (given the rolls it has).
 */
export function isFrameComplete(frameNumber: number, rollsInFrame: Roll[]): boolean {
  if (frameNumber < TOTAL_FRAMES) {
    if (rollsInFrame.length === 0) return false;
    if (rollsInFrame[0] === MAX_PINS) return true;
    return rollsInFrame.length === 2;
  }
  if (rollsInFrame.length < 2) return false;
  const [r1, r2] = rollsInFrame;
  const needsBonus = r1 === MAX_PINS || r1 + r2 === MAX_PINS;
  if (!needsBonus) return true;
  return rollsInFrame.length === 3;
}

/**
 * Convert a raw array-of-frames (e.g. from the database) into rolls, then
 * re-score. Useful for rebuilding state from persisted rows.
 */
export function scoreFrames(
  framesFromDb: Array<{
    frame_number: number;
    roll_1: number | null;
    roll_2: number | null;
    roll_3: number | null;
  }>
): GameState {
  const sorted = [...framesFromDb].sort((a, b) => a.frame_number - b.frame_number);
  const rolls: Roll[] = [];
  for (const f of sorted) {
    if (f.roll_1 !== null && f.roll_1 !== undefined) rolls.push(f.roll_1);
    if (f.roll_2 !== null && f.roll_2 !== undefined) rolls.push(f.roll_2);
    if (f.roll_3 !== null && f.roll_3 !== undefined) rolls.push(f.roll_3);
  }
  return scoreRolls(rolls);
}

/**
 * Format a single roll for scoresheet display ("X" for strike, "/" for spare,
 * "-" for zero, otherwise digit). Needs the previous roll to detect spares.
 */
export function formatRoll(
  frameNumber: number,
  rollIndex: number,
  rolls: Roll[]
): string {
  const v = rolls[rollIndex];
  if (v === undefined || v === null) return '';
  if (frameNumber < TOTAL_FRAMES) {
    if (rollIndex === 0 && v === MAX_PINS) return 'X';
    if (rollIndex === 1 && rolls[0] + v === MAX_PINS) return '/';
    if (v === 0) return '-';
    return String(v);
  }
  if (v === MAX_PINS) return 'X';
  if (rollIndex > 0 && rolls[rollIndex - 1] !== MAX_PINS && rolls[rollIndex - 1] + v === MAX_PINS) {
    return '/';
  }
  if (v === 0) return '-';
  return String(v);
}
