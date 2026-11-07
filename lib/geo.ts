export type LatLng = { latitude: number; longitude: number };

// Display-only distance (never used for pricing: the server prices by distance).
export const haversineKm = (a: LatLng, b: LatLng) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
};

// GeoJSON points are [lng, lat]; maps and the API bodies want lat/lng.
export const fromGeoPoint = (p: { coordinates: [number, number] }): LatLng => ({
  latitude: p.coordinates[1],
  longitude: p.coordinates[0],
});
