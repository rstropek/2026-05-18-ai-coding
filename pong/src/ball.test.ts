import { describe, expect, it } from "vitest";
import { createBall, stepBall } from "./ball.js";
import type { Ball, Paddle } from "./types.js";

const FW = 800;
const FH = 500;

const leftPaddle: Paddle = { x: 20, y: 200, width: 12, height: 100 };
const rightPaddle: Paddle = { x: 768, y: 200, width: 12, height: 100 };

function makeBall(over: Partial<Ball> = {}): Ball {
  return { x: 400, y: 250, size: 10, vx: 100, vy: 0, speed: 100, ...over };
}

describe("createBall", () => {
  it("centers ball on field", () => {
    const b = createBall(FW, FH, 10, 1, 200);
    expect(b.x).toBe(FW / 2 - 5);
    expect(b.y).toBe(FH / 2 - 5);
    expect(b.size).toBe(10);
    expect(b.speed).toBe(200);
  });

  it("uses direction sign for vx", () => {
    const b = createBall(FW, FH, 10, -1, 200);
    expect(b.vx).toBeLessThan(0);
  });
});

describe("stepBall", () => {
  it("moves by velocity*dt", () => {
    const { ball } = stepBall(makeBall(), leftPaddle, rightPaddle, FW, FH, 0.5);
    expect(ball.x).toBe(450);
  });

  it("bounces off top wall", () => {
    const { ball } = stepBall(
      makeBall({ y: 1, vy: -100 }),
      leftPaddle,
      rightPaddle,
      FW,
      FH,
      0.1,
    );
    expect(ball.vy).toBeGreaterThan(0);
    expect(ball.y).toBeGreaterThanOrEqual(0);
  });

  it("bounces off bottom wall", () => {
    const { ball } = stepBall(
      makeBall({ y: FH - 11, vy: 100 }),
      leftPaddle,
      rightPaddle,
      FW,
      FH,
      0.1,
    );
    expect(ball.vy).toBeLessThan(0);
    expect(ball.y + ball.size).toBeLessThanOrEqual(FH);
  });

  it("scores right when ball goes off left edge", () => {
    const { scored } = stepBall(
      makeBall({ x: -20, vx: -100 }),
      leftPaddle,
      rightPaddle,
      FW,
      FH,
      0.01,
    );
    expect(scored).toBe("right");
  });

  it("scores left when ball goes off right edge", () => {
    const { scored } = stepBall(
      makeBall({ x: FW + 10, vx: 100 }),
      leftPaddle,
      rightPaddle,
      FW,
      FH,
      0.01,
    );
    expect(scored).toBe("left");
  });

  it("bounces off left paddle and reverses vx", () => {
    const ball = makeBall({ x: 33, y: 245, size: 10, vx: -200, vy: 0, speed: 200 });
    const { ball: result, scored } = stepBall(
      ball,
      leftPaddle,
      rightPaddle,
      FW,
      FH,
      0.01,
    );
    expect(scored).toBeNull();
    expect(result.vx).toBeGreaterThan(0);
  });

  it("bounces off right paddle and reverses vx", () => {
    const ball = makeBall({ x: 765, y: 245, vx: 200, vy: 0, speed: 200 });
    const { ball: result } = stepBall(
      ball,
      leftPaddle,
      rightPaddle,
      FW,
      FH,
      0.01,
    );
    expect(result.vx).toBeLessThan(0);
  });

  it("does not register paddle hit when moving away", () => {
    const ball = makeBall({ x: 33, y: 245, vx: 200, vy: 0 });
    const { ball: r } = stepBall(ball, leftPaddle, rightPaddle, FW, FH, 0.001);
    expect(r.vx).toBeGreaterThan(0);
  });
});
