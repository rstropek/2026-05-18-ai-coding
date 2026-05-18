import { createBall, stepBall } from "./ball.js";
import {
  BALL_SIZE,
  FIELD_HEIGHT,
  FIELD_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_MARGIN,
  PADDLE_WIDTH,
  WINNING_SCORE,
} from "./constants.js";
import { movePaddle } from "./paddle.js";
import type { FrameInput, GameState, Side } from "./types.js";

export function createInitialState(): GameState {
  const paddleY = FIELD_HEIGHT / 2 - PADDLE_HEIGHT / 2;
  return {
    field: { width: FIELD_WIDTH, height: FIELD_HEIGHT },
    leftPaddle: {
      x: PADDLE_MARGIN,
      y: paddleY,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    rightPaddle: {
      x: FIELD_WIDTH - PADDLE_MARGIN - PADDLE_WIDTH,
      y: paddleY,
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
    },
    ball: createBall(FIELD_WIDTH, FIELD_HEIGHT, BALL_SIZE, 1),
    scoreLeft: 0,
    scoreRight: 0,
    status: "idle",
    winner: null,
  };
}

export function startGame(state: GameState): GameState {
  return {
    ...state,
    scoreLeft: 0,
    scoreRight: 0,
    status: "running",
    winner: null,
    ball: createBall(state.field.width, state.field.height, state.ball.size),
  };
}

export function tick(
  state: GameState,
  input: FrameInput,
  dt: number,
): GameState {
  if (state.status !== "running") return state;

  const leftPaddle = movePaddle(
    state.leftPaddle,
    input.left,
    state.field.height,
    dt,
  );
  const rightPaddle = movePaddle(
    state.rightPaddle,
    input.right,
    state.field.height,
    dt,
  );

  const step = stepBall(
    state.ball,
    leftPaddle,
    rightPaddle,
    state.field.width,
    state.field.height,
    dt,
  );

  let scoreLeft = state.scoreLeft;
  let scoreRight = state.scoreRight;
  let ball = step.ball;
  let status: GameState["status"] = state.status;
  let winner: Side | null = state.winner;

  if (step.scored === "left") {
    scoreLeft += 1;
    ball = createBall(
      state.field.width,
      state.field.height,
      state.ball.size,
      -1,
    );
  } else if (step.scored === "right") {
    scoreRight += 1;
    ball = createBall(
      state.field.width,
      state.field.height,
      state.ball.size,
      1,
    );
  }

  if (scoreLeft >= WINNING_SCORE) {
    status = "gameover";
    winner = "left";
  } else if (scoreRight >= WINNING_SCORE) {
    status = "gameover";
    winner = "right";
  }

  return {
    ...state,
    leftPaddle,
    rightPaddle,
    ball,
    scoreLeft,
    scoreRight,
    status,
    winner,
  };
}
