import { formatPhoton } from '../geocode';
import { orderedPlaces, type SavedPlace } from '../store';

jest.mock('expo-location', () => ({ reverseGeocodeAsync: jest.fn() }));
jest.mock('expo-secure-store', () => ({}));

const place = (id: string, slot?: 'home' | 'work'): SavedPlace => ({
  id,
  slot,
  label: id,
  icon: 'star',
  address: '',
  latitude: 0,
  longitude: 0,
});

describe('saved places', () => {
  it('puts Home and Work in their slots and keeps the rest in order', () => {
    const { home, work, others } = orderedPlaces([place('a'), place('w', 'work'), place('b'), place('h', 'home')]);
    expect(home?.id).toBe('h');
    expect(work?.id).toBe('w');
    expect(others.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('formats a search result as a name with the rest of its address', () => {
    const r = formatPhoton(
      { geometry: { coordinates: [-0.2, 5.6] }, properties: { osm_id: 1, name: 'Achimota Mall', street: 'Achimota Rd', city: 'Accra', state: 'Greater Accra', countrycode: 'GH' } },
      0,
    );
    expect(r).toEqual({ id: '1-0', name: 'Achimota Mall', detail: 'Achimota Rd, Accra, Greater Accra', latitude: 5.6, longitude: -0.2 });
  });

  it('names a nameless result by its street, and skips results with neither', () => {
    expect(formatPhoton({ geometry: { coordinates: [0, 0] }, properties: { housenumber: '12', street: 'Oxford St', city: 'Accra' } }, 1)?.name).toBe('12 Oxford St');
    expect(formatPhoton({ geometry: { coordinates: [0, 0] }, properties: { city: 'Accra' } }, 2)).toBeNull();
  });
});
