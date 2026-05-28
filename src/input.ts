import type { Game } from "./game.ts";

export function bindInput(canvas: HTMLCanvasElement, game: Game): void {
  window.addEventListener("keydown", (event) => {
    if (event.code === "Space" || event.code === "ArrowUp") {
      event.preventDefault();
      game.handleJumpIntent();
    }
  });

  canvas.addEventListener("pointerdown", () => {
    game.handleJumpIntent();
  });
}
