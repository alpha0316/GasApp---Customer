import { displayMoney, majorToMinor, roundBreakdown, roundToMajor } from '../money';

describe('money', () => {
  it('shows whole cedis, rounded to the nearest', () => {
    expect(displayMoney(7439, 'GHS')).toBe('GH 74');
    expect(displayMoney(7450, 'GHS')).toBe('GH 75');
    expect(displayMoney(123400, 'GHS')).toBe('GH 1,234');
  });

  it('rounds to whole cedis', () => {
    expect(roundToMajor(7439)).toBe(7400);
    expect(roundToMajor(7461)).toBe(7500);
  });

  it('rounds bill lines so they add up to the rounded total', () => {
    // 70 + 3.39 + 1.45 = 74.84 -> 75; plain rounding would show 70 + 3 + 1 = 74.
    const lines = roundBreakdown([7000, 339, 145]);
    expect(lines).toEqual([7000, 300, 200]); // the extra cedi goes to the larger remainder (.45)
    expect(lines.reduce((a, b) => a + b, 0)).toBe(7500);
  });

  it('leaves whole amounts alone', () => {
    expect(roundBreakdown([5000, 1000, 200])).toEqual([5000, 1000, 200]);
  });

  it('parses whole major amounts into integer pesewas', () => {
    expect(majorToMinor('20')).toBe(2000);
    expect(majorToMinor('2.5')).toBeNull();
    expect(majorToMinor('abc')).toBeNull();
  });
});
