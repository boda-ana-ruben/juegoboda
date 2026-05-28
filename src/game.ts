import type { GameConfig, GameState, Obstacle, Player } from "./types.ts";
import {
  DISTANCE_PER_SECOND,
  FINISH_DISTANCE,
  MILESTONE_STEP,
  makeConfig,
} from "./constants.ts";
import { loadBestScore, saveBestScore } from "./score.ts";
import {
  computeSpawnInterval,
  computeWorldSpeed,
  gamePhaseForDistance,
  pickObstacleProfile,
} from "./progression.ts";
import { intersectsPlayer } from "./collision.ts";
import { render } from "./renderer.ts";
import { GameAudio } from "./audio.ts";
import playerFrame1Url from "./assets/player/couple-move1.png";
import playerFrame2Url from "./assets/player/couple-move2.png";

const OBSTACLE_SPAWN_STOP_DISTANCE = FINISH_DISTANCE - 25;
const ALTAR_TARGET_OFFSET_X = 130;

export class Game {
  private state: GameState = "idle";
  private distance = 0;
  private best: number;
  private worldSpeed: number;
  private spawnTimer = 0;
  private spawnInterval: number;
  private worldScrollPx = 0;
  private altarX: number | null = null;
  private hasWon = false;
  private lastTs = 0;
  private milestoneShown = 0;
  private justBeatRecord = false;
  private readonly obstacles: Obstacle[] = [];
  private readonly player: Player;
  private readonly config: GameConfig;
  private readonly audio: GameAudio;
  private readonly playerFrames: HTMLImageElement[];
  private playerFrameIndex = 0;
  private playerFrameTimer = 0;
  private readonly playerFrameStepSeconds = 0.12;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly ctx: CanvasRenderingContext2D,
    private readonly overlay: HTMLElement,
    private readonly distanceEl: HTMLElement,
    private readonly bestEl: HTMLElement,
  ) {
    this.config = makeConfig(canvas.height);
    this.audio = new GameAudio();
    this.playerFrames = [
      this.createImage(playerFrame1Url),
      this.createImage(playerFrame2Url),
    ];
    this.best = loadBestScore();
    this.worldSpeed = this.config.progression.worldSpeedBase;
    this.spawnInterval = this.config.progression.spawnIntervalBase;
    this.player = {
      x: 140,
      width: 72,
      height: 104,
      y: 0,
      velocityY: 0,
      grounded: true,
    };
    this.bestEl.textContent = `${Math.floor(this.best)}m`;
    this.reset();
  }

  tick(ts: number): void {
    if (this.lastTs === 0) this.lastTs = ts;
    const dt = Math.min(0.033, (ts - this.lastTs) / 1000);
    this.lastTs = ts;
    this.update(dt);
    this.draw(ts);
  }

  handleJumpIntent(): void {
    this.audio.unlockFromUserGesture();

    if (this.state === "idle") {
      this.start();
      this.performJump();
      return;
    }
    if (this.state === "gameOver") {
      this.reset();
      this.start();
      this.performJump();
      return;
    }
    this.performJump();
  }

  private performJump(): void {
    if (!this.player.grounded || this.state !== "running") return;
    this.player.grounded = false;
    this.player.velocityY = -this.config.jumpForce;
  }

  private start(): void {
    this.state = "running";
    this.audio.playRunMusic();
    this.setOverlay("", false);
  }

  reset(): void {
    this.state = "idle";
    this.distance = 0;
    this.worldSpeed = this.config.progression.worldSpeedBase;
    this.spawnTimer = 0;
    this.spawnInterval = this.config.progression.spawnIntervalBase;
    this.worldScrollPx = 0;
    this.altarX = null;
    this.hasWon = false;
    this.obstacles.length = 0;
    this.player.y =
      this.config.groundY -
      this.player.height -
      this.config.runnerPaddingBottom;
    this.player.velocityY = 0;
    this.player.grounded = true;
    this.milestoneShown = 0;
    this.justBeatRecord = false;
    this.playerFrameIndex = 0;
    this.playerFrameTimer = 0;
    this.audio.stopAll();
    this.setOverlay("Pulsa Space, ArrowUp o toca para correr otra vez", true);
  }

  private endRun(): void {
    this.state = "gameOver";
    this.hasWon = false;
    this.audio.stopAll();
    this.audio.playFailMusic();

    if (this.distance > this.best) {
      this.best = this.distance;
      saveBestScore(this.best);
      this.bestEl.textContent = `${Math.floor(this.best)}m`;
      this.justBeatRecord = true;
    }

    this.setOverlay(
      this.justBeatRecord
        ? `Nuevo record: ${Math.floor(this.distance)}m\nToca para reintentar`
        : `Game Over · Distancia ${Math.floor(this.distance)}m\nToca para reintentar`,
      true,
    );
  }

  private endWin(): void {
    this.state = "gameOver";
    this.hasWon = true;
    this.altarX = this.player.x + ALTAR_TARGET_OFFSET_X;
    this.audio.stopAll();
    this.audio.playWinMusic();

    if (this.distance > this.best) {
      this.best = this.distance;
      saveBestScore(this.best);
      this.bestEl.textContent = `${Math.floor(this.best)}m`;
      this.justBeatRecord = true;
    }

    this.setOverlay("Habeis esquivado a todos los Mariachis!!", true);
  }

  private update(dt: number): void {
    if (this.state !== "running") return;

    this.playerFrameTimer += dt;
    while (this.playerFrameTimer >= this.playerFrameStepSeconds) {
      this.playerFrameTimer -= this.playerFrameStepSeconds;
      this.playerFrameIndex =
        (this.playerFrameIndex + 1) % this.playerFrames.length;
    }

    this.worldSpeed = computeWorldSpeed(this.distance, this.config);
    this.spawnInterval = computeSpawnInterval(this.distance, this.config);
    this.worldScrollPx += this.worldSpeed * dt;

    const pixelsPerMeter = this.worldSpeed / DISTANCE_PER_SECOND;
    const remainingMeters = Math.max(0, FINISH_DISTANCE - this.distance);
    this.altarX =
      this.player.x + ALTAR_TARGET_OFFSET_X + remainingMeters * pixelsPerMeter;

    this.distance += dt * DISTANCE_PER_SECOND;
    if (this.distance >= FINISH_DISTANCE) {
      this.distance = FINISH_DISTANCE;
      this.distanceEl.textContent = `${Math.floor(this.distance)}m`;
      this.endWin();
      return;
    }

    this.distanceEl.textContent = `${Math.floor(this.distance)}m`;

    const nowMilestone =
      Math.floor(this.distance / MILESTONE_STEP) * MILESTONE_STEP;
    if (nowMilestone > this.milestoneShown && nowMilestone > 0) {
      this.milestoneShown = nowMilestone;
      this.setOverlay(`¡${nowMilestone}m! Ya casi llegan al altar`, true, 1300);
    }

    this.player.velocityY += this.config.gravity * dt;
    this.player.y += this.player.velocityY * dt;

    const floorY =
      this.config.groundY -
      this.player.height -
      this.config.runnerPaddingBottom;
    if (this.player.y >= floorY) {
      this.player.y = floorY;
      this.player.velocityY = 0;
      this.player.grounded = true;
    }

    if (this.distance < OBSTACLE_SPAWN_STOP_DISTANCE) {
      this.spawnTimer += dt;
      if (this.spawnTimer >= this.spawnInterval) {
        this.spawnTimer = 0;
        this.spawnObstacle();
      }
    }

    for (let i = this.obstacles.length - 1; i >= 0; i -= 1) {
      const ob = this.obstacles[i];
      ob.x -= this.worldSpeed * ob.speedFactor * dt;

      if (intersectsPlayer(this.player, ob)) {
        this.endRun();
        return;
      }

      if (ob.x + ob.width < -40) {
        this.obstacles.splice(i, 1);
      }
    }

    if (this.distance > this.best && !this.justBeatRecord) {
      this.justBeatRecord = true;
      this.setOverlay("¡Nuevo record en curso!", true, 850);
    }
  }

  private spawnObstacle(): void {
    if (!this.canSpawnObstacle()) {
      this.spawnTimer = this.spawnInterval * 0.85;
      return;
    }

    const phase = gamePhaseForDistance(this.distance);
    const profile = pickObstacleProfile(phase);
    this.obstacles.push({
      type: profile.type,
      x: this.canvas.width + Math.random() * 26,
      y: this.config.groundY - profile.height,
      width: profile.width,
      height: profile.height,
      color: profile.color,
      speedFactor: profile.speedFactor,
    });
  }

  private canSpawnObstacle(): boolean {
    if (this.obstacles.length === 0) return true;
    const last = this.obstacles[this.obstacles.length - 1];
    const spaceFromLast = this.canvas.width - (last.x + last.width);
    return spaceFromLast >= this.minimumFairGapPx();
  }

  private minimumFairGapPx(): number {
    const reactionWindow = 0.34;
    const jumpTime = (2 * this.config.jumpForce) / this.config.gravity;
    const airtimeWindow = jumpTime * 0.72;
    const landingRecoveryWindow = 0.22;
    const safeTimeWindow =
      reactionWindow + airtimeWindow + landingRecoveryWindow;
    const dynamic = this.worldSpeed * safeTimeWindow;
    return Math.max(this.config.minSpawnGapPx + 28, dynamic);
  }

  private draw(nowMs: number): void {
    render(
      this.ctx,
      this.canvas,
      {
        player: this.player,
        playerAnimation: {
          frame: this.playerFrames[this.playerFrameIndex] ?? null,
        },
        obstacles: this.obstacles,
        distance: this.distance,
        worldScrollPx: this.worldScrollPx,
        altarX: this.altarX,
        hasWon: this.hasWon,
        nowMs,
      },
      this.config,
    );
  }

  private createImage(url: string): HTMLImageElement {
    const image = new Image();
    image.src = url;
    return image;
  }

  private setOverlay(text: string, show: boolean, autoHideMs = 0): void {
    this.overlay.textContent = text;
    this.overlay.classList.toggle("show", show && text.length > 0);

    if (show && autoHideMs > 0) {
      window.setTimeout(() => {
        if (this.state === "running") {
          this.overlay.classList.remove("show");
        }
      }, autoHideMs);
    }
  }
}
