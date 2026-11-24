import type { LatLng } from '@/lib/geo';

const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

// Compass bearing from a to b: 0 = north, 90 = east.
export function bearingBetween(a: LatLng, b: LatLng): number {
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Local flat projection in metres around `origin`: accurate enough over a city.
function toXY(p: LatLng, origin: LatLng) {
  const mPerDegLat = 111_320;
  return {
    x: (p.longitude - origin.longitude) * mPerDegLat * Math.cos(toRad(origin.latitude)),
    y: (p.latitude - origin.latitude) * mPerDegLat,
  };
}

export interface Snapped {
  point: LatLng;
  // Bearing of the road segment the point was snapped onto, in the path's direction.
  segmentBearing: number;
  // Distance from the original point to the road, in metres.
  offsetMeters: number;
}

// The closest point on a road line, or null when the point is further than `maxMeters` from it
// (the rider is on another road, so the marker must not be pulled onto this one).
export function snapToPath(point: LatLng, path: LatLng[], maxMeters = 40): Snapped | null {
  if (path.length < 2) return null;
  let best: Snapped | null = null;
  for (let i = 0; i < path.length - 1; i++) {
    const a = toXY(path[i], point);
    const b = toXY(path[i + 1], point);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len2 = dx * dx + dy * dy;
    if (len2 === 0) continue;
    // The point is the origin, so project (0,0) onto segment a-b.
    const t = Math.max(0, Math.min(1, -(a.x * dx + a.y * dy) / len2));
    const px = a.x + t * dx;
    const py = a.y + t * dy;
    const dist = Math.hypot(px, py);
    if (!best || dist < best.offsetMeters) {
      best = {
        point: {
          latitude: path[i].latitude + (path[i + 1].latitude - path[i].latitude) * t,
          longitude: path[i].longitude + (path[i + 1].longitude - path[i].longitude) * t,
        },
        segmentBearing: bearingBetween(path[i], path[i + 1]),
        offsetMeters: dist,
      };
    }
  }
  return best && best.offsetMeters <= maxMeters ? best : null;
}

// The part of a road line still ahead of a point: from where the point meets the road to the
// end. A point off the road (the rider on a side street) joins the line at its first point.
export function remainingPath(path: LatLng[], point: LatLng, maxMeters = 80): LatLng[] {
  if (path.length < 2) return path;
  let bestIndex = -1;
  let best: Snapped | null = null;
  for (let i = 0; i < path.length - 1; i++) {
    const s = snapToPath(point, [path[i], path[i + 1]], maxMeters);
    if (s && (!best || s.offsetMeters < best.offsetMeters)) {
      best = s;
      bestIndex = i;
    }
  }
  return best ? [best.point, ...path.slice(bestIndex + 1)] : [point, ...path];
}

// Smallest angle between two bearings, 0..180.
export const angleBetween = (a: number, b: number) => {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
};

// Evenly spaced points along a line (by distance), for the demo trip to drive along roads.
export function pointsAlong(path: LatLng[], count: number): LatLng[] {
  if (path.length === 0 || count <= 0) return [];
  if (path.length === 1) return Array.from({ length: count }, () => path[0]);
  const lengths = path.slice(1).map((p, i) => {
    const a = toXY(path[i], path[0]);
    const b = toXY(p, path[0]);
    return Math.hypot(b.x - a.x, b.y - a.y);
  });
  const total = lengths.reduce((s, l) => s + l, 0);
  const out: LatLng[] = [];
  for (let k = 1; k <= count; k++) {
    let target = (total * k) / count;
    let i = 0;
    while (i < lengths.length - 1 && target > lengths[i]) target -= lengths[i++];
    const t = lengths[i] === 0 ? 1 : Math.min(1, target / lengths[i]);
    out.push({
      latitude: path[i].latitude + (path[i + 1].latitude - path[i].latitude) * t,
      longitude: path[i].longitude + (path[i + 1].longitude - path[i].longitude) * t,
    });
  }
  return out;
}
