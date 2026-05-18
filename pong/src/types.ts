export interface Vector2 {
  x: number;
  y: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ball {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  speed: number;
}

export type Side = "left" | "right";

export interface GameState {
  field: { width: number; height: number };
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  ball: Ball;
  scoreLeft: number;
  scoreRight: number;
  status: "idle" | "running" | "gameover";
  winner: Side | null;
}

export interface PaddleInput {
  up: boolean;
  down: boolean;
}

export interface FrameInput {
  left: PaddleInput;
  right: PaddleInput;
}
