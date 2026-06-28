import type { DayStatus } from '@/types';

/** DJB2 hash — fast, deterministic, no imports needed */
function djb2(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Generate a deterministic day status for a provider on a given day index.
 * Day 0 = today, Day 89 = 90 days ago.
 * Higher uptimePct → lower probability of incidents.
 */
export function getDayStatus(
  providerId: string,
  dayIndex: number,
  uptimePct: number
): DayStatus {
  const seed = djb2(`${providerId}-day-${dayIndex}`);
  const rand = (seed % 100_000) / 100_000; // 0.0–1.0

  // Incident rates scaled from uptimePct (e.g. 99.99% → ~0.01% down probability per day)
  const downtimeRate = (100 - uptimePct) / 100;
  const downProb = downtimeRate * 0.4;   // portion that is hard-down
  const degradedProb = downtimeRate * 0.8; // portion that is degraded (cumulative)

  if (rand < downProb) return 'down';
  if (rand < degradedProb) return 'degraded';
  return 'up';
}

/**
 * Count incidents (down or degraded days) in the last 90 days for a provider.
 */
export function countIncidents(
  providerId: string,
  uptimePct: number,
  days = 90
): { downDays: number; degradedDays: number } {
  let downDays = 0;
  let degradedDays = 0;
  for (let i = 0; i < days; i++) {
    const s = getDayStatus(providerId, i, uptimePct);
    if (s === 'down') downDays++;
    else if (s === 'degraded') degradedDays++;
  }
  return { downDays, degradedDays };
}

/** Color mapping for day status squares */
export const DAY_STATUS_COLOR: Record<DayStatus, string> = {
  up: '#22c55e',        // green-500
  degraded: '#f59e0b',  // amber-500
  down: '#ef4444',      // red-500
};

export const DAY_STATUS_BG: Record<DayStatus, string> = {
  up: 'bg-emerald-500',
  degraded: 'bg-amber-400',
  down: 'bg-red-500',
};
