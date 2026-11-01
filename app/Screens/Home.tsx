import {
  Image,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  UIManager,
  LayoutAnimation,
  InputAccessoryView,
  Keyboard,
  Alert,
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SvgXml } from 'react-native-svg';
import { MAP_TILE_URL } from '@/lib/mapTiles';
import { LOCATION_MARKER_XML } from '@/components/icons/BrandIcons';
import StationPinIcon from '@/components/StationPinIcon';
import GlassCard from '@/components/GlassCard';
import AppMenuButton from '@/components/AppMenu';
import {
  Crosshair,
  MapPin,
  CaretRight,
  Minus,
  Plus,
  GasPump,
  ArrowLeft,
  Check,
  CheckCircle,
  X,
  MagnifyingGlass,
  NavigationArrow,
} from 'phosphor-react-native';
import { red } from 'react-native-reanimated/lib/typescript/Colors';
import { blue100 } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

const DEFAULT_LATITUDE = 6.678045;
const DEFAULT_LONGITUDE = -1.573568;

const LOCATION_PIN_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
  <path opacity="0.2" d="M14 2.625C11.6794 2.625 9.45376 3.54687 7.81282 5.18782C6.17187 6.82876 5.25 9.05436 5.25 11.375C5.25 19.25 14 25.375 14 25.375C14 25.375 22.75 19.25 22.75 11.375C22.75 9.05436 21.8281 6.82876 20.1872 5.18782C18.5462 3.54687 16.3206 2.625 14 2.625ZM14 14.875C13.3078 14.875 12.6311 14.6697 12.0555 14.2851C11.4799 13.9006 11.0313 13.3539 10.7664 12.7144C10.5015 12.0749 10.4322 11.3711 10.5673 10.6922C10.7023 10.0133 11.0356 9.38961 11.5251 8.90013C12.0146 8.41064 12.6383 8.0773 13.3172 7.94225C13.9961 7.8072 14.6999 7.87651 15.3394 8.14142C15.9789 8.40633 16.5256 8.85493 16.9101 9.4305C17.2947 10.0061 17.5 10.6828 17.5 11.375C17.5 12.3033 17.1313 13.1935 16.4749 13.8499C15.8185 14.5063 14.9283 14.875 14 14.875Z" fill="#34C759"/>
  <path d="M14 7C13.1347 7 12.2888 7.25659 11.5694 7.73732C10.8499 8.21805 10.2892 8.90133 9.95803 9.70076C9.62689 10.5002 9.54025 11.3799 9.70906 12.2285C9.87787 13.0772 10.2946 13.8567 10.9064 14.4686C11.5183 15.0804 12.2978 15.4971 13.1465 15.6659C13.9951 15.8347 14.8748 15.7481 15.6742 15.417C16.4737 15.0858 17.1569 14.5251 17.6377 13.8056C18.1184 13.0862 18.375 12.2403 18.375 11.375C18.375 10.2147 17.9141 9.10188 17.0936 8.28141C16.2731 7.46094 15.1603 7 14 7ZM14 14C13.4808 14 12.9733 13.846 12.5416 13.5576C12.1099 13.2692 11.7735 12.8592 11.5748 12.3795C11.3761 11.8999 11.3242 11.3721 11.4254 10.8629C11.5267 10.3537 11.7767 9.88596 12.1438 9.51885C12.511 9.15173 12.9787 8.90173 13.4879 8.80044C13.9971 8.69915 14.5249 8.75114 15.0045 8.94982C15.4842 9.1485 15.8942 9.48495 16.1826 9.91663C16.471 10.3483 16.625 10.8558 16.625 11.375C16.625 12.0712 16.3484 12.7389 15.8562 13.2312C15.3639 13.7234 14.6962 14 14 14ZM14 1.75C11.4482 1.75289 9.0017 2.76788 7.19729 4.57229C5.39288 6.37671 4.37789 8.82318 4.375 11.375C4.375 14.8094 5.96203 18.4494 8.96875 21.9023C10.3198 23.4627 11.8403 24.8677 13.5023 26.0914C13.6495 26.1945 13.8247 26.2498 14.0044 26.2498C14.184 26.2498 14.3593 26.1945 14.5064 26.0914C16.1654 24.8672 17.683 23.4622 19.0312 21.9023C22.0336 18.4494 23.625 14.8094 23.625 11.375C23.6221 8.82318 22.6071 6.37671 20.8027 4.57229C18.9983 2.76788 16.5518 1.75289 14 1.75ZM14 24.2813C12.192 22.8594 6.125 17.6367 6.125 11.375C6.125 9.28642 6.95468 7.28338 8.43153 5.80653C9.90838 4.32969 11.9114 3.5 14 3.5C16.0886 3.5 18.0916 4.32969 19.5685 5.80653C21.0453 7.28338 21.875 9.28642 21.875 11.375C21.875 17.6345 15.808 22.8594 14 24.2813Z" fill="#34C759"/>
