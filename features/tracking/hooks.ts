import { useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { getRoute, type RouteEndpoints } from './api';

export type LatLng = { latitude: number; longitude: number };

// Returns the road line as map coordinates, or null while loading / when routing is off.
// The caller draws a straight dashed line for null.
export function useRoute(endpoints: RouteEndpoints | null) {
  const query = useQuery({
    queryKey: ['route', endpoints],
    queryFn: () => getRoute(endpoints!),
    enabled: endpoints !== null,
    staleTime: 5 * 60_000,
    retry: (count, error) => !(error instanceof ApiError && error.status === 503) && count < 1,
  });
  // GeoJSON is [lng, lat]; react-native-maps wants { latitude, longitude }.
  const path: LatLng[] | null = query.data
    ? query.data.geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng }))
    : null;
  return { path, route: query.data ?? null };
}
