import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type MapView from 'react-native-maps';
import * as Location from 'expo-location';
import { getCachedAddress, getCachedCoords, primeLocation } from '@/lib/locationStore';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from './constants';

interface Coords {
  latitude: number;
  longitude: number;
}

const regionFor = (coords: Coords) => ({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 });

// The customer's position, the address label and the map camera that follows them.
export function useHomeLocation() {
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState(() => {
    const cached = getCachedCoords();
    return regionFor({
      latitude: cached?.latitude ?? DEFAULT_LATITUDE,
      longitude: cached?.longitude ?? DEFAULT_LONGITUDE,
    });
  });
  const [userLocation, setUserLocation] = useState<Coords>(() => {
    const cached = getCachedCoords();
    return {
      latitude: cached?.latitude ?? DEFAULT_LATITUDE,
      longitude: cached?.longitude ?? DEFAULT_LONGITUDE,
    };
  });
  const [currentLocation, setCurrentLocation] = useState(() => getCachedAddress() ?? 'Locating…');

  const moveTo = (coords: Coords) => {
    setUserLocation(coords);
    const next = regionFor(coords);
    setRegion(next);
    mapRef.current?.animateToRegion(next, 500);
  };

  useEffect(() => {
    // Splash already kicked this off (or it's cached from a previous
    // mount) — this just picks up whatever primeLocation resolves to,
    // instead of running its own separate permission/GPS/geocode sequence.
    (async () => {
      const coords = await primeLocation();
      if (!coords) {
        setCurrentLocation((prev) => (prev === 'Locating…' ? 'Location permission denied' : prev));
        return;
      }
      moveTo(coords);
      setCurrentLocation(getCachedAddress() ?? 'Custom Location');
    })();
  }, []);

  const updateAddress = async ({ latitude, longitude }: Coords) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      setCurrentLocation(
        address ? `${address.street || address.name || ''}, ${address.city || ''}`.replace(/^, /, '') : 'Custom Location',
      );
    } catch {
      setCurrentLocation('Custom Location');
    }
  };

  const refocus = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission needed', 'Enable location access in Settings to use your current location.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      moveTo(coords);
      void updateAddress(coords);
    } catch {
      Alert.alert('Unable to get your location', 'Make sure location services are enabled and try again.');
    }
  };

  const selectPreset = (loc: { name: string; latitude: number; longitude: number }) => {
    moveTo({ latitude: loc.latitude, longitude: loc.longitude });
    setCurrentLocation(loc.name);
  };

  return { mapRef, region, setRegion, userLocation, currentLocation, refocus, selectPreset };
}
