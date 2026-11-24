import * as Location from 'expo-location';
import type { LatLng } from '@/lib/geo';

export interface PlaceResult {
  id: string;
  name: string;
  // The rest of the address, e.g. "Achimota, Accra".
  detail: string;
  latitude: number;
  longitude: number;
}

// Photon (komoot) searches OpenStreetMap and is built for search-as-you-type, unlike Nominatim.
// Results are biased towards the map's centre and limited to Ghana.
const PHOTON_URL = 'https://photon.komoot.io/api/';
const USER_AGENT = 'GasApp-Customer/1.0';

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id?: number;
    name?: string;
    street?: string;
    housenumber?: string;
    district?: string;
    locality?: string;
    city?: string;
    county?: string;
    state?: string;
    countrycode?: string;
  };
}

export function formatPhoton(f: PhotonFeature, index: number): PlaceResult | null {
  const p = f.properties;
  const street = [p.housenumber, p.street].filter(Boolean).join(' ');
  const name = p.name || street;
  if (!name) return null;
  const detail = [p.name ? street : null, p.district || p.locality, p.city || p.county, p.state]
    .filter((part, i, all): part is string => !!part && part !== name && all.indexOf(part) === i)
    .join(', ');
  const [longitude, latitude] = f.geometry.coordinates;
  return { id: `${p.osm_id ?? 'x'}-${index}`, name, detail, latitude, longitude };
}

export async function searchPlaces(query: string, near: LatLng | null, signal?: AbortSignal): Promise<PlaceResult[]> {
  // bbox: Ghana (west, south, east, north).
  const params = new URLSearchParams({ q: query, limit: '8', lang: 'en', bbox: '-3.3,4.7,1.2,11.2' });
  if (near) {
    params.set('lat', String(near.latitude));
    params.set('lon', String(near.longitude));
  }
  const res = await fetch(`${PHOTON_URL}?${params}`, { signal, headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = (await res.json()) as { features: PhotonFeature[] };
  return data.features
    .filter((f) => !f.properties.countrycode || f.properties.countrycode.toUpperCase() === 'GH')
    .map(formatPhoton)
    .filter((r): r is PlaceResult => r !== null);
}

// A short address for a map point, from the phone's own geocoder.
export async function addressFor(point: LatLng): Promise<string> {
  try {
    const [a] = await Location.reverseGeocodeAsync(point);
    if (!a) return 'Pinned location';
    const first = a.name && a.name !== a.street ? a.name : [a.streetNumber, a.street].filter(Boolean).join(' ');
    return [first || a.district, a.city || a.subregion].filter(Boolean).join(', ') || 'Pinned location';
  } catch {
    return 'Pinned location';
  }
}