</svg>
`;

const SCHEDULE_CLOCK_ICON_XML = `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
  <path opacity="0.2" d="M24.5 14C24.5 16.0767 23.8842 18.1068 22.7304 19.8335C21.5767 21.5602 19.9368 22.906 18.0182 23.7007C16.0996 24.4955 13.9884 24.7034 11.9516 24.2982C9.91476 23.8931 8.04383 22.8931 6.57538 21.4246C5.10693 19.9562 4.1069 18.0852 3.70176 16.0484C3.29661 14.0116 3.50455 11.9004 4.29927 9.98182C5.09399 8.0632 6.4398 6.42332 8.16652 5.26957C9.89323 4.11581 11.9233 3.5 14 3.5C16.7848 3.5 19.4555 4.60625 21.4246 6.57538C23.3938 8.54451 24.5 11.2152 24.5 14Z" fill="#0088FF"/>
  <path d="M14 2.625C11.7502 2.625 9.551 3.29213 7.68039 4.54203C5.80978 5.79193 4.35182 7.56847 3.49088 9.64698C2.62993 11.7255 2.40467 14.0126 2.84357 16.2192C3.28248 18.4257 4.36584 20.4525 5.95667 22.0433C7.54749 23.6342 9.57432 24.7175 11.7809 25.1564C13.9874 25.5953 16.2745 25.3701 18.353 24.5091C20.4315 23.6482 22.2081 22.1902 23.458 20.3196C24.7079 18.449 25.375 16.2498 25.375 14C25.3718 10.9841 24.1724 8.09271 22.0398 5.96018C19.9073 3.82764 17.0159 2.62818 14 2.625ZM14 23.625C12.0964 23.625 10.2355 23.0605 8.65264 22.0029C7.06982 20.9453 5.83616 19.4421 5.10766 17.6833C4.37917 15.9246 4.18856 13.9893 4.55995 12.1223C4.93133 10.2552 5.84802 8.54018 7.1941 7.1941C8.54018 5.84802 10.2552 4.93132 12.1223 4.55994C13.9893 4.18856 15.9246 4.37917 17.6833 5.10766C19.4421 5.83615 20.9453 7.06981 22.0029 8.65264C23.0605 10.2355 23.625 12.0964 23.625 14C23.6221 16.5518 22.6071 18.9983 20.8027 20.8027C18.9983 22.6071 16.5518 23.6221 14 23.625ZM21 14C21 14.2321 20.9078 14.4546 20.7437 14.6187C20.5796 14.7828 20.3571 14.875 20.125 14.875H14C13.7679 14.875 13.5454 14.7828 13.3813 14.6187C13.2172 14.4546 13.125 14.2321 13.125 14V7.875C13.125 7.64294 13.2172 7.42038 13.3813 7.25628C13.5454 7.09219 13.7679 7 14 7C14.2321 7 14.4546 7.09219 14.6187 7.25628C14.7828 7.42038 14.875 7.64294 14.875 7.875V13.125H20.125C20.3571 13.125 20.5796 13.2172 20.7437 13.3813C20.9078 13.5454 21 13.7679 21 14Z" fill="#0088FF"/>
