import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { View, Text, TouchableOpacity, StyleSheet, Linking, ActivityIndicator, PanResponder, Pressable, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { CALL_BOLD_XML, LOCATION_MARKER_XML, STAR_DUOTONE_XML } from '@/components/icons/BrandIcons';
import VehicleMarker from '@/features/tracking/components/VehicleMarker';
import { VEHICLES, vehicleKind } from '@/features/tracking/vehicles';
import { angleBetween, bearingBetween, remainingPath, snapToPath } from '@/features/tracking/heading';
import StationPinIcon from '@/components/StationPinIcon';
import { FillingStatusBadge } from '@/components/icons/FillingPumpIcon';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutDown, LinearTransition } from 'react-native-reanimated';
import { House, PathIcon, X, Hourglass, Clock, Play, Stop, ArrowCounterClockwise, NavigationArrow, GasCan } from 'phosphor-react-native';
import { MAP_TILE_URL } from '@/lib/mapTiles';
import GlassCard from '@/components/GlassCard';
import { useOrder } from '@/features/orders/hooks';
import { customerStatusLabel, hasPickedUp, isReassigning, pickupStepTitle, queuedState, stepStates, type QueuedState } from '@/features/orders/status';
import {
  DEMO_MODE,
  DEMO_ORDER_ID,
  isDemoTripRunning,
  nextDemoQueue,
  resetDemoOrder,
  setDemoQueue,
  startDemoTrip,
  stopDemoTrip,
  type DemoQueue,
} from '@/features/tracking/demo';
import { useTripStore } from '@/features/trip/store';
import { tripAlertContent, type TripAlertContent } from '@/features/trip/messages';
import { TRIP_STEPS } from '@/features/trip/steps';
import { CONDITION_TEXT } from '@/features/trip/conditions';
import { useStations } from '@/features/catalog/hooks';
import { useRoute as useRoadRoute, type LatLng } from '@/features/tracking/hooks';
import { fromGeoPoint } from '@/lib/geo';
import { errorMessage } from '@/lib/api/client';
import type { RiderPublic } from '@/lib/api/types';

const PRIMARY = '#0088FF';
const GREEN = '#52B922';
const BLUE = '#0085FF';

type IconProps = { size?: number; color?: string };

// Ported 1:1 from the web app's custom step icons.
function RiderIcon({ size = 16, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M12.4733 6.327C12.4066 6.327 12.3399 6.31366 12.2733 6.287C12.0199 6.17366 11.9066 5.88033 12.0133 5.62699C12.1399 5.34033 12.0666 4.92033 11.8333 4.57366C11.5999 4.22033 11.2466 3.98033 10.9266 4.00033C10.6333 4.00033 10.4266 3.78033 10.4199 3.507C10.4199 3.227 10.6399 3.007 10.9133 3.00033C11.5999 2.987 12.2466 3.38033 12.6666 4.01366C13.0933 4.65366 13.1933 5.42033 12.9333 6.02033C12.8533 6.21366 12.6666 6.327 12.4733 6.327Z" fill={color} />
      <Path d="M14.5471 6.9869C14.5004 6.9869 14.4604 6.98023 14.4138 6.9669C14.1471 6.89356 13.9938 6.62023 14.0671 6.35356C14.3204 5.4469 14.1071 4.3669 13.5004 3.46023C12.8937 2.55356 11.9737 1.9469 11.0337 1.83356C10.7604 1.80023 10.5671 1.55356 10.6004 1.28023C10.6337 1.0069 10.8871 0.806898 11.1537 0.846898C12.3737 0.993564 13.5604 1.7669 14.3271 2.91356C15.0937 4.06023 15.3538 5.4469 15.0271 6.63356C14.9671 6.84023 14.7671 6.9869 14.5471 6.9869Z" fill={color} />
      <Path d="M11.4133 7.85363C11.4133 8.05363 11.2466 8.2203 11.0466 8.2203H2.28659C2.08659 8.2203 1.91992 8.05363 1.91992 7.85363C1.91992 7.65363 2.08659 7.48697 2.28659 7.48697H2.77992L2.96659 6.60697C3.13992 5.75363 3.50659 4.97363 4.95992 4.97363H8.37992C9.83326 4.97363 10.1933 5.7603 10.3733 6.60697L10.5599 7.48697H11.0533C11.2466 7.48697 11.4133 7.65363 11.4133 7.85363Z" fill={color} />
      <Path d="M11.62 10.6073C11.5467 9.80727 11.3334 8.94727 9.77336 8.94727H3.56003C2.00003 8.94727 1.7867 9.80727 1.71336 10.6073L1.44003 13.5739C1.4067 13.9406 1.5267 14.3139 1.78003 14.5939C2.04003 14.8739 2.40003 15.0339 2.79336 15.0339H3.7067C4.49336 15.0339 4.6467 14.5806 4.7467 14.2873L4.8467 13.9939C4.96003 13.6606 4.9867 13.5739 5.4267 13.5739H7.92003C8.36003 13.5739 8.37336 13.6206 8.50003 13.9939L8.60003 14.2873C8.70003 14.5873 8.8467 15.0339 9.64003 15.0339H10.5534C10.94 15.0339 11.3067 14.8739 11.5667 14.5939C11.82 14.3139 11.94 13.9473 11.9067 13.5739L11.62 10.6073ZM5.2067 11.6206H3.7467C3.5467 11.6206 3.38003 11.4539 3.38003 11.2539C3.38003 11.0539 3.5467 10.8873 3.7467 10.8873H5.2067C5.4067 10.8873 5.57336 11.0539 5.57336 11.2539C5.57336 11.4539 5.4067 11.6206 5.2067 11.6206ZM9.5867 11.6206H8.1267C7.9267 11.6206 7.76003 11.4539 7.76003 11.2539C7.76003 11.0539 7.9267 10.8873 8.1267 10.8873H9.5867C9.7867 10.8873 9.95336 11.0539 9.95336 11.2539C9.95336 11.4539 9.7867 11.6206 9.5867 11.6206Z" fill={color} />
    </Svg>
  );
}

