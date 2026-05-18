import {
  BALL_INITIAL_SPEED,
  BALL_MAX_BOUNCE_ANGLE,
  BALL_MAX_SPEED,
  BALL_SPEED_INCREMENT,
} from "./constants.js";
import type { Ball, Paddle, Side } from "./types.js";

export interface BallStep {
  ball: Ball;
  scored: Side | null;
}

export function createBall(
  fieldWidth: number,
  fieldHeight: number,
  size: number,
  direction: 1 | -1 = Math.random() < 0.5 ? -1 : 1,
  speed: number = BALL_INITIAL_SPEED,
): Ball {
  const angle = (Math.random() * 2 - 1) * (Math.PI / 6);
  return {
    x: fieldWidth / 2 - size / 2,
    y: fieldHeight / 2 - size / 2,
    size,
    vx: direction * speed * Math.cos(angle),
    vy: speed * Math.sin(angle),
    speed,
  };
}

export function stepBall(
  ball: Ball,
  leftPaddle: Paddle,
  rightPaddle: Paddle,
  fieldWidth: number,
  fieldHeight: number,
  dt: number,
): BallStep {
  let { x, y, vx, vy, speed } = ball;
  const size = ball.size;

  x += vx * dt;
  y += vy * dt;

  // Top/bottom wall bounce.
  if (y < 0) {
    y = -y;
    vy = -vy;
  } else if (y + size > fieldHeight) {
    y = fieldHeight - size - (y + size - fieldHeight);
    vy = -vy;
  }

  // Paddle collisions.
  if (vx < 0 && intersects(x, y, size, leftPaddle)) {
    x = leftPaddle.x + leftPaddle.width;
    const bounce = bounceVelocity(y, size, leftPaddle, speed, +1);
    vx = bounce.vx;
    vy = bounce.vy;
    speed = bounce.speed;
  } else if (vx > 0 && intersects(x, y, size, rightPaddle)) {
    x = rightPaddle.x - size;
    const bounce = bounceVelocity(y, size, rightPaddle, speed, -1);
    vx = bounce.vx;
    vy = bounce.vy;
    speed = bounce.speed;
  }

  // Score detection.
  let scored: Side | null = null;
  if (x + size < 0) scored = "right";
  else if (x > fieldWidth) scored = "left";

  return {
    ball: { x, y, vx, vy, size, speed },
    scored,
  };
}

function intersects(bx: number, by: number, size: number, p: Paddle): boolean {
  return (
    bx < p.x + p.width &&
    bx + size > p.x &&
    by < p.y + p.height &&
    by + size > p.y
  );
}

function bounceVelocity(
  ballY: number,
  ballSize: number,
  paddle: Paddle,
  currentSpeed: number,
  xSign: 1 | -1,
): { vx: number; vy: number; speed: number } {
  const paddleCenter = paddle.y + paddle.height / 2;
  const ballCenter = ballY + ballSize / 2;
  const offset = (ballCenter - paddleCenter) / (paddle.height / 2);
  const clamped = Math.max(-1, Math.min(1, offset));
  const angle = clamped * BALL_MAX_BOUNCE_ANGLE;
  const newSpeed = Math.min(
    currentSpeed + BALL_SPEED_INCREMENT,
    BALL_MAX_SPEED,
  );
  return {
    vx: xSign * newSpeed * Math.cos(angle),
    vy: newSpeed * Math.sin(angle),
    speed: newSpeed,
  };
}
