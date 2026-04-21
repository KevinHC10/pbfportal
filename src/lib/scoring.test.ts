import { describe, it, expect } from 'vitest';
import {
  scoreRolls,
  scoreFrames,
  emptyGame,
  maxPinsForNextRoll,
  isFrameComplete,
  formatRoll,
  ScoringError,
} from './scoring';

describe('scoreRolls — classic games', () => {
  it('gutter game = 0', () => {
    const rolls = Array.from({ length: 20 }, () => 0);
    const game = scoreRolls(rolls);
    expect(game.isComplete).toBe(true);
    expect(game.total).toBe(0);
    expect(game.frames[9].frameScore).toBe(0);
  });

  it('all 1s = 20', () => {
    const rolls = Array.from({ length: 20 }, () => 1);
    const game = scoreRolls(rolls);
    expect(game.total).toBe(20);
  });

  it('perfect game = 300', () => {
    const rolls = Array.from({ length: 12 }, () => 10);
    const game = scoreRolls(rolls);
    expect(game.isComplete).toBe(true);
    expect(game.total).toBe(300);
    expect(game.frames[0].frameScore).toBe(30);
    expect(game.frames[9].frameScore).toBe(300);
  });

  it('all spares (5/5 + 5) = 150', () => {
    const rolls: number[] = [];
    for (let i = 0; i < 10; i++) {
      rolls.push(5, 5);
    }
    rolls.push(5); // bonus roll for frame 10 spare
    const game = scoreRolls(rolls);
    expect(game.total).toBe(150);
  });

  it('turkey in middle: frame 3-5 strikes', () => {
    // frames 1-2 open 0,0; 3-5 strikes; rest zeros; no bonus needed if frame10=0,0
    const rolls = [0, 0, 0, 0, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const game = scoreRolls(rolls);
    // frame 3: 10 + 10 + 10 = 30 (run: 30)
    // frame 4: 10 + 10 + 0 = 20 (run: 50)
    // frame 5: 10 + 0 + 0 = 10 (run: 60)
    expect(game.frames[2].frameScore).toBe(30);
    expect(game.frames[3].frameScore).toBe(50);
    expect(game.frames[4].frameScore).toBe(60);
    expect(game.total).toBe(60);
  });

  it('strike then spare', () => {
    // frame 1: strike; frame 2: 7/2 (spare is 2 pins shy); rest zeros
    // frame 1: 10 + 7 + 2 = 19
    // frame 2: 7 + 2 = 9 + running 19 = 28
    const rolls = [10, 7, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    const game = scoreRolls(rolls);
    expect(game.frames[0].frameScore).toBe(19);
    expect(game.frames[1].frameScore).toBe(28);
    expect(game.total).toBe(28);
  });

  it('frame 10 strike + two strikes bonus', () => {
    // all zeros 1-9, then frame 10 = X X X = 30
    const rolls = [...Array(18).fill(0), 10, 10, 10];
    const game = scoreRolls(rolls);
    expect(game.isComplete).toBe(true);
    expect(game.total).toBe(30);
  });

  it('frame 10 spare + bonus', () => {
    const rolls = [...Array(18).fill(0), 5, 5, 7];
    const game = scoreRolls(rolls);
    expect(game.total).toBe(17);
  });

  it('frame 10 open — no bonus rolls', () => {
    const rolls = [...Array(18).fill(0), 3, 4];
    const game = scoreRolls(rolls);
    expect(game.isComplete).toBe(true);
    expect(game.total).toBe(7);
  });

  it('mixed real-world game', () => {
    // standard example: 1 5 / X 7 2 X 9 / X X X 2 3 6 / 7 5 = ?
    // Using the classic "Bowling 101" example: 1,4, 4,5, 6,4, 5,5, 10, 0,1, 7,3, 6,4, 10, 2,8,6
    // Expected: 133
    const rolls = [1, 4, 4, 5, 6, 4, 5, 5, 10, 0, 1, 7, 3, 6, 4, 10, 2, 8, 6];
    const game = scoreRolls(rolls);
    expect(game.total).toBe(133);
  });
});

describe('scoreRolls — partial games', () => {
  it('empty rolls gives empty game, not complete', () => {
    const game = scoreRolls([]);
    expect(game.isComplete).toBe(false);
    expect(game.total).toBeNull();
    expect(game.frames).toHaveLength(10);
    expect(game.frames.every((f) => f.rolls.length === 0)).toBe(true);
  });

  it('strike in frame 1 with no follow-up rolls: frame score pending', () => {
    const game = scoreRolls([10]);
    expect(game.frames[0].rolls).toEqual([10]);
    expect(game.frames[0].frameScore).toBeNull();
    expect(game.isComplete).toBe(false);
  });

  it('strike in frame 5 scores after frames 6+7 rolls exist', () => {
    const rolls = [0, 0, 0, 0, 0, 0, 0, 0, 10, 3]; // frame 5 strike, frame 6 first roll
    const game = scoreRolls(rolls);
    expect(game.frames[4].frameScore).toBeNull(); // only one bonus roll so far
    const game2 = scoreRolls([...rolls, 4]);
    // frame 5: 10+3+4 = 17
    expect(game2.frames[4].frameScore).toBe(17);
  });

  it('spare waits for one bonus roll', () => {
    const game = scoreRolls([5, 5]);
    expect(game.frames[0].frameScore).toBeNull();
    const game2 = scoreRolls([5, 5, 3]);
    expect(game2.frames[0].frameScore).toBe(13);
  });
});

describe('scoreRolls — validation', () => {
  it('rejects pin count > 10', () => {
    expect(() => scoreRolls([11])).toThrow(ScoringError);
  });

  it('rejects negative pin count', () => {
    expect(() => scoreRolls([-1])).toThrow(ScoringError);
  });

  it('rejects non-integer pin count', () => {
    expect(() => scoreRolls([3.5])).toThrow(ScoringError);
  });

  it('rejects frame where two rolls exceed 10', () => {
    expect(() => scoreRolls([6, 5])).toThrow(ScoringError);
  });

  it('rejects invalid frame-10 bonus rolls', () => {
    // strike + 5 + 6 — second bonus puts pins over 10 without prior strike
    expect(() => scoreRolls([...Array(18).fill(0), 10, 5, 6])).toThrow(ScoringError);
  });

  it('allows X X X in frame 10', () => {
    expect(() => scoreRolls([...Array(18).fill(0), 10, 10, 10])).not.toThrow();
  });

  it('allows X 10 0 in frame 10 (strike then spare)', () => {
    expect(() => scoreRolls([...Array(18).fill(0), 10, 10, 0])).not.toThrow();
  });
});

describe('maxPinsForNextRoll', () => {
  it('frame 1-9 before any roll = 10', () => {
    expect(maxPinsForNextRoll(1, [])).toBe(10);
  });
  it('frame 1 after 4 pins = 6', () => {
    expect(maxPinsForNextRoll(1, [4])).toBe(6);
  });
  it('frame 1 after strike = 0 (frame done)', () => {
    expect(maxPinsForNextRoll(1, [10])).toBe(0);
  });
  it('frame 10 after strike, strike allowed', () => {
    expect(maxPinsForNextRoll(10, [10])).toBe(10);
  });
  it('frame 10 after strike + 4, max 6', () => {
    expect(maxPinsForNextRoll(10, [10, 4])).toBe(6);
  });
  it('frame 10 after 5+5 = 10 (fresh rack)', () => {
    expect(maxPinsForNextRoll(10, [5, 5])).toBe(10);
  });
});

describe('isFrameComplete', () => {
  it('open frame 1 after 2 rolls', () => {
    expect(isFrameComplete(1, [3, 4])).toBe(true);
  });
  it('strike in frame 3', () => {
    expect(isFrameComplete(3, [10])).toBe(true);
  });
  it('frame 10 needs 3 rolls after strike', () => {
    expect(isFrameComplete(10, [10, 5])).toBe(false);
    expect(isFrameComplete(10, [10, 5, 4])).toBe(true);
  });
  it('frame 10 spare needs 3 rolls', () => {
    expect(isFrameComplete(10, [5, 5])).toBe(false);
    expect(isFrameComplete(10, [5, 5, 7])).toBe(true);
  });
  it('frame 10 open = 2 rolls enough', () => {
    expect(isFrameComplete(10, [3, 4])).toBe(true);
  });
});

describe('formatRoll', () => {
  it('strike → X', () => {
    expect(formatRoll(1, 0, [10])).toBe('X');
  });
  it('spare → /', () => {
    expect(formatRoll(1, 1, [6, 4])).toBe('/');
  });
  it('zero → -', () => {
    expect(formatRoll(1, 0, [0, 5])).toBe('-');
  });
  it('digit → digit', () => {
    expect(formatRoll(1, 0, [7, 2])).toBe('7');
  });
  it('frame 10 strikes', () => {
    expect(formatRoll(10, 2, [10, 10, 10])).toBe('X');
  });
  it('frame 10 spare third roll', () => {
    expect(formatRoll(10, 1, [5, 5, 7])).toBe('/');
  });
});

describe('scoreFrames from DB rows', () => {
  it('reconstructs a complete game from frame rows', () => {
    const rows = [
      { frame_number: 1, roll_1: 10, roll_2: null, roll_3: null },
      { frame_number: 2, roll_1: 10, roll_2: null, roll_3: null },
      { frame_number: 3, roll_1: 10, roll_2: null, roll_3: null },
      { frame_number: 4, roll_1: 10, roll_2: null, roll_3: null },
      { frame_number: 5, roll_1: 10, roll_2: null, roll_3: null },
      { frame_number: 6, roll_1: 10, roll_2: null, roll_3: null },
      { frame_number: 7, roll_1: 10, roll_2: null, roll_3: null },
      { frame_number: 8, roll_1: 10, roll_2: null, roll_3: null },
      { frame_number: 9, roll_1: 10, roll_2: null, roll_3: null },
      { frame_number: 10, roll_1: 10, roll_2: 10, roll_3: 10 },
    ];
    const game = scoreFrames(rows);
    expect(game.total).toBe(300);
    expect(game.isComplete).toBe(true);
  });
});

describe('emptyGame', () => {
  it('has 10 empty frames, no total', () => {
    const g = emptyGame();
    expect(g.frames).toHaveLength(10);
    expect(g.total).toBeNull();
    expect(g.isComplete).toBe(false);
  });
});
