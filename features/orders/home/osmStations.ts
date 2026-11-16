import type { LatLng } from '@/lib/geo';

export interface OsmStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

// Public, free, no API key — OpenStreetMap's query API. Looked up directly from the
// device (not proxied through our backend, unlike /routing) since it needs no secret
// and the free instance is meant for exactly this kind of light, ad-hoc lookup.
// Several independent mirrors are tried in order — the main overpass-api.de instance
// is frequently overloaded/unreachable on its own, which was showing up as a hard
// "couldn't reach the map service" error even though the data was available elsewhere.
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter',
];

// Overpass's usage policy asks automated clients to self-identify with a descriptive
// User-Agent naming the app — requests without one are rejected (406) by its bot
// protection, which is what was happening before this was added.
const USER_AGENT = 'GasApp-Customer/1.0';

// Kept tight by default — a narrower radius means a much smaller response and a much
// faster Overpass query, and we only widen it (below) if that comes back empty.
const SEARCH_RADIUS_M = 8_000;
// Fallback used only when the tight radius finds nothing, to still reliably surface a
// handful of real stations outside dense parts of Accra.
const WIDE_SEARCH_RADIUS_M = 20_000;

// Overpass's own query timeout, kept short since a tighter radius never needs 25s to
// compute. A client-side AbortController timeout wraps the whole call separately, so a
// slow/unreachable server fails fast instead of leaving the picker stuck loading.
const SERVER_TIMEOUT_S = 10;
const CLIENT_TIMEOUT_MS = 8_000;

// Hand-verified stations in the Sowutuom/Ofankor service area, used only as a last
// resort when the live Overpass lookup fails outright (all mirrors unreachable/erroring)
// — so the picker still shows real, named stations instead of a dead-end error screen.
// Coordinates were manually confirmed; everything else from the same research (stations
// with no verified lat/lng) was left out since it can't be placed on the map or sorted
// by distance.
const FALLBACK_STATIONS: OsmStation[] = [
  { id: 'fallback/total-sowutuom-mambo', name: 'TotalEnergies, Sowutuom Mambo', latitude: 5.626067, longitude: -0.264176 },
  { id: 'fallback/shell-sowutuom', name: 'Shell, Sowutuom', latitude: 5.6235, longitude: -0.27998 },
  { id: 'fallback/goil-ofankor', name: 'GOIL, Ofankor', latitude: 5.65759, longitude: -0.27868 },
  { id: 'fallback/totalenergies-ofankor', name: 'TotalEnergies, Ofankor', latitude: 5.65535, longitude: -0.26301 },
];

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: { name?: string; brand?: string; operator?: string };
}

async function queryOverpassUrl(url: string, query: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain', 'User-Agent': USER_AGENT },
      body: query,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function runOverpassQuery(point: LatLng, radiusM: number): Promise<OsmStation[]> {
  const { latitude: lat, longitude: lng } = point;
  const query = `[out:json][timeout:${SERVER_TIMEOUT_S}];(node["amenity"="fuel"](around:${radiusM},${lat},${lng});way["amenity"="fuel"](around:${radiusM},${lat},${lng}););out center tags;`;

  let res: Response | undefined;
  let lastError: unknown;

  // Each mirror is an independent server, so a timeout/outage on one shouldn't surface
  // as a hard failure — try the rest before giving up.
  for (const url of OVERPASS_URLS) {
    try {
      const attempt = await queryOverpassUrl(url, query);
      if (attempt.ok) {
        res = attempt;
        break;
      }
      lastError = new Error(`Overpass mirror ${url} responded with ${attempt.status}`);
    } catch (err) {
      lastError = err;
    }
  }

  if (!res) throw lastError instanceof Error ? lastError : new Error('Could not reach the map data service.');

  const data = (await res.json()) as { elements?: OverpassElement[] };
  const seen = new Set<string>();
  const stations: OsmStation[] = [];

  for (const el of data.elements ?? []) {
    const name = el.tags?.name || el.tags?.brand;
    if (!name) continue;

    const coords = el.type === 'node' ? { lat: el.lat, lng: el.lon } : el.center ? { lat: el.center.lat, lng: el.center.lon } : null;
    if (coords?.lat == null || coords.lng == null) continue;

    // Nodes and ways can both represent the same real-world pump; collapse anything
    // with the same name within ~50m of each other.
    const dedupeKey = `${name.toLowerCase()}:${coords.lat.toFixed(3)}:${coords.lng.toFixed(3)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    stations.push({ id: `${el.type}/${el.id}`, name, latitude: coords.lat, longitude: coords.lng });
  }

  return stations;
}

// Real, named fuel/gas filling stations near a point, straight from OpenStreetMap —
// so the name shown is an actual company (Shell, Goil, TotalEnergies, ...), not a
// placeholder. Stations with no name/brand tag in OSM are dropped rather than shown
// under a generic label. Tries the tight radius first for speed, and only falls back
// to the wider one if that finds nothing (e.g. outside a dense city area).
export async function fetchNearbyFuelStations(point: LatLng): Promise<OsmStation[]> {
  try {
    const nearby = await runOverpassQuery(point, SEARCH_RADIUS_M);
    if (nearby.length > 0) return nearby;
    const wide = await runOverpassQuery(point, WIDE_SEARCH_RADIUS_M);
    return wide.length > 0 ? wide : FALLBACK_STATIONS;
  } catch {
    // All Overpass mirrors failed outright (unreachable/erroring) — fall back to the
    // hand-verified local list rather than surfacing a dead-end error screen.
    return FALLBACK_STATIONS;
  }
}
