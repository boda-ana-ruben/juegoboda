import type { GameConfig, GamePhase, ObstacleProfile } from "./types.ts";
import {
  OBSTACLE_PROFILES,
  PHASE_BOUNDARIES,
  SPEED_STEP_DISTANCE,
} from "./constants.ts";

export function gamePhaseForDistance(value: number): GamePhase {
  if (value < PHASE_BOUNDARIES[0]) return 1;
  if (value < PHASE_BOUNDARIES[1]) return 2;
  if (value < PHASE_BOUNDARIES[2]) return 3;
  return 4;
}

function getPhaseWeights(phase: GamePhase): [number, number, number] {
  switch (phase) {
    case 1:
      return [0.66, 0.25, 0.09];
    case 2:
      return [0.46, 0.36, 0.18];
    case 3:
      return [0.3, 0.42, 0.28];
    case 4:
      return [0.2, 0.38, 0.42];
  }
}

export function pickObstacleProfile(phase: GamePhase): ObstacleProfile {
  const [a, b] = getPhaseWeights(phase);
  const roll = Math.random();
  if (roll < a) return OBSTACLE_PROFILES[0];
  if (roll < a + b) return OBSTACLE_PROFILES[1];
  return OBSTACLE_PROFILES[2];
}

export function computeWorldSpeed(distance: number, cfg: GameConfig): number {
  const steppedIncrements = Math.floor(distance / SPEED_STEP_DISTANCE);
  const speedStepAmount =
    cfg.progression.worldSpeedPerMeter * SPEED_STEP_DISTANCE;
  return Math.min(
    cfg.progression.worldSpeedBase + steppedIncrements * speedStepAmount,
    cfg.progression.worldSpeedMax,
  );
}

export function computeSpawnInterval(
  distance: number,
  cfg: GameConfig,
): number {
  return Math.max(
    cfg.progression.spawnIntervalMin,
    cfg.progression.spawnIntervalBase -
      distance * cfg.progression.spawnIntervalPerMeter,
  );
}
