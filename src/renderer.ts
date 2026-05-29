import type {
  GameConfig,
  MariachiType,
  Obstacle,
  Player,
  PlayerAnimation,
} from "./types.ts";
import altarUrl from "./assets/altar/altar.png";
import dunesUrl from "./assets/background/dessert_back.png";
import dogFrame1Url from "./assets/dog/bilbo.png";
import dogFrame2Url from "./assets/dog/bilbo2.png";
import floorTileUrl from "./assets/floor/floor.png";
import obstacleAUrl from "./assets/obstacles/mariachi_1.png";
import obstacleBUrl from "./assets/obstacles/mariachi_2.png";
import obstacleCUrl from "./assets/obstacles/mariachi_3.png";

const obstacleSprites: Record<MariachiType, HTMLImageElement> = {
  A: createImage(obstacleAUrl),
  B: createImage(obstacleBUrl),
  C: createImage(obstacleCUrl),
};
const altarSprite = createImage(altarUrl);
const dunesSprite = createImage(dunesUrl);
const dogFrame1Sprite = createImage(dogFrame1Url);
const dogFrame2Sprite = createImage(dogFrame2Url);
const floorTileSprite = createImage(floorTileUrl);
const ALTAR_GROUND_ANCHOR_OFFSET_PX = 24;
const ALTAR_DRAW_WIDTH_PX = 200;
const DOG_DRAW_WIDTH_PX = 75;
const DOG_FROM_ALTAR_OFFSET_X_PX = 84;
const DOG_GROUND_ANCHOR_OFFSET_PX = 6;
const DOG_FRAME_DURATION_MS = 170;
const DUNES_PARALLAX_FACTOR = 0.52;
const DUNES_BOTTOM_OFFSET_PX = 0;
const DUNES_TILE_OVERLAP_PX = 1;

export type RenderState = {
  player: Player;
  playerAnimation: PlayerAnimation;
  obstacles: readonly Obstacle[];
  distance: number;
  worldScrollPx: number;
  altarX: number | null;
  hasWon: boolean;
  nowMs: number;
};

export function render(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  state: RenderState,
  config: GameConfig,
): void {
  drawBackdrop(
    ctx,
    canvas,
    config.groundY,
    state.distance,
    state.worldScrollPx,
  );
  drawPlayer(ctx, state.player, state.playerAnimation.frame);
  drawAltar(ctx, config.groundY, state.altarX);
  drawDogByAltar(ctx, config.groundY, state.altarX, state.nowMs);
  drawObstacles(ctx, state.obstacles);
  if (state.hasWon) {
    drawConfetti(ctx, canvas, state.nowMs);
  }
}

function drawBackdrop(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  groundY: number,
  distance: number,
  worldScrollPx: number,
): void {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const skyGradient = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGradient.addColorStop(0, "#79c9ff");
  skyGradient.addColorStop(0.55, "#b9e6ff");
  skyGradient.addColorStop(1, "#e8f7ff");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, groundY);

  ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
  const cloudScrollPx = distance * 0.32;
  const cloudWrapWidth = canvas.width + 560;
  drawCloudSet(ctx, cloudScrollPx, cloudWrapWidth);

  const horizonGradient = ctx.createLinearGradient(
    0,
    groundY - 52,
    0,
    groundY + 14,
  );
  horizonGradient.addColorStop(0, "rgba(255, 244, 203, 0.9)");
  horizonGradient.addColorStop(1, "rgba(255, 244, 203, 0)");
  ctx.fillStyle = horizonGradient;
  ctx.fillRect(0, groundY - 52, canvas.width, 66);

  drawDunesLayer(ctx, canvas, groundY, distance);

  const groundHeight = canvas.height - groundY;
  if (floorTileSprite.complete && floorTileSprite.naturalWidth > 0) {
    const tileWidth = floorTileSprite.naturalWidth;
    const tileHeight = floorTileSprite.naturalHeight;
    const scrollOffset = worldScrollPx % tileWidth;
    const previousSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;

    for (let x = -scrollOffset; x < canvas.width + tileWidth; x += tileWidth) {
      for (let y = groundY; y < canvas.height; y += tileHeight) {
        ctx.drawImage(floorTileSprite, x, y, tileWidth, tileHeight);
      }
    }

    ctx.imageSmoothingEnabled = previousSmoothing;
  } else {
    ctx.fillStyle = "#d9d1a1";
    ctx.fillRect(0, groundY, canvas.width, groundHeight);

    ctx.strokeStyle = "#b2a879";
    ctx.lineWidth = 2;
    const groundPatternSpacing = 44;
    const groundScrollOffset = worldScrollPx % groundPatternSpacing;
    for (
      let x = -groundScrollOffset;
      x < canvas.width + groundPatternSpacing;
      x += groundPatternSpacing
    ) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 2);
      ctx.lineTo(x + 20, groundY + 18);
      ctx.stroke();
    }
  }
}