</svg>
`;

const MIN_FILL_AMOUNT = 20;
const FILL_SERVICE_FEE = 5;
const AMOUNT_INPUT_ACCESSORY_ID = 'amountInputAccessory';
const BUSINESS_OPEN_HOUR = 8;
const BUSINESS_CLOSE_HOUR = 17; // 5 PM

const CYLINDERS = [
  { key: 'small', title: 'Small Size', price: 5, image: require('./../../assets/images/smallSize.png') },
  { key: 'medium', title: 'Medium Size', price: 10, image: require('./../../assets/images/mediumSize.png') },
  { key: 'large', title: 'Large Size', price: 15, image: require('./../../assets/images/mediumSize.png') },
];

const PRESET_LOCATIONS = [
  { name: 'Ahodwo, Kumasi', latitude: 6.665, longitude: -1.615 },
  { name: 'Adum, Kumasi', latitude: 6.6885, longitude: -1.6244 },
  { name: 'East Legon, Accra', latitude: 5.6494, longitude: -0.1527 },
  { name: 'Haatso, Accra', latitude: 5.676, longitude: -0.1836 },
  { name: 'Tamale Central', latitude: 9.4035, longitude: -0.8393 },
  { name: 'Takoradi Market Circle', latitude: 4.8974, longitude: -1.7638 },
];

const STATIONS = [
  { key: 'goil', name: 'GOIL Filling Station', color: '#F26522', fee: 0, latOffset: 0.0036, lngOffset: 0.0012, logo: require('./../../assets/Goil.png') },
  { key: 'shell', name: 'Shell Filling Station', color: '#ED1C24', fee: 10, latOffset: 0.0138, lngOffset: 0.0074, logo: require('./../../assets/Shell.png') },
  { key: 'total', name: 'TotalEnergies Filling Station', color: '#003DA5', fee: 30, latOffset: 0.024, lngOffset: 0.0145, logo: require('./../../assets/stations/totalenergies.png') },
];

const haversineKm = (a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
};

export default function Home() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [region, setRegion] = useState({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [userLocation, setUserLocation] = useState({
    latitude: DEFAULT_LATITUDE,
    longitude: DEFAULT_LONGITUDE,
  });
  const [routePath, setRoutePath] = useState<{ latitude: number; longitude: number }[] | null>(null);
  const [currentLocation, setCurrentLocation] = useState('Locating…');
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({ small: 1, medium: 0, large: 0 });
  const [step, setStep] = useState<'select' | 'stations' | 'amount' | 'location'>('select');
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [fillAmounts, setFillAmounts] = useState<number[]>([]);
  const [fullFillFlags, setFullFillFlags] = useState<boolean[]>([]);
  const [scheduleView, setScheduleView] = useState(false);
  const [pickupMode, setPickupMode] = useState<'instantly' | 'tomorrow' | 'custom'>('instantly');
  const [customDate, setCustomDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickupLabel, setPickupLabel] = useState('Now');
  const [forceScheduleAfterSave, setForceScheduleAfterSave] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const glide = () => LayoutAnimation.configureNext(LayoutAnimation.create(320, 'easeInEaseOut', 'opacity'));

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setCurrentLocation('Location permission denied');
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        setUserLocation(coords);
        const newRegion = { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        setRegion(newRegion);
        mapRef.current?.animateToRegion(newRegion, 500);
        updateAddress(coords);
      } catch (error) {
        setCurrentLocation('Custom Location');
      }
    })();
  }, []);

  const updateAddress = async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
    try {
      const [address] = await Location.reverseGeocodeAsync({ latitude, longitude });
      setCurrentLocation(address ? `${address.street || address.name || ''}, ${address.city || ''}`.replace(/^, /, '') : 'Custom Location');
    } catch (error) {
      setCurrentLocation('Custom Location');
    }
  };

  const handleRefocus = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location permission needed', 'Enable location access in Settings to use your current location.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setUserLocation(coords);
      const newRegion = { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
      updateAddress(coords);
    } catch (error) {
      Alert.alert('Unable to get your location', 'Make sure location services are enabled and try again.');
    }
  };

  const changeQuantity = (key: string, delta: number) => {
    setQuantities((prev) => ({ ...prev, [key]: Math.max(0, prev[key] + delta) }));
  };

  const handleOpenLocationSearch = () => {
    glide();
    setStep('location');
  };

  const handleCloseLocationSearch = () => {
    glide();
    setStep('select');
  };

  const handleUseCurrentLocation = () => {
    glide();
    setStep('select');
    // Fire-and-forget so the overlay closes immediately instead of
    // waiting on the GPS fix; the map animates to the new position (or
    // an alert fires) once the location comes back.
    handleRefocus();
  };

  const handleSelectPresetLocation = (loc: { name: string; latitude: number; longitude: number }) => {
    const coords = { latitude: loc.latitude, longitude: loc.longitude };
    setUserLocation(coords);
    const newRegion = { ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 500);
    setCurrentLocation(loc.name);
    glide();
    setStep('select');
  };

  const formatCustomDate = (date: Date) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const handleOpenSchedule = () => {
    glide();
    setScheduleView(true);
  };

  const handleSelectCustomDate = () => {
    setPickupMode('custom');
    setShowDatePicker(true);
  };

  const completeSchedule = (mode: 'instantly' | 'tomorrow' | 'custom', date: Date | null, continueOrder: boolean) => {
    const label =
      mode === 'instantly' ? 'Now' : mode === 'tomorrow' ? 'Tomorrow' : date ? formatCustomDate(date) : 'Pick Date';
    glide();
    setPickupLabel(label);
    setScheduleView(false);
    setShowDatePicker(false);
    setForceScheduleAfterSave(false);
    if (continueOrder) {
      setSelectedStation(stationsWithDistance[0]?.key ?? null);
      setStep('stations');
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event?.type !== 'set' || !date) return;
    } else if (!date) {
      return;
    }
    setCustomDate(date);
    setPickupMode('custom');
    // Picking a day is the final step of scheduling — continue right away
    // instead of making the user tap Save afterward.
    completeSchedule('custom', date, forceScheduleAfterSave);
  };

  const handleSaveSchedule = () => {
    completeSchedule(pickupMode, customDate, forceScheduleAfterSave);
  };

  const cylinderCost = CYLINDERS.reduce((sum, c) => sum + c.price * quantities[c.key], 0);
  const summary = CYLINDERS.filter((c) => quantities[c.key] > 0)
    .map((c) => `${c.title} x${quantities[c.key]}`)
    .join(', ');
  const isOrderDisabled = cylinderCost === 0;
  const currentHour = new Date().getHours();
  const isWithinBusinessHours = currentHour >= BUSINESS_OPEN_HOUR && currentHour < BUSINESS_CLOSE_HOUR;
  const minimumScheduleDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  })();

  const stationsWithDistance = STATIONS.map((s) => {
    const coords = {
      latitude: userLocation.latitude + s.latOffset,
      longitude: userLocation.longitude + s.lngOffset,
    };
    return { ...s, ...coords, distanceKm: haversineKm(userLocation, coords) };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Whichever station the route line should point at: the one the user has
  // picked in the station step, falling back to the closest one by default.
  const routeTargetStation =
    (selectedStation && stationsWithDistance.find((s) => s.key === selectedStation)) || stationsWithDistance[0] || null;

  // Road-following route from the user to the route-target station, via
  // OSRM's free public routing API — falls back to a straight dashed line
  // (rendered below) while loading or if the request fails.
  useEffect(() => {
    if (!routeTargetStation) {
      setRoutePath(null);
      return;
    }

    let cancelled = false;
    const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.longitude},${userLocation.latitude};${routeTargetStation.longitude},${routeTargetStation.latitude}?overview=full&geometries=geojson`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const coords = data?.routes?.[0]?.geometry?.coordinates as [number, number][] | undefined;
        if (coords?.length) {
          setRoutePath(coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng })));
        } else {
          setRoutePath(null);
        }
      })
      .catch(() => {
        if (!cancelled) setRoutePath(null);
      });

    return () => {
      cancelled = true;
    };
  }, [userLocation.latitude, userLocation.longitude, routeTargetStation?.key, routeTargetStation?.latitude, routeTargetStation?.longitude]);

  const handlePlaceOrder = () => {
    if (isOrderDisabled) return;
    if (scheduleView) {
      // The schedule picker is already open (e.g. the user just tapped
      // "Tomorrow" or picked a date) — treat tapping the main button as
      // "Save and continue" instead of requiring a separate Save tap.
      completeSchedule(pickupMode, customDate, true);
      return;
    }
    if (!isWithinBusinessHours) {
      if (pickupMode === 'instantly') setPickupMode('tomorrow');
      setForceScheduleAfterSave(true);
      handleOpenSchedule();
      return;
    }
    glide();
    setSelectedStation(stationsWithDistance[0]?.key ?? null);
    setStep('stations');
  };

  const handleBackToSelect = () => {
    glide();
    setStep('select');
  };

  const selectedStationDetails = stationsWithDistance.find((s) => s.key === selectedStation);

  const amountUnits = CYLINDERS.flatMap((c) =>
    Array.from({ length: quantities[c.key] }, (_, i) => ({
      key: c.key,
      title: c.title,
      image: c.image,
      basePrice: c.price,
      unitNumber: i + 1,
      countForKey: quantities[c.key],
    }))
  );

  const unitCost = (index: number) =>
    (fullFillFlags[index] ? amountUnits[index]?.basePrice ?? 0 : fillAmounts[index] ?? 0) + FILL_SERVICE_FEE;

  const amountGrandTotal =
    amountUnits.reduce((sum, _unit, index) => sum + unitCost(index), 0) + (selectedStationDetails?.fee ?? 0);

  const isAmountConfirmDisabled =
    amountUnits.length === 0 ||
    amountUnits.some((_, index) => !fullFillFlags[index] && (fillAmounts[index] ?? 0) < MIN_FILL_AMOUNT);

  const handleConfirmStation = () => {
    setFillAmounts(amountUnits.map(() => MIN_FILL_AMOUNT));
    setFullFillFlags(amountUnits.map(() => false));
    glide();
    setStep('amount');
  };

  const handleBackToStations = () => {
    glide();
    setStep('stations');
  };

  const handleToggleFullFill = (index: number) => {
    setFullFillFlags((prev) => prev.map((f, i) => (i === index ? !f : f)));
  };

  const handleFillAmountChange = (index: number, raw: string) => {
    const digits = raw.replace(/[^0-9]/g, '');
    const value = digits ? parseInt(digits, 10) : 0;
    const clamped = Math.max(value, MIN_FILL_AMOUNT);
    setFillAmounts((prev) => prev.map((a, i) => (i === index ? clamped : a)));
  };

  const handleRemoveUnit = (index: number) => {
    const unit = amountUnits[index];
    if (!unit) return;
    setQuantities((prev) => ({ ...prev, [unit.key]: Math.max(0, prev[unit.key] - 1) }));
    setFillAmounts((prev) => prev.filter((_, i) => i !== index));
    setFullFillFlags((prev) => prev.filter((_, i) => i !== index));
  };

  // If the user removes every remaining cylinder while on the amount step,
  // there's nothing left to confirm — bounce back to the home/select screen.
  useEffect(() => {
    if (step === 'amount' && amountUnits.length === 0) {
      glide();
      setStep('select');
    }
  }, [step, amountUnits.length]);

  const handleConfirmAmount = () => {
    navigation.navigate('FindingRider', {
      offerName: selectedStationDetails?.name ?? 'Gas Cylinder Order',
      offerPrice: selectedStationDetails?.fee ?? 0,
      price: summary || 'n/a',
      totalCost: amountGrandTotal,
      amount: amountGrandTotal,
      pickupLabel,
    });
  };

  return (
    <View style={styles.main}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          userInterfaceStyle="light"
        >
          <UrlTile urlTemplate={MAP_TILE_URL} maximumZ={20} tileSize={256} />

          <Marker coordinate={userLocation} title="You" anchor={{ x: 0.5, y: 1 }}>
            <SvgXml xml={LOCATION_MARKER_XML} width={34} height={55} />
          </Marker>

          {stationsWithDistance.map((s) => {
            const isSelected = s.key === routeTargetStation?.key;
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

          {routeTargetStation && (
            <Polyline
              coordinates={routePath ?? [userLocation, { latitude: routeTargetStation.latitude, longitude: routeTargetStation.longitude }]}
              strokeColor="#0088FF"
              strokeWidth={4}
              lineDashPattern={routePath ? undefined : [8, 8]}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </MapView>

        <View style={[styles.mapTopBar, { top: 20 }]}>
          <AppMenuButton active="home" />
          <TouchableOpacity style={styles.mapIconButton} onPress={handleRefocus}>
            <Crosshair size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.floatingArea, { bottom: Math.max(insets.bottom, 8) }]} pointerEvents="box-none">
        {step === 'select' ? (
          <>
            <GlassCard style={styles.card}>
              {!scheduleView ? (
                <>
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>Your Hassle-Free Solution For</Text>
                      <Text style={styles.cardSubtitle}>Convenient LPG Refill</Text>
                    </View>
                    <TouchableOpacity onPress={handleOpenSchedule} style={styles.clockButton}>
                      <SvgXml xml={SCHEDULE_CLOCK_ICON_XML} width={18} height={18} />
                      {pickupLabel !== 'Now' && <Text style={styles.clockButtonText}>{pickupLabel}</Text>}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.locationRow} onPress={handleOpenLocationSearch}>
                    <View style={styles.locationPin}>
                      <SvgXml xml={LOCATION_PIN_ICON_XML} width={16} height={16} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.locationLabel}>Your Location</Text>
                      <Text style={styles.locationValue} numberOfLines={1}>{currentLocation}</Text>
                    </View>
                    <CaretRight size={16} color="rgba(0,0,0,0.4)" />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.scheduleHeaderRow}>
                    <Text style={styles.sectionTitle}>Schedule Pick Up</Text>
                    <TouchableOpacity onPress={handleSaveSchedule}>
                      <Text style={styles.saveText}>Save</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.segmentedControl}>
                    {(['instantly', 'tomorrow', 'custom'] as const).map((mode) => {
                      const isSelected = pickupMode === mode;
                      const isDisabled = mode === 'instantly' && !isWithinBusinessHours;
                      const label =
                        mode === 'instantly' ? 'Instantly' : mode === 'tomorrow' ? 'Tomorrow' : customDate ? formatCustomDate(customDate) : 'Pick Date';
                      return (
                        <TouchableOpacity
                          key={mode}
                          style={[styles.segment, isSelected && styles.segmentSelected, isDisabled && styles.segmentDisabled]}
                          disabled={isDisabled}
                          onPress={() => (mode === 'custom' ? handleSelectCustomDate() : setPickupMode(mode))}
                        >
                          <Text style={[styles.segmentText, isSelected && styles.segmentTextSelected, isDisabled && styles.segmentTextDisabled]}>{label}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {showDatePicker && (
                    <DateTimePicker
                      style={styles.datePicker}
                      value={customDate ?? minimumScheduleDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'inline' : 'default'}
                      minimumDate={minimumScheduleDate}
                      accentColor="#007AFF"
                      onChange={handleDateChange}
                    />
                  )}
                </>
              )}
            </GlassCard>

            <GlassCard style={[styles.card, styles.cylinderCard]}>
              <Text style={styles.sectionTitle}>Cylinder Size</Text>

              {CYLINDERS.map((c) => (
                <View key={c.key} style={styles.cylinderRow}>
                  <Image source={c.image} style={styles.cylinderImage} resizeMode="contain" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cylinderTitle}>{c.title}</Text>
                    <Text style={styles.cylinderPrice}>GH {c.price.toFixed(2)}</Text>
                  </View>
                  <View style={styles.stepper}>
                    <TouchableOpacity style={styles.stepperButton} onPress={() => changeQuantity(c.key, -1)}>
                      <Minus size={14} color="rgba(0,0,0,0.5)" weight="bold" />
                    </TouchableOpacity>
                    <Text style={styles.stepperValue}>{quantities[c.key]}</Text>
                    <TouchableOpacity style={[styles.stepperButton, styles.stepperButtonActive]} onPress={() => changeQuantity(c.key, 1)}>
                      <Plus size={14} color="#007AFF" weight="bold" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </GlassCard>

                <TouchableOpacity
                style={[styles.placeOrderButton, isOrderDisabled && styles.placeOrderButtonDisabled]}
                disabled={isOrderDisabled}
                onPress={handlePlaceOrder}
              >
                <Text style={styles.placeOrderText}>{isWithinBusinessHours ? 'Place Order' : 'Schedule Order'}</Text>
              </TouchableOpacity>
          </>
        ) : step === 'stations' ? (
          <>
            <GlassCard style={[styles.card, styles.stationCard]}>
              <View style={styles.stationHeaderRow}>
                <TouchableOpacity style={[styles.backButton, styles.backButtonAbsolute]} onPress={handleBackToSelect}>
                  <ArrowLeft size={18} color="#000" />
                </TouchableOpacity>
                <Text style={styles.stationHeaderTitle}>Available Filling Stations</Text>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {stationsWithDistance.map((s, index) => {
                  const isSelected = selectedStation === s.key;
                  return (
                    <TouchableOpacity
                      key={s.key}
                      style={[styles.stationRow, isSelected && styles.stationRowSelected]}
                      onPress={() => setSelectedStation(s.key)}
                    >
                      {s.logo ? (
                        <Image source={s.logo} style={styles.stationLogoImage} resizeMode="contain" />
                      ) : (
                        <View style={[styles.stationLogo, { backgroundColor: s.color }]}>
                          <GasPump size={18} color="#fff" weight="fill" />
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.stationName}>{s.name}</Text>
                        <View style={styles.stationMetaRow}>
                          <Text style={styles.stationDistance}>{s.distanceKm.toFixed(1)} km away</Text>
                          {index === 0 && (
                            <View style={styles.closestBadge}>
                              <CheckCircle size={12} color="#52B922" weight="fill" />
                              <Text style={styles.closestBadgeText}>Closest</Text>
                            </View>
                          )}
                        </View>
                      </View>
                      <Text style={styles.stationFee}>GH {s.fee.toFixed(2)}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </GlassCard>

            <TouchableOpacity
              style={[styles.placeOrderButton, !selectedStation && styles.placeOrderButtonDisabled]}
              disabled={!selectedStation}
              onPress={handleConfirmStation}
            >
              <Text style={styles.placeOrderText}>Continue</Text>
            </TouchableOpacity>
          </>
        ) : step === 'amount' ? (
          <>
            <GlassCard style={[styles.card, styles.stationCard]}>
              <View style={styles.amountHeaderRow}>
                <TouchableOpacity style={styles.backButton} onPress={handleBackToStations}>
                  <ArrowLeft size={18} color="#000" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.stationHeaderTitle, styles.amountHeaderTitle]}>Amount</Text>
                  {selectedStationDetails && (
                    <Text style={styles.amountHeaderSubtitle}>Pickup from {selectedStationDetails.name}</Text>
                  )}
                </View>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {amountUnits.map((u, index) => (
                  <View key={`${u.key}-${index}`} style={styles.amountUnitRow}>
                    <TouchableOpacity
                      style={styles.removeUnitButton}
                      onPress={() => handleRemoveUnit(index)}
                      accessibilityLabel={`Remove ${u.title}`}
                    >
                      <X size={14} color="rgba(0,0,0,0.5)" weight="bold" />
                    </TouchableOpacity>
                    <Image source={u.image} style={styles.amountUnitImage} resizeMode="contain" />
                    <View style={{ flex: 1 }}>
                      {u.countForKey > 1 && <Text style={styles.amountUnitOption}>Option {u.unitNumber}</Text>}
                      <Text style={styles.amountUnitTitle}>{u.title}</Text>
                      <TouchableOpacity style={styles.fullFillRow} onPress={() => handleToggleFullFill(index)}>
                        <View style={[styles.checkbox, fullFillFlags[index] && styles.checkboxChecked]}>
                          {fullFillFlags[index] && <Check size={10} color="#fff" weight="bold" />}
                        </View>
                        <Text style={styles.fullFillText}>Full fill</Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      editable={!fullFillFlags[index]}
                      value={fullFillFlags[index] ? 'Full' : `GH ${fillAmounts[index] ?? 0}`}
                      onChangeText={(text) => handleFillAmountChange(index, text)}
                      keyboardType="numeric"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      inputAccessoryViewID={Platform.OS === 'ios' ? AMOUNT_INPUT_ACCESSORY_ID : undefined}
                      style={[styles.amountInput, fullFillFlags[index] && styles.amountInputDisabled]}
                    />
                  </View>
                ))}

                <Text style={styles.minFillNote}>Min fill amount: GH {MIN_FILL_AMOUNT}</Text>

                <View style={styles.costSummaryBox}>
                  <Text style={styles.costSummaryTitle}>Cost Summary</Text>
                  {amountUnits.map((u, index) => (
                    <View key={`cost-${u.key}-${index}`} style={styles.costRow}>
                      <Text style={styles.costRowLabel}>
                        {u.title}
                        {u.countForKey > 1 ? ` #${u.unitNumber}` : ''}
                      </Text>
                      <Text style={styles.costRowValue}>GH {unitCost(index).toFixed(2)}</Text>
                    </View>
                  ))}
                  {selectedStationDetails && (
                    <View style={styles.costRow}>
                      <Text style={styles.costRowLabel}>Filling Station Fee</Text>
                      <Text style={styles.costRowValue}>GH {selectedStationDetails.fee.toFixed(2)}</Text>
                    </View>
                  )}
                  <View style={styles.costDivider} />
                  <View style={styles.costRow}>
                    <Text style={styles.costTotalLabel}>Total</Text>
                    <Text style={styles.costTotalValue}>GH {amountGrandTotal.toFixed(2)}</Text>
                  </View>
                </View>

                <Text style={styles.paymentNote}>Payment is collected in cash on delivery.</Text>
              </ScrollView>
            </GlassCard>

            <TouchableOpacity
              style={[styles.placeOrderButton, isAmountConfirmDisabled && styles.placeOrderButtonDisabled]}
              disabled={isAmountConfirmDisabled}
              onPress={handleConfirmAmount}
            >
              <Text style={styles.placeOrderText}>Confirm Order</Text>
            </TouchableOpacity>

            {Platform.OS === 'ios' && (
              <InputAccessoryView nativeID={AMOUNT_INPUT_ACCESSORY_ID}>
                <View style={styles.keyboardAccessory}>
                  <TouchableOpacity onPress={() => Keyboard.dismiss()}>
                    <Text style={styles.keyboardAccessoryDone}>Done</Text>
                  </TouchableOpacity>
                </View>
              </InputAccessoryView>
            )}
          </>
        ) : null}
      </View>

      {step === 'location' && (
        <View style={styles.locationSearchOverlay}>
          <View style={styles.locationSearchHeader}>
            <View style={styles.locationPin}>
              <SvgXml xml={LOCATION_PIN_ICON_XML} width={16} height={16} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationLabel}>Your Location</Text>
              <Text style={styles.locationSearchValue} numberOfLines={1}>{currentLocation}</Text>
            </View>
            <TouchableOpacity onPress={handleCloseLocationSearch}>
              <X size={22} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.locationSearchDivider} />

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.locationSearchContent}>
            <Text style={styles.recentLabel}>Recent</Text>
            <View style={styles.recentChip}>
              <MagnifyingGlass size={14} color="rgba(0,0,0,0.5)" />
              <Text style={styles.recentChipText}>Qua Street</Text>
            </View>

            <TouchableOpacity style={styles.locationListRow} onPress={handleUseCurrentLocation}>
              <NavigationArrow size={18} color="#007AFF" weight="fill" />
              <Text style={styles.currentLocationText}>Your Current Location</Text>
              <CaretRight size={16} color="#007AFF" />
            </TouchableOpacity>

            {PRESET_LOCATIONS.map((loc) => (
              <TouchableOpacity key={loc.name} style={styles.locationListRow} onPress={() => handleSelectPresetLocation(loc)}>
                <MapPin size={18} color="rgba(0,0,0,0.4)" />
                <Text style={styles.locationListText}>{loc.name}</Text>
                <CaretRight size={16} color="rgba(0,0,0,0.3)" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapTopBar: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapIconButton: {
    padding: 10,
    borderRadius: 24,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  stationPinSelectedShadow: {
    shadowColor: '#0088FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    elevation: 6,
  },
  keyboardAccessory: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F4F4F4',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  keyboardAccessoryDone: {
    fontSize: 16,
    fontWeight: '700',
    color: '#007AFF',
  },
  floatingArea: {
    position: 'absolute',
    left: 16,
    right: 16,
    // bottom: 0,
    // gap: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius : 32,
    borderTopRightRadius : 32,
    borderBottomLeftRadius : 24,
    borderBottomRightRadius : 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  cylinderCard: {
    gap: 12,
    borderTopLeftRadius : 24,
    borderTopRightRadius : 24,
    borderBottomLeftRadius : 32,
    borderBottomRightRadius : 32,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.6)',
  },
  clockButton: {
    minWidth: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0FBEA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 6,
  },
  clockButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2F8A00',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationPin: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  locationValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cylinderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cylinderImage: {
    width: 32,
    height: 32,
  },
  cylinderTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cylinderPrice: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonActive: {
    borderColor: '#007AFF',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 16,
    textAlign: 'center',
  },
  placeOrderButton: {
    backgroundColor: '#007AFF',
    borderRadius: 28,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  stationCard: {
    gap: 16,
  },
  stationHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 4,
  },
  backButtonAbsolute: {
    position: 'absolute',
    left: 0,
    zIndex: 1,
  },
  stationHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  amountHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  amountHeaderTitle: {
    textAlign: 'left',
  },
  amountHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  amountUnitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  removeUnitButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountUnitImage: {
    width: 32,
    height: 40,
  },
  amountUnitOption: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  amountUnitTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  fullFillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  fullFillText: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.5)',
  },
  amountInput: {
    backgroundColor: '#FAFAFA',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    width: 100,
    fontSize: 14,
  },
  amountInputDisabled: {
    opacity: 0.6,
  },
  minFillNote: {
    fontSize: 11,
    color: 'rgba(0,0,0,0.4)',
  },
  costSummaryBox: {
    gap: 8,
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  costSummaryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  costRowLabel: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
  },
  costRowValue: {
    fontSize: 13,
  },
  costDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  costTotalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  costTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
  },
  paymentNote: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  stationRowSelected: {
    borderColor: '#007AFF',
    backgroundColor: 'rgba(0, 122, 255, 0.04)',
  },
  stationLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationLogoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  stationName: {
    fontSize: 15,
    fontWeight: '600',
  },
  stationMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  stationDistance: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  closestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  closestBadgeText: {
    fontSize: 12,
    color: '#52B922',
    fontWeight: '600',
  },
  stationFee: {
    fontSize: 15,
    fontWeight: '700',
  },
  scheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F4',
    borderRadius: 9999,
    padding: 4,
    gap: 4,
  },
  datePicker: {
    marginTop: 4,
    alignSelf: 'center',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 9999,
  },
  segmentSelected: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
  },
  segmentTextSelected: {
    fontWeight: '600',
    color: '#000',
  },
  segmentDisabled: {
    opacity: 0.4,
  },
  segmentTextDisabled: {
    color: 'rgba(0,0,0,0.3)',
  },
  locationSearchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  locationSearchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 16,
  },
  locationSearchValue: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
  },
  locationSearchDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  locationSearchContent: {
    paddingTop: 16,
    paddingBottom: 40,
    gap: 4,
  },
  recentLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 9999,
    backgroundColor: '#F4F4F4',
    marginBottom: 16,
  },
  recentChipText: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
  },
  locationListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  currentLocationText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  locationListText: {
    flex: 1,
    fontSize: 15,
    color: '#000',
  },
});
