import type { Paddle, PaddleInput } from "./types.js";
import { PADDLE_SPEED } from "./constants.js";

export function movePaddle(
  paddle: Paddle,
  input: PaddleInput,
  fieldHeight: number,
  dt: number,
  speed: number = PADDLE_SPEED,
): Paddle {
  let dy = 0;
  if (input.up) dy -= speed * dt;
  if (input.down) dy += speed * dt;

  const y = clamp(paddle.y + dy, 0, fieldHeight - paddle.height);
  return { ...paddle, y };
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
