import { BEST_SCORE_KEY } from "./constants.ts";

export function loadBestScore(): number {
  const stored = window.localStorage.getItem(BEST_SCORE_KEY);
  if (!stored) return 0;
  const parsed = Number.parseFloat(stored);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function saveBestScore(value: number): void {
  window.localStorage.setItem(BEST_SCORE_KEY, value.toFixed(2));
}