function drawDunesLayer(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  groundY: number,
  distance: number,
): void {
  if (!dunesSprite.complete || dunesSprite.naturalWidth <= 0) {
    return;
  }

  const tileWidth = dunesSprite.naturalWidth;
  const tileHeight = dunesSprite.naturalHeight;
  const scrollOffset = (distance * DUNES_PARALLAX_FACTOR) % tileWidth;
  const drawY = groundY - tileHeight + DUNES_BOTTOM_OFFSET_PX;

  const previousSmoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = false;

  for (
    let x = -scrollOffset;
    x < canvas.width + tileWidth + DUNES_TILE_OVERLAP_PX;
    x += tileWidth
  ) {
    ctx.drawImage(
      dunesSprite,
      x,
      drawY,
      tileWidth + DUNES_TILE_OVERLAP_PX,
      tileHeight,
    );
  }

  ctx.imageSmoothingEnabled = previousSmoothing;
}

function drawCloudSet(
  ctx: CanvasRenderingContext2D,
  cloudScrollPx: number,
  wrapWidth: number,
): void {
  const clouds: Array<{ x: number; y: number; radius: number }> = [
    { x: 72, y: 58, radius: 46 },
    { x: 260, y: 82, radius: 38 },
    { x: 470, y: 52, radius: 52 },
    { x: 690, y: 76, radius: 42 },
    { x: 860, y: 48, radius: 40 },
    { x: 1010, y: 86, radius: 34 },
    { x: 1170, y: 62, radius: 48 },
    { x: 1330, y: 92, radius: 36 },
  ];

  for (const cloud of clouds) {
    let x = cloud.x - (cloudScrollPx % wrapWidth);
    if (x < -cloud.radius * 2) {
      x += wrapWidth;
    }
    drawCloud(ctx, x, cloud.y, cloud.radius);
    drawCloud(ctx, x + wrapWidth, cloud.y, cloud.radius);
  }
}

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.46, 0, Math.PI * 2);
  ctx.arc(x + radius * 0.42, y - radius * 0.18, radius * 0.34, 0, Math.PI * 2);
  ctx.arc(x + radius * 0.82, y + radius * 0.08, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  player: Player,
  spriteFrame: HTMLImageElement | null,
): void {
  if (spriteFrame && spriteFrame.complete && spriteFrame.naturalWidth > 0) {
    const spriteSize = player.height;
    const drawX = player.x - (spriteSize - player.width) / 2;
    ctx.drawImage(spriteFrame, drawX, player.y, spriteSize, spriteSize);
    return;
  }

  ctx.fillStyle = "#241716";
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = "#f7f0cf";
  ctx.fillRect(
    player.x + 10,
    player.y + 16,
    player.width - 20,
    player.height - 24,
  );

  ctx.fillStyle = "#c6283b";
  ctx.fillRect(player.x + 14, player.y + 6, player.width - 28, 12);
}

function drawObstacles(
  ctx: CanvasRenderingContext2D,
  obstacles: readonly Obstacle[],
): void {
  for (const ob of obstacles) {
    const sprite = obstacleSprites[ob.type];
    if (sprite.complete && sprite.naturalWidth > 0) {
      const padX = Math.max(2, ob.width * 0.08);
      const drawX = ob.x - padX;
      const drawWidth = ob.width + padX * 2;
      const previousSmoothing = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sprite, drawX, ob.y, drawWidth, ob.height);
      ctx.imageSmoothingEnabled = previousSmoothing;
      continue;
    }

    ctx.fillStyle = ob.color;
    ctx.fillRect(ob.x, ob.y, ob.width, ob.height);

    ctx.fillStyle = "#17110e";
    ctx.fillRect(ob.x + 4, ob.y + 8, ob.width - 8, 10);

    ctx.fillStyle = "#f2e3bd";
    ctx.fillRect(ob.x + 8, ob.y + 24, ob.width - 16, ob.height - 32);

    ctx.fillStyle = "#111";
    ctx.fillRect(ob.x + ob.width * 0.22, ob.y + 22, 3, 3);
    ctx.fillRect(ob.x + ob.width * 0.7, ob.y + 22, 3, 3);

    if (ob.type === "C") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.33)";
      ctx.fillRect(ob.x + 6, ob.y + ob.height - 22, ob.width - 12, 10);
    }
  }
}

