import { createInitialState, startGame, tick } from "./game.js";
import { InputManager } from "./input.js";
import { Renderer } from "./renderer.js";
import type { GameState } from "./types.js";

const canvas = document.getElementById("game") as HTMLCanvasElement | null;
const startButton = document.getElementById(
  "startBtn",
) as HTMLButtonElement | null;

if (!canvas || !startButton) {
  throw new Error("Required DOM elements not found");
}

const renderer = new Renderer(canvas);
const input = new InputManager();

let state: GameState = createInitialState();
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
