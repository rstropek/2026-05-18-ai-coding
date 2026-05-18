import { WINNING_SCORE } from "./constants.js";
import { createInitialState, startGame, tick } from "./game.js";
import { InputManager } from "./input.js";
import { Renderer, type Theme } from "./renderer.js";
import type { GameState, Side } from "./types.js";

const THEME_STORAGE_KEY = "pong-theme";

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
const themeToggle = document.getElementById(
  "themeToggle",
) as HTMLButtonElement | null;

if (!canvas || !startButton || !themeToggle) {
  throw new Error("Required DOM elements not found");
}

const gameCanvas = canvas;
const playButton = startButton;
const colorModeButton = themeToggle;

const renderer = new Renderer(gameCanvas);
const input = new InputManager();

let state: GameState = applyDebugOverrides(createInitialState());
let lastTime = performance.now();
let theme: Theme = loadTheme();

function loadTheme(): Theme {
  return window.localStorage.getItem(THEME_STORAGE_KEY) === "light"
    ? "light"
    : "dark";
}

function applyTheme(nextTheme: Theme): void {
  theme = nextTheme;
  document.documentElement.dataset.theme = theme;
  renderer.setTheme(theme);
  colorModeButton.textContent = theme === "dark" ? "Light Mode" : "Dark Mode";
  colorModeButton.setAttribute(
    "aria-label",
    theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
  );
  colorModeButton.setAttribute("aria-pressed", String(theme === "light"));
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

function frame(now: number): void {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  state = tick(state, input.snapshot(), dt);
  renderer.draw(state);
  updateButtonVisibility();

  requestAnimationFrame(frame);
}

function updateButtonVisibility(): void {
  const visible = state.status === "idle" || state.status === "gameover";
  playButton.style.display = visible ? "block" : "none";
  playButton.textContent = state.status === "gameover" ? "PLAY AGAIN" : "START";
  playButton.setAttribute(
    "aria-label",
    state.status === "gameover" ? "Play again" : "Start game",
  );
}

playButton.addEventListener("click", () => {
  state = startGame(state);
  updateButtonVisibility();
});

colorModeButton.addEventListener("click", () => {
  applyTheme(theme === "dark" ? "light" : "dark");
  renderer.draw(state);
});

applyTheme(theme);
renderer.draw(state);
updateButtonVisibility();
requestAnimationFrame(frame);