type Status = 'completed' | 'active' | 'pending';

function CylinderIcon({ size = 16, color = '#fff' }: IconProps) {
  return <GasCan size={size} color={color} weight="fill" />;
}

// Titles come from TRIP_STEPS, the same text the trip toasts use.
const STEP_ICONS = [RiderIcon, null, RiderIcon] as const;

// The active step's detail: exactly what the toast for this moment says — its description,
// then the clock line ("Gets there in 15 min") and any delay tag ("Slight Traffic").
function StepDetail({ content }: { content: TripAlertContent }) {
  return (
    <View style={styles.stepDetail}>
      <Text style={styles.stepSubtitle}>{content.body}</Text>
      {(content.etaStrong || content.condition) && (
        <View style={styles.stepClock}>
          {content.etaStrong && (
            <>
              <Clock size={11} weight="fill" color="#000" />
              <Text style={styles.stepClockText}>
                {content.etaSoft ? `${content.etaSoft} ` : ''}
                <Text style={styles.stepClockStrong}>{content.etaStrong}</Text>
              </Text>
            </>
          )}
          {content.etaStrong && content.condition && <View style={styles.stepClockDot} />}
          {content.condition && <Text style={styles.stepClockText}>{content.condition}</Text>}
        </View>
      )}
    </View>
  );
}

function Connector({ color }: { color: string | null }) {
  return <View style={[styles.connector, color ? { backgroundColor: color } : styles.connectorDashed]} />;
}

function StackedStep({
  icon: Icon,
  title,
  subtitle,
  status,
  isLast,
}: {
  icon: React.ComponentType<IconProps>;
  title: string;
  subtitle: React.ReactNode;
  status: Status;
  isLast: boolean;
}) {
  const bg = status === 'pending' ? '#FAFAFA' : status === 'completed' ? GREEN : BLUE;
  const showOutline = status === 'active';

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepIconColumn}>
        <View style={[styles.stepIconCircle, { backgroundColor: bg }, showOutline && styles.stepIconOutline]}>
          <Icon size={16} color={status === 'pending' ? 'rgba(0,0,0,0.3)' : '#fff'} />
        </View>
        {!isLast && <Connector color={status === 'pending' ? null : bg} />}
      </View>

      <View style={styles.stepTextColumn}>
        <Text style={styles.stepTitle}>{title}</Text>
        {typeof subtitle === 'string' ? <Text style={styles.stepSubtitle}>{subtitle}</Text> : subtitle}
      </View>
    </View>
  );
}

// `pumping`: the rider is at the station, so the pump animates.
function FillingStep({
  status,
  isLast,
  pumping,
  detail,
}: {
  status: Status;
  isLast: boolean;
  pumping: boolean;
  detail?: React.ReactNode;
}) {
  const bg = status === 'pending' ? '#FAFAFA' : BLUE;
  const badgeText = status === 'completed' ? 'Completed' : status === 'active' ? 'In Progress' : null;
  const badgeColor = status === 'completed' ? GREEN : BLUE;

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepIconColumn}>
        <FillingStatusBadge active={pumping} size={36} />
        {!isLast && <Connector color={status === 'pending' ? null : bg} />}
      </View>

      <View style={styles.fillingTextColumn}>
        <View style={styles.fillingTextRow}>
          <Text style={styles.stepTitleInline}>{TRIP_STEPS[1].title}</Text>
          {badgeText && (
            <View style={styles.inlineBadge}>
              <Text style={[styles.inlineBadgeText, { color: badgeColor }]}>{badgeText}</Text>
            </View>
          )}
        </View>
        {detail}
      </View>
    </View>
  );
}

