import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

let cachedCoords: Coords | null = null;
let cachedAddress: string | null = null;
let primePromise: Promise<Coords | null> | null = null;

export function getCachedCoords(): Coords | null {
  return cachedCoords;
}

export function getCachedAddress(): string | null {
  return cachedAddress;
}

// Kicks off the location-permission request, GPS fix, and reverse geocode
// as early as possible — called from the splash screen so the fetch is
// already in flight (or done) by the time Home mounts, instead of Home
// starting from scratch and sitting on the default fallback coordinates
// while it waits. Idempotent/cached: a second caller (Home's own effect)
// just gets the same in-flight promise or the already-resolved result.
export function primeLocation(): Promise<Coords | null> {
  if (cachedCoords) return Promise.resolve(cachedCoords);
  if (primePromise) return primePromise;

  primePromise = (async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return null;

      const location = await Location.getCurrentPositionAsync({});
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      cachedCoords = coords;

      try {
        const [address] = await Location.reverseGeocodeAsync(coords);
        cachedAddress = address
          ? `${address.street || address.name || ''}, ${address.city || ''}`.replace(/^, /, '')
          : null;
      } catch {
        cachedAddress = null;
      }

      return coords;
    } catch {
      return null;
    } finally {
      primePromise = null;
    }
  })();

  return primePromise;
}
