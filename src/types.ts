export type GamePhase = 1 | 2 | 3 | 4;
export type GameState = "idle" | "running" | "gameOver";
export type MariachiType = "A" | "B" | "C";

export type ObstacleProfile = {
  type: MariachiType;
  width: number;
  height: number;
  color: string;
  speedFactor: number;
};

export type Obstacle = {
  type: MariachiType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  speedFactor: number;
};

export type ProgressionConfig = {
  worldSpeedBase: number;
  worldSpeedPerMeter: number;
  worldSpeedMax: number;
  spawnIntervalBase: number;
  spawnIntervalMin: number;
  spawnIntervalPerMeter: number;
};

export type GameConfig = {
  gravity: number;
  jumpForce: number;
  groundY: number;
  runnerPaddingBottom: number;
  progression: ProgressionConfig;
  minSpawnGapPx: number;
};

export type Player = {
  x: number;
  width: number;
  height: number;
  y: number;
  velocityY: number;
  grounded: boolean;
};

export type PlayerAnimation = {
  frame: HTMLImageElement | null;
};
