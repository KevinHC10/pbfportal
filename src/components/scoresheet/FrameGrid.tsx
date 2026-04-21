import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  MAX_PINS,
  TOTAL_FRAMES,
  formatRoll,
  isFrameComplete,
  maxPinsForNextRoll,
  scoreRolls,
  type GameState,
} from '@/lib/scoring';

export interface FrameGridProps {
  rolls: number[];
  onChange: (rolls: number[]) => void;
  readOnly?: boolean;
  autoFocusFirst?: boolean;
}

export function FrameGrid({ rolls, onChange, readOnly, autoFocusFirst }: FrameGridProps) {
  const { game, scoringError } = React.useMemo(() => {
    try {
      return { game: scoreRolls(rolls), scoringError: null as string | null };
    } catch (e) {
      return {
        game: safePartialGame(rolls),
        scoringError: e instanceof Error ? e.message : 'Invalid score',
      };
    }
  }, [rolls]);

  return (
    <div>
      <div className="grid grid-cols-10 gap-px rounded-md border bg-border overflow-hidden text-sm">
        {game.frames.map((frame, idx) => (
          <FrameCell
            key={frame.frameNumber}
            frameNumber={frame.frameNumber}
            rolls={frame.rolls}
            score={frame.frameScore}
            frameRollStart={rollStartForFrame(game, idx)}
            readOnly={readOnly}
            autoFocus={autoFocusFirst && idx === 0}
            onChangeRoll={(rollIndex, value) => {
              const absolute = rollStartForFrame(game, idx) + rollIndex;
              const next = [...rolls];
              while (next.length < absolute) next.push(0);
              next[absolute] = value;
              onChange(next);
            }}
            onDeleteRoll={(rollIndex) => {
              const absolute = rollStartForFrame(game, idx) + rollIndex;
              onChange(rolls.slice(0, absolute));
            }}
          />
        ))}
      </div>
      {scoringError && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {scoringError}
        </p>
      )}
    </div>
  );
}

function rollStartForFrame(game: GameState, frameIndex: number): number {
  let start = 0;
  for (let i = 0; i < frameIndex; i++) start += game.frames[i].rolls.length;
  return start;
}

function safePartialGame(rolls: number[]): GameState {
  const frames = Array.from({ length: TOTAL_FRAMES }, (_, i) => ({
    frameNumber: i + 1,
    rolls: [] as number[],
    frameScore: null as number | null,
  }));
  let i = 0;
  let fi = 0;
  while (i < rolls.length && fi < TOTAL_FRAMES) {
    const fn = fi + 1;
    if (fn < TOTAL_FRAMES) {
      frames[fi].rolls.push(rolls[i]);
      i++;
      if (rolls[i - 1] !== MAX_PINS && i < rolls.length) {
        frames[fi].rolls.push(rolls[i]);
        i++;
      }
    } else {
      while (i < rolls.length && frames[fi].rolls.length < 3) {
        frames[fi].rolls.push(rolls[i]);
        i++;
      }
    }
    fi++;
  }
  return { frames, total: null, isComplete: false };
}

interface FrameCellProps {
  frameNumber: number;
  rolls: number[];
  score: number | null;
  frameRollStart: number;
  readOnly?: boolean;
  autoFocus?: boolean;
  onChangeRoll: (rollIndex: number, value: number) => void;
  onDeleteRoll: (rollIndex: number) => void;
}

function FrameCell({
  frameNumber,
  rolls,
  score,
  frameRollStart,
  readOnly,
  autoFocus,
  onChangeRoll,
  onDeleteRoll,
}: FrameCellProps) {
  const isTenth = frameNumber === TOTAL_FRAMES;
  const rollSlots = isTenth ? 3 : 2;

  return (
    <div className="bg-card flex flex-col min-h-[80px]">
      <div className="flex justify-end gap-px h-8 border-b">
        {Array.from({ length: rollSlots }).map((_, rollIdx) => (
          <RollInput
            key={rollIdx}
            frameNumber={frameNumber}
            rollIndex={rollIdx}
            rolls={rolls}
            absoluteIndex={frameRollStart + rollIdx}
            readOnly={readOnly}
            autoFocus={autoFocus && rollIdx === 0}
            onChange={(v) => onChangeRoll(rollIdx, v)}
            onDelete={() => onDeleteRoll(rollIdx)}
          />
        ))}
      </div>
      <div className="flex-1 flex items-center justify-center text-base font-semibold tabular-nums">
        {score !== null ? score : <span className="text-muted-foreground text-xs">—</span>}
      </div>
      <div className="text-[10px] text-muted-foreground text-center pb-0.5">
        {frameNumber}
      </div>
    </div>
  );
}

