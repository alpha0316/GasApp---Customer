import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { UrlTile, type Region } from 'react-native-maps';
import { SvgXml } from 'react-native-svg';
import * as Location from 'expo-location';
import { useQuery } from '@tanstack/react-query';
import { Crosshair, MagnifyingGlass, MapPin, X } from 'phosphor-react-native';
import BackButton from '@/components/BackButton';
import PrimaryButton from '@/components/PrimaryButton';
import { LOCATION_MARKER_XML } from '@/components/icons/BrandIcons';
import { MAP_TILE_URL } from '@/lib/mapTiles';
import { getCachedCoords, primeLocation } from '@/lib/locationStore';
import { useDebounced } from '@/lib/useDebounced';
import type { LatLng } from '@/lib/geo';
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from '@/features/orders/home/constants';
import { addressFor, searchPlaces, type PlaceResult } from '@/features/places/geocode';
import { PLACE_ICONS } from '@/features/places/icons';
import { usePlacesStore, type PlaceIcon } from '@/features/places/store';
import type { RootStackParamList } from '@/types/navigation';

type Params = NonNullable<RootStackParamList['PlacePicker']>;

const PRIMARY = '#007AFF';
const ZOOM = { latitudeDelta: 0.004, longitudeDelta: 0.004 };
const SLOT_LABEL = { home: 'Home', work: 'Work' } as const;

