import React, { useEffect } from 'react';
import { TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, UrlTile, type Region } from 'react-native-maps';
import { SvgXml } from 'react-native-svg';
import { Crosshair } from 'phosphor-react-native';
import { MAP_TILE_URL } from '@/lib/mapTiles';
import { LOCATION_MARKER_XML } from '@/components/icons/BrandIcons';
import StationPinIcon from '@/components/StationPinIcon';
import AppMenuButton from '@/components/AppMenu';
import { styles } from '@/features/orders/screens/homeStyles';
import type { NearbyStation } from './useNearbyStations';

interface Coords {
  latitude: number;
  longitude: number;
}

interface Props {
  mapRef: React.RefObject<MapView | null>;
  region: Region;
  onRegionChange: (region: Region) => void;
  userLocation: Coords;
  stations: NearbyStation[];
  routeTarget: NearbyStation | null;
  routePath: Coords[] | null;
  // True on the station step: the camera frames the customer and the chosen station.
  frameRoute: boolean;
  topInset: number;
  onRefocus: () => void;
}

export default function HomeMap({
  mapRef,
  region,
  onRegionChange,
  userLocation,
  stations,
  routeTarget,
  routePath,
  frameRoute,
  topInset,
  onRefocus,
}: Props) {
  const targetLat = routeTarget?.latitude;
  const targetLng = routeTarget?.longitude;
  const { latitude, longitude } = userLocation;

  // Smoothly fly the camera to frame the user and the selected station
  // whenever the station changes, instead of leaving the map wherever it
  // was while the panel/route silently update underneath it.
  useEffect(() => {
    if (!frameRoute || targetLat === undefined || targetLng === undefined) return;
    const points = [
      { latitude, longitude },
      { latitude: targetLat, longitude: targetLng },
    ];
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: topInset + 80, left: 60, right: 60, bottom: 420 },
        animated: true,
      });
    }, 50);
    return () => clearTimeout(timer);
  }, [mapRef, frameRoute, targetLat, targetLng, latitude, longitude, topInset]);

  return (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={onRegionChange}
        userInterfaceStyle="light"
      >
        <UrlTile urlTemplate={MAP_TILE_URL} maximumZ={20} tileSize={256} />

        <Marker coordinate={userLocation} title="You" anchor={{ x: 0.5, y: 1 }}>
          <SvgXml xml={LOCATION_MARKER_XML} width={34} height={55} />
        </Marker>

        {stations.map((s) => {
          const isSelected = s.key === routeTarget?.key;
          return (
            <Marker
              key={s.key}
              coordinate={{ latitude: s.latitude, longitude: s.longitude }}
              title={s.name}
              anchor={{ x: 0.5, y: 0.96 }}
            >
              <View style={isSelected ? styles.stationPinSelectedShadow : undefined}>
                <StationPinIcon selected={isSelected} />
              </View>
            </Marker>
          );
        })}

        {routeTarget && (
          <Polyline
            coordinates={routePath ?? [userLocation, { latitude: routeTarget.latitude, longitude: routeTarget.longitude }]}
            strokeColor="#0088FF"
            strokeWidth={4}
            lineDashPattern={routePath ? undefined : [8, 8]}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      <View style={[styles.mapTopBar, { top: topInset + 4 }]}>
        <AppMenuButton active="home" />
        <TouchableOpacity style={styles.mapIconButton} onPress={onRefocus}>
          <Crosshair size={20} color="#000" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
