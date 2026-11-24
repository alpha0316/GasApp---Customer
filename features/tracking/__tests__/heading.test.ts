import { angleBetween, bearingBetween, pointsAlong, remainingPath, snapToPath } from '../heading';

// A road running due east, then due north (~110 m per 0.001 deg).
const road = [
  { latitude: 5.6, longitude: -0.2 },
  { latitude: 5.6, longitude: -0.198 },
  { latitude: 5.602, longitude: -0.198 },
];

describe('heading', () => {
  it('measures compass bearings', () => {
    expect(bearingBetween(road[0], road[1])).toBeCloseTo(90, 0);
    expect(bearingBetween(road[1], road[2])).toBeCloseTo(0, 0);
    expect(angleBetween(350, 10)).toBe(20);
    expect(angleBetween(90, 270)).toBe(180);
  });

  it('snaps a drifting GPS point onto the nearby road and reports its direction', () => {
    const snapped = snapToPath({ latitude: 5.6002, longitude: -0.199 }, road); // ~22 m north of the first leg
    expect(snapped).not.toBeNull();
    expect(snapped!.point.latitude).toBeCloseTo(5.6, 6);
    expect(snapped!.segmentBearing).toBeCloseTo(90, 0);
  });

  it('leaves a rider on another road where they are', () => {
    expect(snapToPath({ latitude: 5.601, longitude: -0.199 }, road)).toBeNull(); // ~110 m away
  });

  it('spaces demo points evenly along the road, ending at its end', () => {
    const pts = pointsAlong(road, 4);
    expect(pts).toHaveLength(4);
    // Half way is (within a metre of) the corner: the east leg is slightly shorter than the north one.
    expect(pts[1].latitude).toBeCloseTo(5.6, 4);
    expect(pts[1].longitude).toBeCloseTo(-0.198, 4);
    expect(pts[3]).toEqual(road[2]);
  });

  it('trims the route to start where the rider is', () => {
    // Half way along the first (eastbound) leg, a little north of it.
    const ahead = remainingPath(road, { latitude: 5.6001, longitude: -0.199 });
    expect(ahead).toHaveLength(3);
    expect(ahead[0].latitude).toBeCloseTo(5.6, 6);
    expect(ahead[0].longitude).toBeCloseTo(-0.199, 6);
    expect(ahead.slice(1)).toEqual(road.slice(1));
    // Off the road: joins at the start.
    expect(remainingPath(road, { latitude: 5.59, longitude: -0.21 })[1]).toEqual(road[0]);
  });
});
