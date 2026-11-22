import { driveSeconds, fillSeconds, formatEtaRange, makeEta, remainingFillSeconds, smoothSeconds, trafficAt } from '../eta';

// Accra is UTC+0, so these UTC times are local times.
const at = (iso: string) => new Date(iso);

describe('trafficAt', () => {
  it('is heavy in the weekday rush hours', () => {
    expect(trafficAt(at('2026-11-23T07:30:00Z')).level).toBe('heavy'); // Monday morning
    expect(trafficAt(at('2026-11-23T17:15:00Z')).level).toBe('heavy'); // Monday evening
  });

  it('is light late at night and on Sunday', () => {
    expect(trafficAt(at('2026-11-23T23:00:00Z')).level).toBe('light');
    expect(trafficAt(at('2026-11-22T17:00:00Z')).level).toBe('light'); // Sunday
  });
});

describe('driveSeconds', () => {
  const rush = at('2026-11-23T17:15:00Z'); // factor 1.7

  it('adds the full traffic penalty for cars', () => {
    expect(driveSeconds(600, rush, 'car')).toBeCloseTo(1020);
  });

  it('adds half the penalty for motorbikes, which filter through jams', () => {
    expect(driveSeconds(600, rush, 'motorbike')).toBeCloseTo(810);
  });

  it('leaves free-flow time alone at night', () => {
    expect(driveSeconds(600, at('2026-11-23T23:00:00Z'), 'car')).toBe(600);
  });
});

describe('fill time', () => {
  it('adds time for each extra cylinder', () => {
    expect(fillSeconds(2) - fillSeconds(1)).toBe(180);
  });

  it('counts down from when filling started but never below 2 minutes', () => {
    const start = at('2026-11-23T10:00:00Z');
    expect(remainingFillSeconds(1, start, at('2026-11-23T10:04:00Z'))).toBe(fillSeconds(1) - 240);
    expect(remainingFillSeconds(1, start, at('2026-11-23T11:00:00Z'))).toBe(120);
  });
});

describe('makeEta', () => {
  it('rounds to whole minutes with a range around the average', () => {
    const eta = makeEta(540, at('2026-11-23T23:00:00Z'));
    expect(eta.minutes).toBe(9);
    expect(eta.low).toBe(7);
    expect(eta.high).toBe(11);
    expect(formatEtaRange(eta)).toBe('7–11 min');
  });

  it('never shows less than a minute', () => {
    expect(makeEta(10, new Date()).minutes).toBe(1);
  });
});

it('smoothSeconds blends readings so the ETA does not jump', () => {
  expect(smoothSeconds(null, 300)).toBe(300);
  expect(smoothSeconds(600, 300)).toBe(480);
});
