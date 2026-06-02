import type { GameConfig, ObstacleProfile } from "./types.ts";

export const BEST_SCORE_KEY = "wedding-runner-best";
export const MILESTONE_STEP = 250;
export const DISTANCE_PER_SECOND = 10;
export const FINISH_DISTANCE = 1000;
export const SPEED_STEP_DISTANCE = 150;

export const OBSTACLE_PROFILES: ObstacleProfile[] = [
  { type: "A", width: 50, height: 70, color: "#0d8c7a", speedFactor: 1 },
  { type: "B", width: 66, height: 80, color: "#c03a2b", speedFactor: 1.01 },
  { type: "C", width: 82, height: 90, color: "#3957a8", speedFactor: 1.03 },
];

export const PHASE_BOUNDARIES = [200, 600, 1200] as const;

export function makeConfig(canvasHeight: number): GameConfig {
  return {
    gravity: 1650,
    jumpForce: 770,
    groundY: canvasHeight - 64,
    runnerPaddingBottom: 0,
    progression: {
      worldSpeedBase: 260,
      worldSpeedPerMeter: 0.058,
      worldSpeedMax: 610,
      spawnIntervalBase: 1.55,
      spawnIntervalMin: 0.58,
      spawnIntervalPerMeter: 0.0012,
    },
    minSpawnGapPx: 180,
  };
}