function QueuedIcon({ size = 16, color = '#fff' }: IconProps) {
  return <Hourglass size={size} color={color} weight="fill" />;
}

// Floats just above the tracking card while the rider finishes an earlier delivery,
// like ride-hailing apps do when a driver is "completing another ride nearby".
function QueuedBanner({ queued, bottom, onDismiss }: { queued: QueuedState; bottom: number; onDismiss: () => void }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      exiting={FadeOutDown.duration(200)}
      style={[styles.queueBanner, { bottom }]}
      accessibilityRole="alert"
    >
      <View style={styles.queueBannerIcon}>
        <PathIcon size={22} weight="bold" color={PRIMARY} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.queueBannerTitle}>{queued.banner}</Text>
        {!!queued.startsIn && <Text style={styles.queueBannerMeta}>{queued.startsIn}</Text>}
      </View>
      <TouchableOpacity onPress={onDismiss} hitSlop={12} accessibilityLabel="Dismiss" accessibilityRole="button">
        <X size={18} weight="bold" color="rgba(0,0,0,0.5)" />
      </TouchableOpacity>
    </Animated.View>
  );
}

type RiderCardRider = Pick<RiderPublic, 'firstName' | 'lastName' | 'phoneNumber' | 'photoUrl' | 'vehicleType' | 'plateNumber' | 'rating'>;

