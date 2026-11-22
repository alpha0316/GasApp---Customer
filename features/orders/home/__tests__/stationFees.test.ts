import { buildRiderInstructions, stationExtraFee } from '../constants';

const fmt = (minor: number) => `GH ${minor / 100}`;

describe('stationExtraFee', () => {
  it('is free for the closest station and anything within half a km of it', () => {
    expect(stationExtraFee(2, 2)).toBe(0);
    expect(stationExtraFee(2.4, 2)).toBe(0);
  });

  it('adds a surcharge in bands for farther stations', () => {
    expect(stationExtraFee(3, 2)).toBe(1000); // 0.5 km past the free radius
    expect(stationExtraFee(4, 2)).toBe(2000);
    expect(stationExtraFee(9, 2)).toBe(3000);
  });
});

describe('buildRiderInstructions', () => {
  it('names the chosen station and the extra cash to collect', () => {
    const text = buildRiderInstructions({ stationName: 'Shell Lapaz', stationExtra: 1000, rubberChange: false, rubberFee: 2000, formatMoney: fmt });
    expect(text).toBe('Customer chose Shell Lapaz (farther than the closest station). Collect GH 10 extra delivery in cash.');
  });

  it('adds the rubber change on its own line', () => {
    const text = buildRiderInstructions({ stationName: 'Goil Kaneshie', stationExtra: 0, rubberChange: true, rubberFee: 2000, formatMoney: fmt });
    expect(text?.split('\n')).toEqual([
      'Customer chose Goil Kaneshie.',
      'Customer requested a cylinder rubber (gasket) change. Collect GH 20 in cash for it.',
    ]);
  });

  it('is undefined with nothing to say', () => {
    expect(buildRiderInstructions({ stationName: null, stationExtra: 0, rubberChange: false, rubberFee: 2000, formatMoney: fmt })).toBeUndefined();
  });
});
