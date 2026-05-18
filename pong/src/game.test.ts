import { describe, expect, it } from "vitest";
import { createInitialState, startGame, tick } from "./game.js";
import type { FrameInput } from "./types.js";
import { WINNING_SCORE } from "./constants.js";

const NO_INPUT: FrameInput = {
  left: { up: false, down: false },
  right: { up: false, down: false },
};

describe("createInitialState", () => {
  it("creates idle state with zero scores", () => {
    const s = createInitialState();
    expect(s.status).toBe("idle");
    expect(s.scoreLeft).toBe(0);
    expect(s.scoreRight).toBe(0);
    expect(s.winner).toBeNull();
  });
});

describe("startGame", () => {
  it("transitions to running and resets scores", () => {
    let s = createInitialState();
    s = { ...s, scoreLeft: 5, scoreRight: 3 };
    const r = startGame(s);
    expect(r.status).toBe("running");
    expect(r.scoreLeft).toBe(0);
    expect(r.scoreRight).toBe(0);
  });
});

describe("tick", () => {
  it("no-op when idle", () => {
    const s = createInitialState();
    const r = tick(s, NO_INPUT, 0.016);
    expect(r).toBe(s);
  });

  it("no-op when gameover", () => {
    const s = { ...createInitialState(), status: "gameover" as const };
    const r = tick(s, NO_INPUT, 0.016);
    expect(r).toBe(s);
  });

  it("transitions to gameover when winning score reached", () => {
    let s = startGame(createInitialState());
    s = { ...s, scoreLeft: WINNING_SCORE - 1 };
    // Force ball off right edge to score for left.
    s = {
      ...s,
      ball: { ...s.ball, x: s.field.width + 5, vx: 500 },
    };
    const r = tick(s, NO_INPUT, 0.001);
    expect(r.scoreLeft).toBe(WINNING_SCORE);
    expect(r.status).toBe("gameover");
    expect(r.winner).toBe("left");
  });
});