// Who is coming and how to spot them (Figma "Rider information", node 32458:25369): photo with
// the vehicle in a small badge and the rating pill over it, then name, number plate and vehicle
// type, and the call button on the right.
function RiderCard({ rider }: { rider: RiderCardRider }) {
  const initials = `${rider.firstName[0] ?? ''}${rider.lastName[0] ?? ''}`.toUpperCase();
  const vehicle = VEHICLES[vehicleKind(rider.vehicleType)];
  // 4.95 stays 4.95, 5 shows as 5.0.
  const rounded = typeof rider.rating === 'number' ? Number(rider.rating.toFixed(2)) : null;
  const rating = rounded === null ? null : rounded % 1 === 0 ? rounded.toFixed(1) : String(rounded);

  return (
    <View style={styles.riderCard}>
      <View style={styles.riderLeft}>
        <View style={styles.riderVisual}>
          {rider.photoUrl ? (
            <Image source={{ uri: rider.photoUrl }} style={styles.riderAvatar} />
          ) : (
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.vehicleBadge}>
            {/* Top-down art is tilted as in the design; side-view art (car) stays upright. */}
            <Image
              source={vehicle.top ?? vehicle.side}
              style={[styles.vehicleBadgeImage, !!vehicle.top && styles.vehicleBadgeTilt]}
              resizeMode="contain"
              accessibilityIgnoresInvertColors
            />
          </View>
          {rating && (
            <View style={styles.ratingPill} accessibilityLabel={`Rated ${rating}`}>
              <SvgXml xml={STAR_DUOTONE_XML} width={12} height={12} />
              <Text style={styles.ratingText}>{rating}</Text>
            </View>
          )}
        </View>
        <View style={styles.riderInfo}>
          <Text style={styles.riderName} numberOfLines={1}>
            {rider.firstName} {rider.lastName}
          </Text>
          {!!rider.plateNumber && (
            <View style={styles.plateChip}>
              <Text style={styles.plateText} numberOfLines={1} accessibilityLabel={`Number plate ${rider.plateNumber}`}>
                {rider.plateNumber}
              </Text>
            </View>
          )}
          <Text style={styles.vehicleLabel} numberOfLines={1}>
            {vehicle.label}
          </Text>
        </View>
      </View>
      {!!rider.phoneNumber && (
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => Linking.openURL(`tel:${rider.phoneNumber}`)}
          accessibilityRole="button"
          accessibilityLabel={`Call ${rider.firstName}`}
        >
          <SvgXml xml={CALL_BOLD_XML} width={16} height={16} />
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function Tracker() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId } = route.params as { orderId: string };
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const isDemo = orderId === DEMO_ORDER_ID;
  const client = useQueryClient();
  const orderQuery = useOrder(orderId);
  const stationsQuery = useStations();
  const detail = orderQuery.data;
  // Live ETA kept fresh by the trip watcher (features/trip), shared with the alerts.
  const live = useTripStore((s) => s.etas[orderId]);

  const order = detail?.order;
  const riderLocation = detail?.riderLocation ?? null;
  const rider = order && typeof order.riderId === 'object' && order.riderId ? order.riderId : null;
  const status = order?.status;
  const hasRating = !!order?.rating;
  // The customer only reaches this screen once a rider was assigned, so a status that
  // falls back to "searching" here means that rider cancelled (doc scenario D).
  const reassigning = !!status && isReassigning(status);
  const statusBadge = status ? customerStatusLabel(status) : null;
  // The rider has reached the station (or is pulling in): the pump animates on the map and card.
  const atStation = status === 'filling' || (status === 'picked_up' && live?.phase === 'approaching_station');
  // Demo tools (top right). The queue switch edits the demo order itself, so the alerts
  // react too; on a real rider_assigned order it only changes this screen.
  const [simRunning, setSimRunning] = useState(isDemo && isDemoTripRunning());
  const [localQueue, setLocalQueue] = useState<DemoQueue>(0);
  const demoQueue: DemoQueue = isDemo ? (Math.min(2, detail?.riderQueue?.ordersAhead ?? 0) as DemoQueue) : localQueue;
  const showDemoSwitch = DEMO_MODE && status === 'rider_assigned' && !simRunning;
  const cycleDemoQueue = () => (isDemo ? setDemoQueue(client, nextDemoQueue(demoQueue)) : setLocalQueue(nextDemoQueue));
  const handleSimulate = () => {
    if (simRunning) {
      stopDemoTrip();
      setSimRunning(false);
    } else if (status === 'delivered') {
      resetDemoOrder(client);
    } else {
      startDemoTrip(client, () => setSimRunning(false));
      setSimRunning(true);
    }
  };
  const riderQueue =
    !isDemo && showDemoSwitch && localQueue > 0
      ? { ordersAhead: localQueue, startsInSeconds: localQueue * 240 }
      : detail?.riderQueue;
  // The rider accepted this order but is still finishing an earlier one in their queue.
  const queued = status && !reassigning ? queuedState(status, riderQueue) : null;
  // Dismissing hides the banner until the queue changes (e.g. 2 ahead -> 1 ahead).
  const [bannerDismissedFor, setBannerDismissedFor] = useState<number | null>(null);
  const showQueueBanner = !!queued && bannerDismissedFor !== queued.ordersAhead;
  const [cardHeight, setCardHeight] = useState(0);
  const cardBottom = Math.max(insets.bottom, 8);

  const customer: LatLng | null = order
    ? { latitude: order.deliveryAddress.lat, longitude: order.deliveryAddress.lng }
    : null;
  const station = stationsQuery.data?.find((s) => s.id === order?.stationId);
  const stationPoint: LatLng | null = station ? fromGeoPoint(station.location) : null;

  // Index of the first step that is not completed (3 when the delivery is done).
  const states = status ? stepStates(status) : (['pending', 'pending', 'pending'] as const);
  const firstOpen = states.findIndex((st) => st !== 'completed');
  const minStep = firstOpen === -1 ? states.length : firstOpen;

  // Ask for a rating/complaint the moment a delivery finishes, instead of
  // only offering it from a details page the customer might never open.
  // Once per visit: skipping the rating page must not bring it straight back.
  const askedToRate = useRef(false);
  useEffect(() => {
    if (status === 'delivered' && !hasRating && !askedToRate.current) {
      askedToRate.current = true;
      navigation.navigate('RateDelivery', { orderId });
    }
  }, [status, hasRating, navigation, orderId]);

  // The road the rider is on now, from where they are to where they are going next: the customer
  // (to collect the cylinder, or to bring it back), or the station (with the empty cylinder).
  // While filling, or before a rider is moving on this order, the next leg is station -> customer.
  // The rider end is rounded (~110 m) so the route is not refetched on every GPS ping, then the
  // drawn line is trimmed to start exactly at the rider.
  const liveRider = riderLocation && !queued ? { latitude: riderLocation.lat, longitude: riderLocation.lng } : null;
  const legTarget =
    status === 'rider_assigned' || status === 'en_route_to_customer' ? customer : status === 'picked_up' ? stationPoint : null;
  const legFrom = liveRider && legTarget ? liveRider : stationPoint;
  const legTo = liveRider && legTarget ? legTarget : customer;
  const roundCoord = (n: number) => Math.round(n * 1000) / 1000;
  const { path: routePath } = useRoadRoute(
    legFrom && legTo && status !== 'delivered'
      ? {
          fromLat: legFrom === liveRider ? roundCoord(legFrom.latitude) : legFrom.latitude,
          fromLng: legFrom === liveRider ? roundCoord(legFrom.longitude) : legFrom.longitude,
          toLat: legTo.latitude,
          toLng: legTo.longitude,
        }
      : null,
  );
  const fullPath = routePath ?? (legFrom && legTo && status !== 'delivered' ? [legFrom, legTo] : []);
  const ridePath = liveRider && legTarget && fullPath.length > 1 ? remainingPath(fullPath, liveRider) : fullPath;

  // While queued, the leg of the order the rider is on now (rider -> that drop-off), drawn in
  // ash grey so it reads as someone else's trip. Endpoints rounded (~110 m) so the route is not
  // refetched on every GPS ping.
  const stop = queued ? riderQueue?.currentStop : null;
  const queueStop: LatLng | null = stop ? { latitude: stop.lat, longitude: stop.lng } : null;
  const round3 = (n: number) => Math.round(n * 1000) / 1000;
  const { path: queueRoad } = useRoadRoute(
    queueStop && riderLocation
      ? {
          fromLat: round3(riderLocation.lat),
          fromLng: round3(riderLocation.lng),
          toLat: queueStop.latitude,
          toLng: queueStop.longitude,
        }
      : null,
  );
  const queuePath =
    queueStop && riderLocation
      ? (queueRoad ?? [{ latitude: riderLocation.lat, longitude: riderLocation.lng }, queueStop])
      : [];

  // Direction of travel from the last two live positions: the fallback when the rider's phone
  // sends no GPS heading.
  const lastRider = useRef<LatLng | null>(null);
  const [movementBearing, setMovementBearing] = useState<number | null>(null);
  const rawRiderPoint: LatLng | null = riderLocation
    ? { latitude: riderLocation.lat, longitude: riderLocation.lng }
    : null;
  // GPS drifts a few metres off the road; when the rider is on the drawn route, draw them on it.
  const snapped = rawRiderPoint && routePath ? snapToPath(rawRiderPoint, routePath) : null;
  const riderPoint = snapped?.point ?? rawRiderPoint;
  // Which way the vehicle faces, best source first: the phone's GPS heading, then the road it is
  // on (turned to match the way it is moving along it), then the last movement.
  const gpsHeading = typeof riderLocation?.heading === 'number' ? riderLocation.heading : null;
  const roadBearing = snapped
    ? movementBearing !== null && angleBetween(snapped.segmentBearing, movementBearing) > 90
      ? (snapped.segmentBearing + 180) % 360
      : snapped.segmentBearing
    : null;
  const bearing = gpsHeading ?? roadBearing ?? movementBearing ?? 0;
  const vehicle = vehicleKind(rider?.vehicleType);
  const riderLat = riderLocation?.lat;
  const riderLng = riderLocation?.lng;
  useEffect(() => {
    if (riderLat === undefined || riderLng === undefined) return;
    const riderPoint: LatLng = { latitude: riderLat, longitude: riderLng };
    const prev = lastRider.current;
    if (prev && (prev.latitude !== riderPoint.latitude || prev.longitude !== riderPoint.longitude)) {
      setMovementBearing(bearingBetween(prev, riderPoint));
    }
    lastRider.current = riderPoint;
  }, [riderLat, riderLng]);

  // The camera follows the rider on every location update. Dragging the map pauses that so
  // the customer can look around; the re-centre button picks the rider up again.
  const [following, setFollowing] = useState(true);
  const followingRider = following && riderLat !== undefined && riderLng !== undefined && status !== 'delivered';
  const zoomedToRider = useRef(false);
  // Collapsing the card leaves only the heading, giving the map room to follow the rider.
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    if (!followingRider) return;
    const center = { latitude: riderLat!, longitude: riderLng! };
    if (!zoomedToRider.current) {
      // Lock-on: street level around the rider, tighter still with the card collapsed.
      zoomedToRider.current = true;
      const delta = collapsed ? 0.005 : 0.008;
      mapRef.current?.animateToRegion({ ...center, latitudeDelta: delta, longitudeDelta: delta }, 700);
    } else {
      // Later pings (and the card resizing) only pan, keeping whatever zoom the customer chose.
      mapRef.current?.animateCamera({ center }, { duration: 900 });
    }
  }, [followingRider, riderLat, riderLng, collapsed, cardHeight]);
  const setCardCollapsed = (next: boolean) => {
    setCollapsed(next);
    // Re-zoom on the rider for the new amount of map space.
    zoomedToRider.current = false;
    setFollowing(true);
  };
  // Swipe the card's top edge down to collapse, up to expand. Read through a ref because
  // the responder is created once.
  const collapseRef = useRef(setCardCollapsed);
  collapseRef.current = setCardCollapsed;
  const cardPan = useRef(
    PanResponder.create({
      // Capture, so a vertical drag takes over from the handle's tap.
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dy) > 8 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderRelease: (_, g) => {
        if (g.dy > 30) collapseRef.current(true);
        else if (g.dy < -30) collapseRef.current(false);
      },
    }),
  ).current;
  const pauseFollowing = () => {
    if (following) setFollowing(false);
  };
  const recenter = () => {
    zoomedToRider.current = false;
    setFollowing(true);
  };
  // Keeps the map's centre in the strip between the top buttons and the tracking card,
  // so a followed rider never hides behind the card.
  const mapPadding = { top: insets.top + 56, right: 0, bottom: cardHeight + cardBottom + 16, left: 0 };

  // Without a rider to follow (none yet, or delivered), frame the customer and the station.
  // Read through a ref so the camera re-frames when something appears, not on every rider ping.
  const frame = useRef({ customer, stationPoint, riderPoint });
  frame.current = { customer, stationPoint, riderPoint };
  const hasOrder = !!order;
  const hasStation = !!stationPoint;
  const hasRider = !!riderPoint;
  const topInset = insets.top;
  useEffect(() => {
    const { customer, stationPoint, riderPoint } = frame.current;
    if (!customer || followingRider) return;
    const points = [customer, ...(stationPoint ? [stationPoint] : []), ...(riderPoint ? [riderPoint] : [])];
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(points, {
        // mapPadding already keeps clear of the top buttons and the card.
        edgePadding: { top: 40, left: 60, right: 60, bottom: 40 },
        animated: true,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [hasOrder, hasStation, hasRider, routePath, topInset, followingRider]);

  // While queued, the rider has not started this order, so every step waits.
  const statusFor = (index: number): Status =>
    queued ? 'pending' : minStep > index ? 'completed' : minStep === index ? 'active' : 'pending';
  // The same content the toast for this moment shows, from the trip watcher's live phase/ETA.
  const livePhase = live?.phase;
  const liveContent: TripAlertContent | null =
    livePhase && livePhase !== 'searching' && livePhase !== 'delivered' && livePhase !== 'cancelled'
      ? tripAlertContent(livePhase, {
          riderName: rider?.firstName ?? null,
          stationName: station?.name ?? null,
          eta: live.eta,
          condition: live.condition ?? null,
          phase: livePhase,
          ordersAhead: riderQueue?.ordersAhead,
        })
      : null;
  const subtitleFor = (index: number): React.ReactNode => {
    if (queued && index === 0) return 'Up next';
    const state = statusFor(index);
    if (state === 'completed') return 'Done';
    if (state === 'active') return liveContent ? <StepDetail content={liveContent} /> : 'In progress';
    return 'Waiting';
  };

  const handleGoHome = () => navigation.navigate('Home');

  if (!order || !customer) {
    return (
      <View style={[styles.main, { alignItems: 'center', justifyContent: 'center', gap: 12 }]}>
        {orderQuery.isError ? (
          <TouchableOpacity onPress={() => orderQuery.refetch()} accessibilityRole="button">
            <Text style={styles.subtitle}>{errorMessage(orderQuery.error)} Tap to try again.</Text>
          </TouchableOpacity>
        ) : (
          <ActivityIndicator accessibilityLabel="Loading your order" />
        )}
        <TouchableOpacity style={[styles.homeButton, { top: insets.top + 4 }]} onPress={handleGoHome} accessibilityLabel="Go to Home">
          <House size={20} weight="bold" color="#000" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <View style={styles.map} onTouchMove={pauseFollowing}>
        <MapView
          ref={mapRef}
          style={styles.map}
          mapPadding={mapPadding}
          initialRegion={{
            latitude: customer.latitude,
            longitude: customer.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          }}
          userInterfaceStyle="light"
        >
          <UrlTile urlTemplate={MAP_TILE_URL} maximumZ={20} tileSize={256} />
          {ridePath.length > 1 && (
            <Polyline
              coordinates={ridePath}
              strokeColor="#0088FF"
              strokeWidth={4}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {queuePath.length > 1 && (
            <Polyline coordinates={queuePath} strokeColor="#A3A3A3" strokeWidth={4} lineCap="round" lineJoin="round" />
          )}
          {queueStop && (
            <Marker coordinate={queueStop} anchor={{ x: 0.5, y: 0.5 }} title="Current delivery" tracksViewChanges={false}>
              <View style={styles.queueStopDot} />
            </Marker>
          )}

          <Marker coordinate={customer} anchor={{ x: 0.5, y: 1 }} title="You">
            <SvgXml xml={LOCATION_MARKER_XML} width={34} height={55} />
          </Marker>

          {stationPoint && (
            <Marker
              coordinate={stationPoint}
              anchor={{ x: 0.5, y: 0.96 }}
              title={station?.name ?? 'Filling Station'}
              // Android redraws custom markers only while this is on; keep it on while the pump animates.
              tracksViewChanges={atStation}
            >
              <StationPinIcon selected active={atStation} />
            </Marker>
          )}

          {riderPoint && status !== 'delivered' && (
            <Marker coordinate={riderPoint} anchor={{ x: 0.5, y: 0.5 }} flat>
              <VehicleMarker kind={vehicle} bearing={bearing} />
            </Marker>
          )}
        </MapView>
      </View>

      {riderPoint && status !== 'delivered' && !following && cardHeight > 0 && (
        <TouchableOpacity
          style={[styles.recenterButton, { bottom: cardBottom + cardHeight + (showQueueBanner && queued ? 96 : 12) }]}
          onPress={recenter}
          accessibilityRole="button"
          accessibilityLabel="Follow the rider"
        >
          <NavigationArrow size={20} weight="fill" color={PRIMARY} />
        </TouchableOpacity>
      )}

      <TouchableOpacity style={[styles.homeButton, { top: insets.top + 4 }]} onPress={handleGoHome} accessibilityLabel="Go to Home">
        <House size={20} weight="bold" color="#000" />
      </TouchableOpacity>

      <View style={[styles.demoTools, { top: insets.top + 8 }]} pointerEvents="box-none">
        {showDemoSwitch && (
          <TouchableOpacity
            style={styles.demoSwitch}
            onPress={cycleDemoQueue}
            accessibilityRole="button"
            accessibilityLabel="Switch rider queue demo"
          >
            <View style={[styles.demoDot, demoQueue > 0 && styles.demoDotOn]} />
            <Text style={styles.demoSwitchText}>Queue demo · {demoQueue === 0 ? 'Off' : `${demoQueue} ahead`}</Text>
          </TouchableOpacity>
        )}
        {isDemo && DEMO_MODE && (
          <TouchableOpacity style={styles.demoSwitch} onPress={handleSimulate} accessibilityRole="button">
            {simRunning ? (
              <Stop size={12} weight="fill" color="#fff" />
            ) : status === 'delivered' ? (
              <ArrowCounterClockwise size={12} weight="bold" color="#fff" />
            ) : (
              <Play size={12} weight="fill" color={GREEN} />
            )}
            <Text style={styles.demoSwitchText}>
              {simRunning ? 'Stop trip' : status === 'delivered' ? 'Reset demo' : 'Simulate trip'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {showQueueBanner && queued && cardHeight > 0 && (
        <QueuedBanner
          queued={queued}
          bottom={cardBottom + cardHeight + 12}
          onDismiss={() => setBannerDismissedFor(queued.ordersAhead)}
        />
      )}

      <Animated.View
        layout={LinearTransition.springify().damping(20).stiffness(140)}
        style={[styles.cardWrap, { bottom: cardBottom }]}
        onLayout={(e) => setCardHeight(e.nativeEvent.layout.height)}
      >
        <GlassCard style={styles.card}>
          <View {...cardPan.panHandlers}>
            <Pressable
              style={styles.handleArea}
              onPress={() => setCardCollapsed(!collapsed)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={collapsed ? 'Show trip details' : 'Hide trip details'}
            >
              <View style={styles.handle} />
            </Pressable>
          </View>

          <View style={styles.cardBody}>
            <View {...cardPan.panHandlers}>
              <Text style={styles.title}>
                {reassigning ? 'Finding another rider' : queued ? queued.label : (statusBadge?.label ?? 'Track All Activities Here')}
              </Text>
              <Text style={styles.subtitle}>
                {reassigning
                  ? 'We are on it.'
                  : queued
                    ? queued.detail
                    : (statusBadge?.detail ?? 'Enjoy real time track system as your gas cylinder gets filled')}
              </Text>
              {!reassigning && liveContent?.etaStrong && (
                <View style={styles.etaRow}>
                  <Clock size={14} weight="bold" color={PRIMARY} />
                  {/* Same clock line as the toast and the active step. */}
                  <Text style={styles.etaText}>
                    {liveContent.etaSoft} {liveContent.etaStrong}
                  </Text>
                  {/* A tag only for a delay actually seen: a queue at the pump or the rider stuck in traffic. */}
                  {live.condition && <Text style={styles.etaTraffic}>· {CONDITION_TEXT[live.condition]}</Text>}
                </View>
              )}
            </View>

            {collapsed ? null : reassigning ? (
              <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={styles.reassigningRow}>
                <ActivityIndicator color={PRIMARY} />
                <Text style={styles.reassigningText}>No action needed on your part — we&apos;ll notify you the moment a new rider accepts.</Text>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn.duration(250)} exiting={FadeOut.duration(150)} style={styles.cardDetails}>
                {rider && <RiderCard rider={rider} />}

                <View>
                  {queued && (
                    <StackedStep
                      icon={QueuedIcon}
                      title={queued.ordersAhead === 1 ? 'Finishing a nearby delivery' : `Finishing ${queued.ordersAhead} deliveries`}
                      subtitle={liveContent && livePhase === 'queued' ? <StepDetail content={liveContent} /> : (queued.startsIn ?? 'In progress')}
                      status="active"
                      isLast={false}
                    />
                  )}
                  {TRIP_STEPS.map((step, i) => {
                    // Once the rider has the cylinder, the first step becomes "Cylinder picked up".
                    const Icon = i === 0 && hasPickedUp(status) ? CylinderIcon : STEP_ICONS[i];
                    const isLast = i === TRIP_STEPS.length - 1;
                    if (!Icon) {
                      const subtitle = subtitleFor(i);
                      return (
                        <FillingStep
                          key={step.key}
                          status={statusFor(i)}
                          isLast={isLast}
                          pumping={atStation}
                          detail={statusFor(i) === 'active' && typeof subtitle !== 'string' ? subtitle : undefined}
                        />
                      );
                    }
                    return (
                      <StackedStep
                        key={step.key}
                        icon={Icon}
                        title={i === 0 ? pickupStepTitle(status) : step.title}
                        subtitle={subtitleFor(i)}
                        status={statusFor(i)}
                        isLast={isLast}
                      />
                    );
                  })}
                </View>
              </Animated.View>
            )}
          </View>
        </GlassCard>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  queueStopDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#A3A3A3',
    borderWidth: 3,
    borderColor: '#fff',
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  homeButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  cardWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 16,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  handleArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 6,
  },
  cardDetails: {
    gap: 20,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom: 4,
  },
  cardBody: {
    gap: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  demoTools: {
    position: 'absolute',
    right: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0,136,255,0.08)',
  },
  etaText: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  etaTraffic: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  demoSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  demoDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  demoDotOn: {
    backgroundColor: GREEN,
  },
  demoSwitchText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  queueBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  queueBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,136,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    lineHeight: 19,
  },
  queueBannerMeta: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.55)',
    marginTop: 2,
  },
  reassigningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  reassigningText: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    lineHeight: 17,
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  riderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  // Photo 55, vehicle badge at (33, 25), rating pill at (6, 48).
  riderVisual: {
    width: 64.294,
    height: 67,
  },
  riderAvatar: {
    width: 55,
    height: 55,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  vehicleBadge: {
    position: 'absolute',
    left: 33,
    top: 25,
    width: 31.294,
    height: 31.294,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#fff',
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehicleBadgeImage: {
    width: 21.08,
    height: 21.08,
  },
  vehicleBadgeTilt: {
    transform: [{ rotate: '-34.31deg' }],
  },
  ratingPill: {
    position: 'absolute',
    left: 6,
    top: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 24,
    backgroundColor: '#fff',
    // Drop Shadow/200: 0 1 4 rgba(12,12,13,0.1) + 0 1 4 rgba(12,12,13,0.05).
    shadowColor: '#0C0C0D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#000',
  },
  riderInfo: {
    flexShrink: 1,
    alignItems: 'flex-start',
    gap: 4,
  },
  riderName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D1D1D',
  },
  plateChip: {
    padding: 2,
    borderRadius: 12,
    backgroundColor: '#FAFAFA',
  },
  plateText: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
  },
  vehicleLabel: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.4)',
  },
  callButton: {
    padding: 10,
    borderRadius: 40,
    backgroundColor: '#34C759',
  },
  stepRow: {
    flexDirection: 'row',
    gap: 14,
  },
  stepIconColumn: {
    alignItems: 'center',
  },
  stepIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconOutline: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  connector: {
    width: 2,
    flex: 1,
    minHeight: 23,
    marginTop: 4,
  },
  connectorDashed: {
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.2)',
  },
  stepTextColumn: {
    flex: 1,
    gap: 4,
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 12,
    color: '#000',
  },
  stepSubtitle: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.6)',
  },
  fillingTextColumn: {
    flex: 1,
    paddingBottom: 24,
    gap: 4,
  },
  stepDetail: {
    gap: 4,
  },
  stepClock: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  stepClockText: {
    fontSize: 10,
    color: 'rgba(0,0,0,0.5)',
  },
  stepClockStrong: {
    color: '#000',
    fontWeight: '600',
  },
  stepClockDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 2,
  },
  fillingTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepTitleInline: {
    fontSize: 12,
    color: '#000',
  },
  inlineBadge: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FAFAFA',
    borderRadius: 24,
  },
  inlineBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
