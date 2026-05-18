import { WINNING_SCORE } from "./constants.js";
import { createInitialState, startGame, tick } from "./game.js";
import { InputManager } from "./input.js";
import { Renderer } from "./renderer.js";
import type { GameState, Side } from "./types.js";

function applyDebugOverrides(state: GameState): GameState {
  const param = new URLSearchParams(window.location.search).get("gameover");
  if (param !== "left" && param !== "right") return state;
  const winner: Side = param;
  return {
    ...state,
    status: "gameover",
    winner,
    scoreLeft: winner === "left" ? WINNING_SCORE : WINNING_SCORE - 1,
    scoreRight: winner === "right" ? WINNING_SCORE : WINNING_SCORE - 1,
  };
}

const canvas = document.getElementById("game") as HTMLCanvasElement | null;
const startButton = document.getElementById(
  "startBtn",
) as HTMLButtonElement | null;

if (!canvas || !startButton) {
  throw new Error("Required DOM elements not found");
}

const renderer = new Renderer(canvas);
const input = new InputManager();

let state: GameState = applyDebugOverrides(createInitialState());
let lastTime = performance.now();

function frame(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  state = tick(state, input.snapshot(), dt);
  renderer.draw(state);
  updateButtonVisibility();

  requestAnimationFrame(frame);
}

function updateButtonVisibility(): void {
  if (!startButton) return;
  const visible = state.status === "idle" || state.status === "gameover";
  startButton.style.display = visible ? "block" : "none";
  startButton.textContent =
    state.status === "gameover" ? "PLAY AGAIN" : "START";
}

startButton.addEventListener("click", () => {
  state = startGame(state);
  updateButtonVisibility();
});

renderer.draw(state);
updateButtonVisibility();
requestAnimationFrame(frame);