interface RollInputProps {
  frameNumber: number;
  rollIndex: number;
  rolls: number[];
  absoluteIndex: number;
  readOnly?: boolean;
  autoFocus?: boolean;
  onChange: (value: number) => void;
  onDelete: () => void;
}

const ID_PREFIX = 'roll-';

function RollInput({
  frameNumber,
  rollIndex,
  rolls,
  absoluteIndex,
  readOnly,
  autoFocus,
  onChange,
  onDelete,
}: RollInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const existingValue = rolls[rollIndex];
  const isFilled = existingValue !== undefined;
  const display = isFilled ? formatRoll(frameNumber, rollIndex, rolls) : '';
  const isFirstRollOfFrame = rollIndex === 0;
  const rollAvailable = computeRollAvailable(frameNumber, rollIndex, rolls);
  const disabled = readOnly || !rollAvailable.available;

  const focusNext = () => {
    const next = document.getElementById(
      `${ID_PREFIX}${absoluteIndex + 1}`
    ) as HTMLInputElement | null;
    next?.focus();
  };
  const focusPrev = () => {
    const prev = document.getElementById(
      `${ID_PREFIX}${absoluteIndex - 1}`
    ) as HTMLInputElement | null;
    prev?.focus();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    if (e.key === 'x' || e.key === 'X') {
      e.preventDefault();
      const max = maxPinsForNextRoll(frameNumber, rolls.slice(0, rollIndex));
      if (max === MAX_PINS) {
        onChange(MAX_PINS);
        focusNext();
      }
      return;
    }
    if (e.key === '/') {
      e.preventDefault();
      if (!isFirstRollOfFrame) {
        const prev = rolls[rollIndex - 1];
        if (prev !== undefined && prev !== MAX_PINS) {
          onChange(MAX_PINS - prev);
          focusNext();
        }
      }
      return;
    }
    if (e.key === '-' || e.key === '.') {
      e.preventDefault();
      onChange(0);
      focusNext();
      return;
    }
    if (/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const n = Number(e.key);
      const max = maxPinsForNextRoll(frameNumber, rolls.slice(0, rollIndex));
      if (n > max) return;
      onChange(n);
      const simulated = [...rolls.slice(0, rollIndex), n];
      if (isFrameComplete(frameNumber, simulated) || frameNumber === TOTAL_FRAMES) {
        focusNext();
      } else {
        focusNext();
      }
      return;
    }
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      if (isFilled) onDelete();
      else focusPrev();
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusNext();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusPrev();
      return;
    }
  };

  return (
    <input
      id={`${ID_PREFIX}${absoluteIndex}`}
      ref={inputRef}
      type="text"
      inputMode="numeric"
      value={display}
      readOnly
      onFocus={(e) => e.currentTarget.select()}
      onKeyDown={handleKey}
      disabled={disabled}
      aria-label={`Frame ${frameNumber} roll ${rollIndex + 1}${disabled ? ' (unavailable)' : ''}`}
      className={cn(
        'w-9 h-full text-center text-sm font-semibold border-l first:border-l-0 border-border outline-none focus:bg-accent focus:text-accent-foreground tabular-nums bg-transparent',
        isFilled && (display === 'X' || display === '/') && 'text-primary',
        disabled && 'bg-muted/30 text-muted-foreground cursor-not-allowed'
      )}
    />
  );
}

function computeRollAvailable(
  frameNumber: number,
  rollIndex: number,
  rolls: number[]
): { available: boolean; max: number } {
  if (frameNumber < TOTAL_FRAMES) {
    if (rollIndex === 0) return { available: true, max: MAX_PINS };
    if (rollIndex === 1) {
      if (rolls[0] === undefined) return { available: false, max: 0 };
      if (rolls[0] === MAX_PINS) return { available: false, max: 0 };
      return { available: true, max: MAX_PINS - rolls[0] };
    }
    return { available: false, max: 0 };
  }
  if (rollIndex === 0) return { available: true, max: MAX_PINS };
  if (rollIndex === 1) {
    if (rolls[0] === undefined) return { available: false, max: 0 };
    return { available: true, max: rolls[0] === MAX_PINS ? MAX_PINS : MAX_PINS - rolls[0] };
  }
  if (rolls[0] === undefined || rolls[1] === undefined) return { available: false, max: 0 };
  const r1 = rolls[0];
  const r2 = rolls[1];
  const needsBonus = r1 === MAX_PINS || r1 + r2 === MAX_PINS;
  if (!needsBonus) return { available: false, max: 0 };
  return {
    available: true,
    max: r1 === MAX_PINS && r2 !== MAX_PINS ? MAX_PINS - r2 : MAX_PINS,
  };
}
