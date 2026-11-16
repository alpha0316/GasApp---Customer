import { useEffect, useState } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { ApiError } from '@/lib/api/client';
import { useRoute } from '@/features/tracking/hooks';
import { getRoute } from '@/features/tracking/api';
import { haversineKm } from '@/lib/geo';
import { estimateDriveMinutes, MAX_STATIONS_SHOWN, STATION_LOGOS, stationFee } from './constants';
import { fetchNearbyFuelStations } from './osmStations';

interface Coords {
  latitude: number;
  longitude: number;
}

// Real, named nearby fuel/gas filling stations from OpenStreetMap (see
// ./osmStations) — this is what the picker shows and what the map pin/route line
// point at. It's informational: the server still assigns the actual fulfilling
// station itself, from the delivery point, when the order is placed — this screen
// never sends a station id.
//
// The per-station figure shown here is a display-only estimate — the same tiered,
// distance-from-the-closest-station banding the webapp uses (see stationFee in
// ./constants) — so the two apps show the same number. The real, binding total still
// only ever comes from POST /pricing/quote on the amount step.
export function useNearbyStations(userLocation: Coords) {
  // Rounded to ~111m so small GPS jitter doesn't refire the lookup, while still
  // refreshing once the user has actually moved somewhere new.
  const roundedLat = Math.round(userLocation.latitude * 1000) / 1000;
  const roundedLng = Math.round(userLocation.longitude * 1000) / 1000;

  const osmQuery = useQuery({
    queryKey: ['osm-fuel-stations', roundedLat, roundedLng],
    queryFn: () => fetchNearbyFuelStations({ latitude: roundedLat, longitude: roundedLng }),
    staleTime: 10 * 60_000,
    // One automatic retry: runOverpassQuery already tries multiple mirrors itself, but
    // a transient blip (e.g. a dropped mobile connection) is worth one extra attempt
    // before surfacing the error state to the user.
    retry: 1,
    retryDelay: 1_000,
  });

  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const found = osmQuery.data ?? [];
  const closestDistanceKm = found.reduce((min, st) => Math.min(min, haversineKm(userLocation, st)), Infinity);

  // Beeline distance only picks and prices the shortlist (fee banding is still
  // display-only and doesn't need road accuracy) — actual drive time, below, comes from
  // the real routed distance so what's shown matches the road the user will take.
  const candidates = found
    .map((st) => {
      const distanceKm = haversineKm(userLocation, st);
      return {
        key: st.id,
        name: st.name,
        color: '#007AFF',
        logo: STATION_LOGOS.find((l) => l.match.test(st.name))?.logo,
        latitude: st.latitude,
        longitude: st.longitude,
        distanceKm,
        estimatedFee: stationFee(distanceKm, closestDistanceKm),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_STATIONS_SHOWN);

  // One road-routed query per shortlisted station, via the backend (see ./api). Uses
  // the same queryKey shape as useRoute below, so when the route-target station is one
  // of these candidates (the usual case) that call hits this same cached result instead
  // of refetching.
  const routeQueries = useQueries({
    queries: candidates.map((c) => {
      const endpoints = { fromLat: userLocation.latitude, fromLng: userLocation.longitude, toLat: c.latitude, toLng: c.longitude };
      return {
        queryKey: ['route', endpoints],
        queryFn: () => getRoute(endpoints),
        staleTime: 5 * 60_000,
        // A 503 means routing is off entirely — retrying won't help, so don't.
        retry: (count: number, error: unknown) => !(error instanceof ApiError && error.status === 503) && count < 1,
      };
    }),
  });

  const stations = candidates.map((c, i) => {
    const route = routeQueries[i]?.data;
    // Falls back to a rough estimate from beeline distance while the real route is
    // still loading, or when routing is off — so a time always shows, never a blank.
    const durationMinutes = route ? route.durationSeconds / 60 : estimateDriveMinutes(c.distanceKm);
    return { ...c, durationMinutes };
  });

  // The lookup is async, so the closest station isn't known the instant the picker
  // opens — default to it as soon as it arrives, same as the webapp.
  useEffect(() => {
    if (!selectedStation && stations.length > 0) setSelectedStation(stations[0].key);
  }, [selectedStation, stations]);

  // Whichever station the route line should point at: the one the user has
  // picked in the station step, falling back to the closest one by default.
  const routeTarget = (selectedStation && stations.find((s) => s.key === selectedStation)) || stations[0] || null;

  // Road-following route from the user to the route-target station, via the backend.
  // Falls back to a straight dashed line while loading or when routing is off.
  const { path: routePath } = useRoute(
    routeTarget
      ? {
          fromLat: userLocation.latitude,
          fromLng: userLocation.longitude,
          toLat: routeTarget.latitude,
          toLng: routeTarget.longitude,
        }
      : null,
  );

  return {
    stations,
    selectedStation,
    setSelectedStation,
    routeTarget,
    routePath,
    isLoading: osmQuery.isLoading,
    isError: osmQuery.isError,
    refetch: osmQuery.refetch,
  };
}

export type NearbyStation = ReturnType<typeof useNearbyStations>['stations'][number];
