import { isStalled, pushTrail, REAL_THRESHOLDS, tripCondition, type TrailPoint } from '../conditions';

const MIN = 60_000;
const at = (t: number, lat = 5.6, lng = -0.24): TrailPoint => ({ lat, lng, t });

describe('isStalled', () => {
  it('is true when the rider has not moved for the whole window', () => {
    const trail = [at(0), at(MIN), at(2 * MIN), at(2.5 * MIN)];
    expect(isStalled(trail, 2.5 * MIN, 2 * MIN)).toBe(true);
  });

  it('ignores a few metres of GPS drift', () => {
    const trail = [at(0), at(MIN, 5.60005), at(2.5 * MIN, 5.6001)]; // ~11 m
    expect(isStalled(trail, 2.5 * MIN, 2 * MIN)).toBe(true);
  });

  it('is false while the rider is moving', () => {
    const trail = [at(0), at(MIN, 5.601), at(2.5 * MIN, 5.602)]; // ~220 m
    expect(isStalled(trail, 2.5 * MIN, 2 * MIN)).toBe(false);
  });

  it('waits for the full window before calling it a stall', () => {
    expect(isStalled([at(0), at(30_000)], 30_000, 2 * MIN)).toBe(false);
  });
});

describe('tripCondition', () => {
  const still = [at(0), at(MIN), at(2.5 * MIN)];

  it('reports a queue after more than 5 minutes at the station', () => {
    const base = { trail: [], thresholds: REAL_THRESHOLDS, stationSince: 0 };
    expect(tripCondition('filling', { ...base, now: 4 * MIN })).toBeNull();
    expect(tripCondition('filling', { ...base, now: 6 * MIN })).toBe('queue');
  });

  it('reports traffic when the rider stands still on a driving leg', () => {
    const args = { trail: still, now: 2.5 * MIN, thresholds: REAL_THRESHOLDS, stationSince: null };
    expect(tripCondition('to_station', args)).toBe('traffic');
    expect(tripCondition('to_customer_dropoff', args)).toBe('traffic');
  });

  it('does not call slowing down near the door traffic', () => {
    const args = { trail: still, now: 2.5 * MIN, thresholds: REAL_THRESHOLDS, stationSince: null };
    expect(tripCondition('arriving_dropoff', args)).toBeNull();
  });
});

it('pushTrail drops points older than the window it needs', () => {
  const trail = pushTrail([at(0), at(5 * MIN)], at(6 * MIN), 4 * MIN);
  expect(trail.map((p) => p.t)).toEqual([5 * MIN, 6 * MIN]);
});