function drawAltar(
  ctx: CanvasRenderingContext2D,
  groundY: number,
  altarX: number | null,
): void {
  if (altarX === null) return;

  const drawWidth = ALTAR_DRAW_WIDTH_PX;
  const ratio =
    altarSprite.naturalWidth > 0 && altarSprite.naturalHeight > 0
      ? altarSprite.naturalHeight / altarSprite.naturalWidth
      : 1.34;
  const drawHeight = drawWidth * ratio;
  const drawX = altarX;
  const drawY = groundY - drawHeight + ALTAR_GROUND_ANCHOR_OFFSET_PX;

  if (altarSprite.complete && altarSprite.naturalWidth > 0) {
    const previousSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(altarSprite, drawX, drawY, drawWidth, drawHeight);
    ctx.imageSmoothingEnabled = previousSmoothing;
    return;
  }

  ctx.strokeStyle = "#6f7a70";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(drawX + 40, groundY + 4);
  ctx.lineTo(drawX + 40, drawY + 80);
  ctx.arc(drawX + 100, drawY + 80, 60, Math.PI, 0);
  ctx.lineTo(drawX + 160, groundY + 4);
  ctx.stroke();
}

function drawDogByAltar(
  ctx: CanvasRenderingContext2D,
  groundY: number,
  altarX: number | null,
  nowMs: number,
): void {
  if (altarX === null) return;

  const frameIndex = Math.floor(nowMs / DOG_FRAME_DURATION_MS) % 2;
  const dogSprite = frameIndex === 0 ? dogFrame1Sprite : dogFrame2Sprite;

  const drawWidth = DOG_DRAW_WIDTH_PX;
  const ratio =
    dogSprite.naturalWidth > 0 && dogSprite.naturalHeight > 0
      ? dogSprite.naturalHeight / dogSprite.naturalWidth
      : 1;
  const drawHeight = drawWidth * ratio;

  const drawX = altarX - DOG_DRAW_WIDTH_PX + DOG_FROM_ALTAR_OFFSET_X_PX;
  const drawY = groundY - drawHeight + DOG_GROUND_ANCHOR_OFFSET_PX;

  if (dogSprite.complete && dogSprite.naturalWidth > 0) {
    const previousSmoothing = ctx.imageSmoothingEnabled;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(dogSprite, drawX, drawY, drawWidth, drawHeight);
    ctx.imageSmoothingEnabled = previousSmoothing;
    return;
  }

  ctx.fillStyle = "#d0a248";
  ctx.fillRect(drawX, drawY + 18, drawWidth * 0.72, drawHeight * 0.44);
  ctx.fillStyle = "#5b4330";
  ctx.fillRect(
    drawX + drawWidth * 0.58,
    drawY + drawHeight * 0.46,
    10,
    drawHeight * 0.48,
  );
  ctx.fillRect(
    drawX + drawWidth * 0.32,
    drawY + drawHeight * 0.46,
    10,
    drawHeight * 0.48,
  );
}

function drawConfetti(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  nowMs: number,
): void {
  const t = nowMs / 1000;
  const colors = ["#ffd166", "#ef476f", "#06d6a0", "#118ab2", "#f8f9fa"];

  for (let i = 0; i < 44; i += 1) {
    const speed = 70 + (i % 7) * 12;
    const baseX = ((i * 79) % (canvas.width + 120)) - 60;
    const drift = Math.sin(t * (1 + (i % 5) * 0.14) + i * 0.77) * 24;
    const x = baseX + drift;
    const y = ((t * speed + i * 31) % (canvas.height + 100)) - 50;
    const rotation = t * (1.2 + (i % 4) * 0.4) + i;
    const width = 6 + (i % 3) * 2;
    const height = 9 + (i % 4);

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.restore();
  }
}

function createImage(url: string): HTMLImageElement {
  const image = new Image();
  image.src = url;
  return image;
}
