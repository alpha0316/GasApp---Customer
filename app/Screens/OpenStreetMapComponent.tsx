import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Linking,
  Dimensions,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import Svg, { Path, Circle } from 'react-native-svg';
// import 'mapbox-gl/dist/mapbox-gl.css';
// import Map, { GeolocateControl, NavigationControl } from 'react-map-gl';




const LocationIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-1-13h2v4h4v2h-4v4h-2v-4H7v-2h4V7z"
      fill="#000"
    />
  </Svg>
);



interface Coordinates {
  latitude: number;
  longitude: number;
}

function OpenStreetMapComponent() {
  const mapRef = useRef<MapView>(null);

  const DEFAULT_LONGITUDE = -1.573568; // Kumasi, Ghana
  const DEFAULT_LATITUDE = 6.678045;
  const DEFAULT_ZOOM = 14.95;
  const TRANSITION_DURATION = 500;

  const [region, setRegion] = useState({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isMapReady, setIsMapReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Coordinates | null>(null);
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);

  useEffect(() => {
    console.log('Initial region:', region); // Debug initial region
    let locationSubscription: Location.LocationSubscription | null = null;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission denied. Using default coordinates.');
        mapRef.current?.animateToRegion(region, TRANSITION_DURATION);
        return;
      }

      try {
        // Get initial location
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        const newRegion = {
          ...coords,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        console.log('Initial geolocation success:', newRegion); // Debug initial geolocation
        setRegion(newRegion);
        setUserLocation(coords);
        mapRef.current?.animateToRegion(newRegion, TRANSITION_DURATION);

        // Subscribe to location updates
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // Update every 1 second
            distanceInterval: 10, // Update every 10 meters
          },
          (location) => {
            const coords = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setUserLocation(coords);
            console.log('Location update:', coords); // Debug location updates
          }
        );
      } catch (error) {
        console.error('Geolocation error:', error);
        setUserLocation(null); // Ensure userLocation is null on error
        mapRef.current?.animateToRegion(region, TRANSITION_DURATION);
      }
    })();

    // Cleanup subscription on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, []);

  

  const handleRefocusLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access location was denied.');
      mapRef.current?.animateToRegion(region, TRANSITION_DURATION);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      const newRegion = {
        ...coords,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      console.log('Refocus region:', newRegion); // Debug refocus
      setRegion(newRegion);
      setUserLocation(coords);
      mapRef.current?.animateToRegion(newRegion, TRANSITION_DURATION);
    } catch (error) {
      console.error('Refocus error:', error);
      alert('Failed to get current location.');
      setUserLocation(null);
      mapRef.current?.animateToRegion(region, TRANSITION_DURATION);
    }
  };

  const handleMapReady = () => {
    setIsMapReady(true);
    console.log('Map ready, setting region:', region); // Debug map ready
    mapRef.current?.animateToRegion(region, TRANSITION_DURATION);
  };

  const handleMapPress = async (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    console.log('Selected location:', { latitude, longitude }); // Debug selected location

    // Reverse geocoding to get location info
    try {
      const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (place) {
        console.log('Location info:', {
          name: place.name,
          street: place.street,
          city: place.city,
          region: place.region,
          country: place.country,
          postalCode: place.postalCode,
          isoCountryCode: place.isoCountryCode,
        });
      } else {
        console.log('No location info found for these coordinates.');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Helper to check if coordinates are valid
  const isValidCoordinates = (coords: Coordinates | null): coords is Coordinates => {
    return (
      coords !== null &&
      typeof coords.latitude === 'number' &&
      typeof coords.longitude === 'number' &&
      !isNaN(coords.latitude) &&
      !isNaN(coords.longitude)
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={(newRegion) => {
          console.log('Region changed:', newRegion); // Debug region changes
          setRegion(newRegion);
        }}
        showsUserLocation={false} // Disable to use custom marker
        followsUserLocation={false} // Disable to prevent auto-centering
        onMapReady={handleMapReady}
        onPress={handleMapPress} // Handle map taps to place marker
      >
        {/* OpenStreetMap Tiles */}
        <UrlTile
          urlTemplate="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          tileSize={256}
        />

        {/* User Location Marker */}
        {isMapReady && isValidCoordinates(userLocation) && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="You are here"
          >
            <View style={styles.userMarker}>
              <Text style={styles.markerText}>You</Text>
            </View>
          </Marker>
        )}

        {/* Selected Location Marker */}
        {isMapReady && isValidCoordinates(selectedLocation) && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            title="Selected Location"
          >
          <Svg width="53" height="57" viewBox="0 0 53 57" fill="none">
            <Circle cx="26.0596" cy="31" r="26" fill="#1A1A1A" fillOpacity={0.2}/>
            <Path d="M26.0596 0C31.5824 0 36.0596 4.47715 36.0596 10C36.0596 15.1853 32.1128 19.4474 27.0596 19.9492V30C27.0596 30.5523 26.6119 31 26.0596 31C25.5073 31 25.0596 30.5523 25.0596 30V19.9492C20.0063 19.4474 16.0596 15.1853 16.0596 10C16.0596 4.47715 20.5367 0 26.0596 0Z" fill="#34A853"/>
            <Circle cx="26.0596" cy="10" r="5" fill="white"/>
          </Svg>
          </Marker>
        )}
      </MapView>

      {/* Refocus Button */}
      <TouchableOpacity
        style={styles.refocusButton}
        onPress={handleRefocusLocation}
        accessible={true}
        accessibilityLabel="Refocus map on current location"
      >
        <LocationIcon />
      </TouchableOpacity>

      {/* OSM Attribution */}
      <View style={styles.attribution}>
        <Text style={styles.attributionText}>
          Map data ©{' '}
          <Text
            style={styles.attributionLink}
            onPress={() => Linking.openURL('https://www.openstreetmap.org/copyright')}
          >
            OpenStreetMap
          </Text>{' '}
          contributors
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  refocusButton: {
    position: 'absolute',
    top: 20,
    right: 30,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  attribution: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 4,
    borderRadius: 4,
  },
  attributionText: {
    fontSize: 10,
    color: '#000',
  },
  attributionLink: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  userMarker: {
    backgroundColor: '#007AFF', // Blue for user location
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  selectedMarker: {
    backgroundColor: '#FF3B30', // Red for selected location
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default OpenStreetMapComponent;