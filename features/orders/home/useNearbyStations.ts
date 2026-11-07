import { useState } from 'react';
import { useStations } from '@/features/catalog/hooks';
import { useRoute } from '@/features/tracking/hooks';
import { fromGeoPoint, haversineKm } from '@/lib/geo';
import { MAX_STATIONS_SHOWN, STATION_LOGOS } from './constants';

interface Coords {
  latitude: number;
  longitude: number;
}

// The server prices the order from the nearest station in the customer's area.
// This list is for the map and for choosing where to look; it shows the closest few.
export function useNearbyStations(userLocation: Coords) {
  const stationsQuery = useStations();
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const stations = (stationsQuery.data ?? [])
    .filter((st) => st.isActive)
    .map((st) => {
      const coords = fromGeoPoint(st.location);
      return {
        key: st.id,
        name: st.name,
        color: '#007AFF',
        logo: STATION_LOGOS.find((l) => l.match.test(st.name))?.logo,
        ...coords,
        distanceKm: haversineKm(userLocation, coords),
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, MAX_STATIONS_SHOWN);

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

  return { stations, selectedStation, setSelectedStation, routeTarget, routePath };
}

export type NearbyStation = ReturnType<typeof useNearbyStations>['stations'][number];
