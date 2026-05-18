import { describe, expect, it } from "vitest";
import { movePaddle, clamp } from "./paddle.js";
import type { Paddle } from "./types.js";

const paddle: Paddle = { x: 0, y: 100, width: 10, height: 80 };

describe("clamp", () => {
  it("returns value within bounds", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });
  it("clamps below minimum", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });
  it("clamps above maximum", () => {
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe("movePaddle", () => {
  it("moves up when up pressed", () => {
    const r = movePaddle(paddle, { up: true, down: false }, 500, 0.1, 100);
    expect(r.y).toBe(90);
  });

  it("moves down when down pressed", () => {
    const r = movePaddle(paddle, { up: false, down: true }, 500, 0.1, 100);
    expect(r.y).toBe(110);
  });

  it("does not move when no input", () => {
    const r = movePaddle(paddle, { up: false, down: false }, 500, 0.1);
    expect(r.y).toBe(paddle.y);
  });

  it("cancels when both pressed", () => {
    const r = movePaddle(paddle, { up: true, down: true }, 500, 0.1, 100);
    expect(r.y).toBe(paddle.y);
  });

  it("clamps to field top", () => {
    const r = movePaddle({ ...paddle, y: 5 }, { up: true, down: false }, 500, 1, 100);
    expect(r.y).toBe(0);
  });

  it("clamps to field bottom", () => {
    const r = movePaddle(
      { ...paddle, y: 450 },
      { up: false, down: true },
      500,
      1,
      100,
    );
    expect(r.y).toBe(500 - paddle.height);
  });
});
