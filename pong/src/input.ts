import type { FrameInput } from "./types.js";

export class InputManager {
  private readonly pressed = new Set<string>();
  private readonly target: Window;

  constructor(target: Window = window) {
    this.target = target;
    this.target.addEventListener("keydown", this.onKeyDown);
    this.target.addEventListener("keyup", this.onKeyUp);
  }

  dispose(): void {
    this.target.removeEventListener("keydown", this.onKeyDown);
    this.target.removeEventListener("keyup", this.onKeyUp);
  }

  snapshot(): FrameInput {
    return {
      left: {
        up: this.pressed.has("KeyW"),
        down: this.pressed.has("KeyS"),
      },
      right: {
        up: this.pressed.has("ArrowUp"),
        down: this.pressed.has("ArrowDown"),
      },
    };
  }

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    if (TRACKED.has(e.code)) {
      this.pressed.add(e.code);
      e.preventDefault();
    }
  };

  private readonly onKeyUp = (e: KeyboardEvent): void => {
    if (TRACKED.has(e.code)) {
      this.pressed.delete(e.code);
      e.preventDefault();
    }
  };
}

const TRACKED = new Set(["KeyW", "KeyS", "ArrowUp", "ArrowDown"]);
