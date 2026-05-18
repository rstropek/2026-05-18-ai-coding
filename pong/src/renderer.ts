import type { GameState } from "./types.js";

export type Theme = "dark" | "light";

const THEMES = {
  dark: {
    field: "#0b0f1a",
    divider: "#2a3550",
    score: "#3e4d75",
    foreground: "#e8ecf5",
    overlay: "rgba(0,0,0,0.55)",
    overlayText: "#ffffff",
  },
  light: {
    field: "#f4f7fb",
    divider: "#c7d2e5",
    score: "#9aa9c0",
    foreground: "#152034",
    overlay: "rgba(244,247,251,0.78)",
    overlayText: "#152034",
  },
} as const;

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;

  private theme: Theme = "dark";

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");
    this.ctx = ctx;
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
  }

  draw(state: GameState): void {
    const ctx = this.ctx;
    const { width, height } = state.field;
    const colors = THEMES[this.theme];

    ctx.fillStyle = colors.field;
    ctx.fillRect(0, 0, width, height);

    // Center dashed line.
    ctx.strokeStyle = colors.divider;
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Score.
    ctx.fillStyle = colors.score;
    ctx.font = "bold 64px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(String(state.scoreLeft), width / 2 - 80, 20);
    ctx.fillText(String(state.scoreRight), width / 2 + 80, 20);

    // Paddles.
    ctx.fillStyle = colors.foreground;
    ctx.fillRect(
      state.leftPaddle.x,
      state.leftPaddle.y,
      state.leftPaddle.width,
      state.leftPaddle.height,
    );
    ctx.fillRect(
      state.rightPaddle.x,
      state.rightPaddle.y,
      state.rightPaddle.width,
      state.rightPaddle.height,
    );

    // Ball.
    ctx.fillRect(state.ball.x, state.ball.y, state.ball.size, state.ball.size);

    if (state.status === "gameover") {
      ctx.fillStyle = colors.overlay;
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = colors.overlayText;
      ctx.font = "bold 72px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("GAME OVER", width / 2, height * 0.22);
      ctx.font = "bold 24px monospace";
      const winnerText =
        state.winner === "left" ? "LEFT PLAYER WINS" : "RIGHT PLAYER WINS";
      ctx.fillText(winnerText, width / 2, height * 0.34);
    }
  }
}
