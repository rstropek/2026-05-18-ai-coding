import type { GameState } from "./types.js";

export class Renderer {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context not available");
    this.ctx = ctx;
  }

  draw(state: GameState): void {
    const ctx = this.ctx;
    const { width, height } = state.field;

    ctx.fillStyle = "#0b0f1a";
    ctx.fillRect(0, 0, width, height);

    // Center dashed line.
    ctx.strokeStyle = "#2a3550";
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 12]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Score.
    ctx.fillStyle = "#3e4d75";
    ctx.font = "bold 64px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(String(state.scoreLeft), width / 2 - 80, 20);
    ctx.fillText(String(state.scoreRight), width / 2 + 80, 20);

    // Paddles.
    ctx.fillStyle = "#e8ecf5";
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
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#ffffff";
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
