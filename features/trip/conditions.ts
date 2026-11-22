import { haversineKm } from '@/lib/geo';
import type { TripPhase } from './phase';

// Delay tags from what the rider is actually doing, not from the clock:
// a long stop at the station means a queue at the pump; standing still mid-trip means traffic.
export type TripCondition = 'queue' | 'traffic';

export const CONDITION_TEXT: Record<TripCondition, string> = {
  queue: 'Slight Queue',
  traffic: 'Slight Traffic',
};

export interface ConditionThresholds {
  // At the station longer than this -> queue.
  stationMs: number;
  // Standing still at least this long while driving -> traffic.
  stallMs: number;
}

export const REAL_THRESHOLDS: ConditionThresholds = { stationMs: 5 * 60_000, stallMs: 2 * 60_000 };
// The demo trip lasts about a minute and a half, so it shrinks the waits.
export const DEMO_THRESHOLDS: ConditionThresholds = { stationMs: 8_000, stallMs: 6_000 };

// Less movement than this counts as standing still (GPS drifts a few metres at rest).
export const STALL_RADIUS_KM = 0.03;

export interface TrailPoint {
  lat: number;
  lng: number;
  t: number;
}

// Legs where the rider should be moving. Not the "almost there" phases: slowing down
// near the door or the station is normal.
const DRIVING: TripPhase[] = ['to_customer_pickup', 'to_station', 'to_customer_dropoff'];

export const isStationPhase = (p: TripPhase) => p === 'approaching_station' || p === 'filling';

// True when the trail covers at least `stallMs` and every point in that window sits within
// STALL_RADIUS_KM of the latest one.
export function isStalled(trail: TrailPoint[], now: number, stallMs: number): boolean {
  const latest = trail[trail.length - 1];
  if (!latest) return false;
  const windowStart = now - stallMs;
  // Need a point from before the window began, or the rider may only just have stopped.
  if (!trail.some((p) => p.t <= windowStart)) return false;
  const here = { latitude: latest.lat, longitude: latest.lng };
  return trail
    .filter((p) => p.t >= windowStart)
    .every((p) => haversineKm(here, { latitude: p.lat, longitude: p.lng }) <= STALL_RADIUS_KM);
}

export function tripCondition(
  phase: TripPhase,
  { stationSince, trail, now, thresholds }: { stationSince: number | null; trail: TrailPoint[]; now: number; thresholds: ConditionThresholds },
): TripCondition | null {
  if (isStationPhase(phase)) {
    return stationSince !== null && now - stationSince > thresholds.stationMs ? 'queue' : null;
  }
  if (DRIVING.includes(phase)) return isStalled(trail, now, thresholds.stallMs) ? 'traffic' : null;
  return null;
}

// Keeps only what the stall check can use: points from the last `keepMs`.
export function pushTrail(trail: TrailPoint[], point: TrailPoint, keepMs: number): TrailPoint[] {
  return [...trail.filter((p) => p.t >= point.t - keepMs), point];
}
