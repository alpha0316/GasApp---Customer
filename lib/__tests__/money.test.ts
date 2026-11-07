import { displayMoney, majorToMinor } from '../money';

describe('money', () => {
  it('shows pesewas as GH major units', () => {
    expect(displayMoney(1250, 'GHS')).toBe('GH 12.50');
  });

  it('parses whole major amounts into integer pesewas', () => {
    expect(majorToMinor('20')).toBe(2000);
    expect(majorToMinor('2.5')).toBeNull();
    expect(majorToMinor('abc')).toBeNull();
  });
});