// Pick a point for a saved place: the map opens on the customer (or the place being edited), the
// pin stays in the centre while they pan, tap or search, then they confirm and name it.
export default function PlacePicker() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { placeId, slot: slotParam } = (useRoute().params ?? {}) as Params;
  const { places, save, remove } = usePlacesStore();
  const editing = placeId ? places.find((p) => p.id === placeId) : undefined;
  const slot = editing?.slot ?? slotParam;

  const mapRef = useRef<MapView>(null);
  const start: LatLng = editing ?? getCachedCoords() ?? { latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE };
  const [center, setCenter] = useState<LatLng>(start);
  const [address, setAddress] = useState<string | null>(editing?.address ?? null);
  const [moving, setMoving] = useState(false);
  // A search result already names the spot, so the next camera stop skips the reverse geocode.
  const skipGeocode = useRef(!!editing);

  const [step, setStep] = useState<'pin' | 'details'>('pin');
  const [label, setLabel] = useState(editing?.label ?? (slot ? SLOT_LABEL[slot] : ''));
  const [icon, setIcon] = useState<PlaceIcon>(editing?.icon ?? slot ?? 'star');
  const [saving, setSaving] = useState(false);

  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const debouncedQuery = useDebounced(query.trim(), 400);
  const search = useQuery({
    queryKey: ['place-search', debouncedQuery, Math.round(center.latitude * 10), Math.round(center.longitude * 10)],
    queryFn: ({ signal }) => searchPlaces(debouncedQuery, center, signal),
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60_000,
  });
  const showResults = searchFocused && debouncedQuery.length >= 2;

  const flyTo = (point: LatLng) => mapRef.current?.animateToRegion({ ...point, ...ZOOM }, 500);

  // A new place opens on the customer. Wait for the GPS fix if the splash had not got one yet.
  useEffect(() => {
    if (editing || getCachedCoords()) return;
    void primeLocation().then((coords) => coords && flyTo(coords));
    // Runs once on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Name the spot under the pin once the map stops.
  useEffect(() => {
    if (moving) return;
    if (skipGeocode.current) {
      skipGeocode.current = false;
      return;
    }
    let cancelled = false;
    setAddress(null);
    void addressFor(center).then((a) => !cancelled && setAddress(a));
    return () => {
      cancelled = true;
    };
  }, [center, moving]);

  const onRegionChangeComplete = (r: Region) => {
    setMoving(false);
    setCenter({ latitude: r.latitude, longitude: r.longitude });
  };

  const pickResult = (r: PlaceResult) => {
    Keyboard.dismiss();
    setSearchFocused(false);
    setQuery('');
    skipGeocode.current = true;
    setAddress(r.detail ? `${r.name}, ${r.detail}` : r.name);
    if (!label && !slot) setLabel(r.name);
    flyTo(r);
  };

  const goToMe = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission needed', 'Enable location access in Settings to use your current location.');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({});
      flyTo({ latitude: coords.latitude, longitude: coords.longitude });
    } catch {
      Alert.alert('Unable to get your location', 'Make sure location services are enabled and try again.');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save({
        id: editing?.id,
        slot,
        label: label.trim(),
        icon: slot ?? icon,
        address: address ?? 'Pinned location',
        latitude: center.latitude,
        longitude: center.longitude,
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not save this place', error instanceof Error ? error.message : 'Please try again.');
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!editing) return;
    Alert.alert(`Remove ${editing.label}?`, 'It will no longer appear in your saved places.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          await remove(editing.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const title = editing ? `Edit ${editing.label}` : slot ? `Set ${SLOT_LABEL[slot].toLowerCase()} address` : 'Add a place';

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...start, ...ZOOM }}
        onRegionChange={() => !moving && setMoving(true)}
        onRegionChangeComplete={onRegionChangeComplete}
        // Tapping a spot moves the pin there.
        onPress={(e) => step === 'pin' && flyTo(e.nativeEvent.coordinate)}
        scrollEnabled={step === 'pin'}
        zoomEnabled={step === 'pin'}
        rotateEnabled={false}
        pitchEnabled={false}
        showsUserLocation
        showsMyLocationButton={false}
        userInterfaceStyle="light"
      >
        <UrlTile urlTemplate={MAP_TILE_URL} maximumZ={20} tileSize={256} />
      </MapView>

      {/* The pin is fixed in the centre; the map moves under it. Its tip marks the spot. */}
      <View pointerEvents="none" style={styles.pinLayer}>
        <View style={[styles.pin, moving && styles.pinLifted]}>
          <SvgXml xml={LOCATION_MARKER_XML} width={34} height={55} />
        </View>
        <View style={[styles.pinShadow, moving && styles.pinShadowLifted]} />
      </View>

      <View style={[styles.top, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <View style={styles.topRow}>
          <BackButton />
          {step === 'pin' && (
            <View style={styles.searchBox}>
              <MagnifyingGlass size={18} color="rgba(0,0,0,0.5)" />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                onFocus={() => setSearchFocused(true)}
                placeholder="Search for a place or street"
                placeholderTextColor="rgba(0,0,0,0.45)"
                returnKeyType="search"
                autoCorrect={false}
                accessibilityLabel="Search for a place"
              />
              {!!query && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
                  <X size={16} color="rgba(0,0,0,0.5)" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {showResults && step === 'pin' && (
          <View style={styles.results}>
            {search.isFetching && !search.data ? (
              <ActivityIndicator style={styles.resultsStatus} />
            ) : search.isError ? (
              <Text style={styles.resultsStatus}>Search is unavailable right now. Move the map to place the pin.</Text>
            ) : search.data?.length === 0 ? (
              <Text style={styles.resultsStatus}>No places match &quot;{debouncedQuery}&quot;.</Text>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.resultsScroll}>
                {search.data?.map((r) => (
                  <TouchableOpacity key={r.id} style={styles.result} onPress={() => pickResult(r)} accessibilityRole="button">
                    <MapPin size={18} color="rgba(0,0,0,0.45)" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.resultName} numberOfLines={1}>
                        {r.name}
                      </Text>
                      {!!r.detail && (
                        <Text style={styles.resultDetail} numberOfLines={1}>
                          {r.detail}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        )}
      </View>

      <View style={styles.bottom} pointerEvents="box-none">
        {step === 'pin' && (
          <TouchableOpacity style={styles.meButton} onPress={goToMe} accessibilityLabel="Go to my location">
            <Crosshair size={22} color="#000" weight="bold" />
          </TouchableOpacity>
        )}

        <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Text style={styles.cardTitle}>{step === 'pin' ? title : 'Name this place'}</Text>
          <View style={styles.addressRow}>
            <MapPin size={18} weight="fill" color={PRIMARY} />
            {address && !moving ? (
              <Text style={styles.address} numberOfLines={2}>
                {address}
              </Text>
            ) : (
              <Text style={[styles.address, styles.addressPending]}>{moving ? 'Move the map to place the pin' : 'Finding address…'}</Text>
            )}
          </View>

          {step === 'pin' ? (
            <PrimaryButton title="Confirm location" disabled={moving} onPress={() => setStep('details')} />
          ) : (
            <>
              {slot ? null : (
                <>
                  <TextInput
                    style={styles.nameInput}
                    value={label}
                    onChangeText={setLabel}
                    placeholder="e.g. Mum's house, Shop, Gym"
                    placeholderTextColor="rgba(0,0,0,0.4)"
                    maxLength={40}
                    autoFocus={!label}
                    accessibilityLabel="Place name"
                  />
                  <View style={styles.icons} accessibilityRole="radiogroup">
                    {PLACE_ICONS.map(({ key, label: iconLabel, Icon }) => {
                      const selected = icon === key;
                      return (
                        <TouchableOpacity
                          key={key}
                          style={styles.iconOption}
                          onPress={() => setIcon(key)}
                          accessibilityRole="radio"
                          accessibilityState={{ checked: selected }}
                          accessibilityLabel={iconLabel}
                        >
                          <View style={[styles.iconCircle, selected && styles.iconCircleOn]}>
                            <Icon size={22} color={selected ? '#fff' : '#4A4A4A'} weight={selected ? 'fill' : 'regular'} />
                          </View>
                          <Text style={[styles.iconLabel, selected && styles.iconLabelOn]}>{iconLabel}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </>
              )}
              <PrimaryButton
                title={saving ? 'Saving…' : 'Save place'}
                disabled={saving || (!slot && !label.trim())}
                onPress={handleSave}
              />
              <View style={styles.links}>
                <TouchableOpacity onPress={() => setStep('pin')} accessibilityRole="button" hitSlop={8}>
                  <Text style={styles.link}>Change location</Text>
                </TouchableOpacity>
                {editing && (
                  <TouchableOpacity onPress={handleDelete} accessibilityRole="button" hitSlop={8}>
                    <Text style={[styles.link, styles.linkDanger]}>Remove place</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const shadow = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 6,
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EEE' },
  pinLayer: { ...StyleSheet.absoluteFillObject, alignItems: 'center' },
  // The pin's tip (its bottom edge) sits exactly on the map's centre, which is what gets saved.
  pin: { position: 'absolute', top: '50%', marginTop: -55 },
  pinLifted: { transform: [{ translateY: -10 }] },
  pinShadow: { position: 'absolute', top: '50%', marginTop: -2, width: 10, height: 4, borderRadius: 5, backgroundColor: 'rgba(0,0,0,0.3)' },
  pinShadowLifted: { width: 14, opacity: 0.5 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, gap: 8 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchBox: {
    flex: 1,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 22,
    backgroundColor: '#fff',
    ...shadow,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#000', paddingVertical: 0 },
  results: { borderRadius: 16, backgroundColor: '#fff', overflow: 'hidden', maxHeight: 320, ...shadow },
  resultsScroll: { flexGrow: 0 },
  resultsStatus: { padding: 16, fontSize: 14, color: 'rgba(0,0,0,0.55)' },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  resultName: { fontSize: 15, fontWeight: '600', color: '#000' },
  resultDetail: { fontSize: 13, color: 'rgba(0,0,0,0.55)', marginTop: 1 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  meButton: {
    alignSelf: 'flex-end',
    marginRight: 16,
    marginBottom: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 14,
    ...shadow,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#000' },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 40 },
  address: { flex: 1, fontSize: 15, color: '#000', lineHeight: 20 },
  addressPending: { color: 'rgba(0,0,0,0.45)' },
  nameInput: {
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#FAFAFA',
  },
  icons: { flexDirection: 'row', justifyContent: 'space-between' },
  iconOption: { alignItems: 'center', gap: 4, width: 54 },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleOn: { backgroundColor: PRIMARY },
  iconLabel: { fontSize: 11, color: 'rgba(0,0,0,0.55)' },
  iconLabelOn: { color: PRIMARY, fontWeight: '600' },
  links: { flexDirection: 'row', justifyContent: 'space-between' },
  link: { fontSize: 14, fontWeight: '600', color: PRIMARY },
  linkDanger: { color: '#D92D20' },
});
