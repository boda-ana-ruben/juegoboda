import "./style.css";
import { Game } from "./game.ts";
import { bindInput } from "./input.ts";

const canvasNode = document.querySelector<HTMLCanvasElement>("#game");
const overlayNode = document.querySelector<HTMLDivElement>("#overlay");
const distanceNode = document.querySelector<HTMLElement>("#distance");
const bestNode = document.querySelector<HTMLElement>("#best");

if (!canvasNode || !overlayNode || !distanceNode || !bestNode) {
  throw new Error("Missing required DOM nodes.");
}

const ctxNode = canvasNode.getContext("2d");
if (!ctxNode) {
  throw new Error("2D canvas is not available.");
}

const game = new Game(canvasNode, ctxNode, overlayNode, distanceNode, bestNode);
bindInput(canvasNode, game);

function loop(ts: number): void {
  game.tick(ts);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
