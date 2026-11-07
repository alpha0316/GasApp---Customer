import { amountFields, groupUnits } from '../orderPlan';
import { resolvePickupTime } from '../pickup';

describe('groupUnits', () => {
  it('merges units with the same size and amount into one order', () => {
    const groups = groupUnits([
      { size: 'small', fullFill: false, gasAmount: 2000 },
      { size: 'small', fullFill: false, gasAmount: 2000 },
      { size: 'medium', fullFill: true, gasAmount: 500 },
    ]);
    expect(groups).toHaveLength(2);
    expect(groups[0]).toMatchObject({ size: 'small', cylinderCount: 2, gasAmount: 2000 });
    expect(groups[1]).toMatchObject({ size: 'medium', fullFill: true, cylinderCount: 1 });
  });

  it('keeps different amounts of one size in separate orders', () => {
    const groups = groupUnits([
      { size: 'small', fullFill: false, gasAmount: 2000 },
      { size: 'small', fullFill: false, gasAmount: 3000 },
    ]);
    expect(groups).toHaveLength(2);
  });

  it('splits at the API limit of 10 cylinders per order', () => {
    const units = Array.from({ length: 11 }, () => ({ size: 'small' as const, fullFill: true, gasAmount: 0 }));
    const groups = groupUnits(units);
    expect(groups.map((g) => g.cylinderCount)).toEqual([10, 1]);
  });

  it('sends fullFill or gasAmount, never both', () => {
    const [full, part] = groupUnits([
      { size: 'small', fullFill: true, gasAmount: 2000 },
      { size: 'medium', fullFill: false, gasAmount: 2000 },
    ]);
    expect(amountFields(full)).toEqual({ fullFill: true });
    expect(amountFields(part)).toEqual({ gasAmount: 2000 });
  });
});

describe('resolvePickupTime', () => {
  const now = new Date('2026-11-05T10:00:00.000Z');

  it('returns now for instant pickup', () => {
    expect(resolvePickupTime('instantly', null, null, 0, now)).toBe(now.toISOString());
  });

  it('returns an ISO string with a Z offset for tomorrow', () => {
    const iso = resolvePickupTime('tomorrow', null, 9, 30, now);
    expect(iso).toMatch(/Z$/);
    expect(Date.parse(iso)).toBeGreaterThan(now.getTime());
  });

  it('never returns a time in the past', () => {
    const past = new Date('2026-11-01T00:00:00.000Z');
    expect(resolvePickupTime('custom', past, 8, 0, now)).toBe(now.toISOString());
  });
});
