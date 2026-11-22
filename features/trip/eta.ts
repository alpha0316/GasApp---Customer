import { haversineKm, type LatLng } from '@/lib/geo';

export type TrafficLevel = 'light' | 'moderate' | 'heavy';

export interface Eta {
  seconds: number;
  // Rounded average shown to the customer, at least 1.
  minutes: number;
  // Likely range around the average, since traffic and stops vary.
  low: number;
  high: number;
  traffic: TrafficLevel;
}

// Typical Accra road conditions by hour. Accra is on GMT all year (no DST),
// so UTC hours are local hours regardless of the phone's time zone.
export function trafficAt(at: Date): { factor: number; level: TrafficLevel } {
  const day = at.getUTCDay(); // 0 = Sunday
  const h = at.getUTCHours() + at.getUTCMinutes() / 60;
  const weekday = day >= 1 && day <= 5;

  if (weekday) {
    if (h >= 6.5 && h < 9.5) return { factor: 1.6, level: 'heavy' }; // morning rush
    if (h >= 16 && h < 19.5) return { factor: 1.7, level: 'heavy' }; // evening rush
    if (h >= 11 && h < 16) return { factor: 1.25, level: 'moderate' };
    if (h >= 9.5 && h < 11) return { factor: 1.3, level: 'moderate' };
    if (h >= 19.5 && h < 21) return { factor: 1.2, level: 'moderate' };
    return { factor: 1, level: 'light' };
  }
  if (day === 6 && h >= 10 && h < 18) return { factor: 1.25, level: 'moderate' }; // Saturday markets/events
  return { factor: 1, level: 'light' };
}

// Motorbikes filter through jams, so they lose about half as much time to traffic.
const trafficPenaltyShare = (vehicleType?: string) => (vehicleType === 'motorbike' || vehicleType === 'bicycle' ? 0.5 : 1);

// Free-flow road time from the routing service, adjusted for traffic now.
export function driveSeconds(freeFlowSeconds: number, at: Date, vehicleType?: string): number {
  const { factor } = trafficAt(at);
  return freeFlowSeconds * (1 + (factor - 1) * trafficPenaltyShare(vehicleType));
}

// Used when routing is off or fails: straight line x 1.35 for real roads, at an average 24 km/h in town.
export function estimateFreeFlowSeconds(from: LatLng, to: LatLng): number {
  return ((haversineKm(from, to) * 1.35) / 24) * 3600;
}

// Average time at the station: waiting at the pump plus filling. Extra cylinders add time.
const STATION_BASE_SECONDS = 9 * 60;
const EXTRA_CYLINDER_SECONDS = 3 * 60;
export const fillSeconds = (cylinderCount: number) => STATION_BASE_SECONDS + Math.max(0, cylinderCount - 1) * EXTRA_CYLINDER_SECONDS;

// Time left at the station, given when filling started. Never below 2 min: the rider still has to pay and pack up.
export function remainingFillSeconds(cylinderCount: number, startedAt: Date | null, now: Date): number {
  const total = fillSeconds(cylinderCount);
  if (!startedAt) return total;
  const elapsed = (now.getTime() - startedAt.getTime()) / 1000;
  return Math.max(2 * 60, total - elapsed);
}

export function makeEta(seconds: number, at: Date): Eta {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return {
    seconds,
    minutes,
    low: Math.max(1, Math.floor((seconds * 0.85) / 60)),
    high: Math.max(minutes, Math.ceil((seconds * 1.2) / 60)),
    traffic: trafficAt(at).level,
  };
}

// Blends a new reading into the previous one so the number does not jump on every GPS ping.
export function smoothSeconds(prev: number | null, next: number, weight = 0.4): number {
  return prev === null ? next : prev * (1 - weight) + next * weight;
}

export const formatEta = (eta: Eta) => `~${eta.minutes} min`;

export const formatEtaRange = (eta: Eta) => (eta.high - eta.low >= 2 ? `${eta.low}–${eta.high} min` : formatEta(eta));

export const trafficLabel = (level: TrafficLevel) =>
  level === 'heavy' ? 'Heavy traffic' : level === 'moderate' ? 'Moderate traffic' : 'Light traffic';
