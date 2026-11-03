import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, UrlTile } from 'react-native-maps';
import Svg, { Path, SvgXml } from 'react-native-svg';
import { STATION_PUMP_ICON_XML, LOCATION_MARKER_XML } from '@/components/icons/BrandIcons';
import BikeRiderMarker from '@/components/BikeRiderMarker';
import StationPinIcon from '@/components/StationPinIcon';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Flask,
  GasPump,
  House,
  Minus,
  Package,
  PencilSimple,
  Phone,
  Plus,
} from 'phosphor-react-native';
import { MAP_TILE_URL } from '@/lib/mapTiles';
import GlassCard from '@/components/GlassCard';
import CancelOrderModal from '@/components/CancelOrderModal';
import RatingSheet from '@/components/RatingSheet';

const PRIMARY = '#0088FF';
const PRIMARY_TINT = 'rgba(0,136,255,0.10)';
const GREEN = '#52B922';
const BLUE = '#0085FF';
const GOLD = '#B8860B';

const DEFAULT_LATITUDE = 6.678045;
const DEFAULT_LONGITUDE = -1.573568;

// Demo route path used purely as a visual backdrop — no live rider
// location feed exists yet (placeholder frontend, per standing direction
// to defer backend/live-tracking integration). Goes station → customer,
// the direction the rider actually travels.
const DEMO_STATION_COORD = { latitude: DEFAULT_LATITUDE + 0.006, longitude: DEFAULT_LONGITUDE - 0.004 };
const DEMO_CUSTOMER_COORD = { latitude: DEFAULT_LATITUDE, longitude: DEFAULT_LONGITUDE };
const DEMO_ROUTE = [
  DEMO_STATION_COORD,
  { latitude: DEFAULT_LATITUDE + 0.003, longitude: DEFAULT_LONGITUDE - 0.001 },
  DEMO_CUSTOMER_COORD,
];

type LatLng = { latitude: number; longitude: number };

function bearingBetween(a: LatLng, b: LatLng) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// Walks a fraction of the way along a polyline (by point count, not true
// arc-length — good enough for a smooth-looking rider position) and reports
// the bearing of the segment it lands on, so the marker can rotate to face
// its direction of travel. Ported from the web app's MapView.
function pointAlongPath(path: LatLng[], progress: number): (LatLng & { bearing: number }) | null {
  if (path.length < 2) return null;
  const clamped = Math.max(0, Math.min(1, progress));
  const exactIndex = clamped * (path.length - 1);
  const index = Math.min(path.length - 2, Math.floor(exactIndex));
  const frac = exactIndex - index;
  const a = path[index];
  const b = path[index + 1];
  return {
    latitude: a.latitude + (b.latitude - a.latitude) * frac,
    longitude: a.longitude + (b.longitude - a.longitude) * frac,
    bearing: bearingBetween(a, b),
  };
}

const RIDER_LOOP_MS = 12000;
const RIDER_TICK_MS = 200;

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

function FillingIcon({ size = 16, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M14.893 6.21967L13.5597 5.55301C13.313 5.43301 13.0063 5.52634 12.8863 5.77301C12.7597 6.02634 12.8597 6.32634 13.1063 6.44634L14.1663 6.97301V10.1663L11.6663 10.173V3.33301C11.6663 1.99967 10.773 1.33301 9.66634 1.33301H4.33301C3.22634 1.33301 2.33301 1.99967 2.33301 3.33301V14.1663H1.33301C1.05967 14.1663 0.833008 14.393 0.833008 14.6663C0.833008 14.9397 1.05967 15.1663 1.33301 15.1663H12.6663C12.9397 15.1663 13.1663 14.9397 13.1663 14.6663C13.1663 14.393 12.9397 14.1663 12.6663 14.1663H11.6663V11.173L14.6663 11.1663C14.9463 11.1663 15.1663 10.9397 15.1663 10.6663V6.66634C15.1663 6.47967 15.0597 6.30634 14.893 6.21967ZM3.99967 4.59301C3.99967 3.66634 4.56634 3.33301 5.25967 3.33301H8.74634C9.43301 3.33301 9.99967 3.66634 9.99967 4.59301V5.41301C9.99967 6.33301 9.43301 6.66634 8.73967 6.66634H5.25967C4.56634 6.66634 3.99967 6.33301 3.99967 5.40634V4.59301ZM4.33301 8.16634H6.33301C6.60634 8.16634 6.83301 8.39301 6.83301 8.66634C6.83301 8.93967 6.60634 9.16634 6.33301 9.16634H4.33301C4.05967 9.16634 3.83301 8.93967 3.83301 8.66634C3.83301 8.39301 4.05967 8.16634 4.33301 8.16634Z" fill={color} />
    </Svg>
  );
}

function RefillIcon({ size = 16, color = '#fff' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path d="M14.3736 7.16036L13.4669 6.10703C13.2936 5.90703 13.1536 5.5337 13.1536 5.26703V4.1337C13.1536 3.42703 12.5736 2.84703 11.8669 2.84703H10.7336C10.4736 2.84703 10.0936 2.70703 9.89358 2.5337L8.84025 1.62703C8.38025 1.2337 7.62691 1.2337 7.16025 1.62703L6.11358 2.54036C5.91358 2.70703 5.53358 2.84703 5.27358 2.84703H4.12025C3.41358 2.84703 2.83358 3.42703 2.83358 4.1337V5.2737C2.83358 5.5337 2.69358 5.90703 2.52691 6.10703L1.62691 7.16703C1.24025 7.62703 1.24025 8.3737 1.62691 8.8337L2.52691 9.8937C2.69358 10.0937 2.83358 10.467 2.83358 10.727V11.867C2.83358 12.5737 3.41358 13.1537 4.12025 13.1537H5.27358C5.53358 13.1537 5.91358 13.2937 6.11358 13.467L7.16691 14.3737C7.62691 14.767 8.38025 14.767 8.84691 14.3737L9.90025 13.467C10.1002 13.2937 10.4736 13.1537 10.7402 13.1537H11.8736C12.5802 13.1537 13.1602 12.5737 13.1602 11.867V10.7337C13.1602 10.4737 13.3002 10.0937 13.4736 9.8937L14.3802 8.84036C14.7669 8.38036 14.7669 7.62036 14.3736 7.16036ZM10.7736 6.74036L7.55358 9.96036C7.46025 10.0537 7.33358 10.107 7.20025 10.107C7.06691 10.107 6.94025 10.0537 6.84691 9.96036L5.23358 8.34703C5.04025 8.1537 5.04025 7.8337 5.23358 7.64036C5.42691 7.44703 5.74691 7.44703 5.94025 7.64036L7.20025 8.90036L10.0669 6.0337C10.2602 5.84036 10.5802 5.84036 10.7736 6.0337C10.9669 6.22703 10.9669 6.54703 10.7736 6.74036Z" fill={color} />
    </Svg>
  );
}

type Status = 'completed' | 'active' | 'pending';

const STEPS = [
  { key: 'rider', icon: RiderIcon, title: 'Rider heading to the filling station' },
  { key: 'filling', icon: FillingIcon, title: 'Filling Process' },
  { key: 'refill', icon: RefillIcon, title: 'On the way to you' },
] as const;

const STEP_DELAY_MS = 2800;

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
  subtitle: string;
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
        <Text style={styles.stepSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

function FillingStep({ status, isLast }: { status: Status; isLast: boolean }) {
  const bg = status === 'pending' ? '#FAFAFA' : BLUE;
  const badgeText = status === 'completed' ? 'Completed' : status === 'active' ? 'In Progress' : null;
  const badgeColor = status === 'completed' ? GREEN : BLUE;

  return (
    <View style={styles.stepRow}>
      <View style={styles.stepIconColumn}>
        <View style={[styles.stepIconCircle, styles.fuelIconCircle, status === 'pending' && styles.fuelIconCirclePending]}>
          <SvgXml xml={STATION_PUMP_ICON_XML} width={20} height={20} />
        </View>
        {!isLast && <Connector color={status === 'pending' ? null : bg} />}
      </View>

      <View style={styles.fillingTextRow}>
        <Text style={styles.stepTitleInline}>Filling Process</Text>
        {badgeText && (
          <View style={styles.inlineBadge}>
            <Text style={[styles.inlineBadgeText, { color: badgeColor }]}>{badgeText}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// Demo-only mock data for the "rider is busy with another delivery" state —
// stands in for a real backend field (e.g. order.queue) until that exists.
// Represented as a range, not a single number: a queued ETA depends on how
// the rider's current drop-off goes, so a precise-looking single value
// would just be a more confident-sounding guess, not a more accurate one.
const DEMO_QUEUE = {
  position: 2,
  etaMinMinutes: 15,
  etaMaxMinutes: 25,
  busyRiderName: 'Kwame Osei Asiedu',
};

function QueuedCard({ canCancel, onCancel }: { canCancel: boolean; onCancel: () => void }) {
  return (
    <View style={styles.centerCol}>
      <View style={styles.queueIconCircle}>
        <Clock size={26} weight="bold" color={GOLD} />
      </View>
      <View style={styles.centerCol}>
        <Text style={styles.cardTitle}>You're in the Queue</Text>
        <Text style={styles.queueSubtitle}>
          {DEMO_QUEUE.busyRiderName} is finishing another delivery nearby. Your order should start in{' '}
          {DEMO_QUEUE.etaMinMinutes}–{DEMO_QUEUE.etaMaxMinutes} min once they're done.
        </Text>
      </View>
      <View style={styles.queueBadge}>
        <Text style={styles.queueBadgeText}>Position {DEMO_QUEUE.position} in queue</Text>
      </View>
      {canCancel && (
        <TouchableOpacity onPress={onCancel}>
          <Text style={styles.cancelLink}>Cancel Order</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Demo-only mock data for "rider found a problem with the order" — stands
// in for a real backend-driven edit (e.g. the rider app's "Report an Issue"
// sheet, which picks one of these reasons and optionally a note). Defaults
// to the "no LPG" case (station AND size both change) to match the
// reference design's two-row summary.
type IssueReason = 'wrong_size' | 'station_closed' | 'no_lpg' | 'other';

const DEMO_ISSUE = {
  reasonType: 'no_lpg' as IssueReason,
  reasonLabel: 'No LPG available at the station',
  riderNote: '',
  oldSize: 'small',
  oldStationId: 'total',
};

const DEMO_CYLINDER_OPTIONS = [
  { size: 'small', name: 'Small Size', shortName: 'Small', price: 5, image: require('@/assets/small.png') },
  { size: 'medium', name: 'Medium Size', shortName: 'Medium', price: 10, image: require('@/assets/medium.png') },
  { size: 'large', name: 'Large Size', shortName: 'Large', price: 15, image: require('@/assets/medium.png') },
];

const DEMO_STATION_OPTIONS = [
  { id: 'goil', name: 'GOIL Filling Station', shortName: 'GOIL', area: 'Adum', distanceKm: 0.4, fee: 0, logo: require('@/assets/stations/goil-icon.png') },
  { id: 'shell', name: 'Shell Filling Station', shortName: 'Shell', area: 'Adum', distanceKm: 1.7, fee: 10, logo: require('@/assets/stations/shell.png') },
  { id: 'total', name: 'TotalEnergies Filling Station', shortName: 'Total', area: 'Adum', distanceKm: 3.0, fee: 30, logo: require('@/assets/stations/totalenergies.png') },
];

const currencyAmount = (n: number) => `GHC ${n.toFixed(2)}`;

function ChangeHeader() {
  return (
    <View style={styles.changeHeaderRow}>
      <View style={styles.changeHeaderIcon}>
        <PencilSimple size={18} weight="bold" color={GOLD} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>Rider Requested a Change</Text>
        <Text style={styles.changeHeaderSubtitle}>Edit and Confirm changes to continue</Text>
      </View>
    </View>
  );
}

function SummaryCardRow({ icon, label, from, to }: { icon: React.ReactNode; label: string; from: string; to: string }) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIconBox}>{icon}</View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <View style={styles.summaryValueRow}>
          <Text style={styles.summaryFrom}>{from}</Text>
          <ArrowRight size={12} weight="bold" color="rgba(0,0,0,0.3)" />
          <Text style={styles.summaryTo}>{to}</Text>
        </View>
      </View>
    </View>
  );
}

function DashedDivider() {
  return <View style={styles.dashedDivider} />;
}

// The customer, not the rider, decides the actual fix — the rider only
// flags what's wrong. This walks: see the issue → reselect size/station
// (whichever the issue calls for) → review a before/after summary → submit.
function OrderChangeFlow({
  onSubmit,
  onCancelOrder,
}: {
  onSubmit: (message: string) => void;
  onCancelOrder: () => void;
}) {
  type FlowStep = 'intro' | 'select_station' | 'select_size' | 'summary';
  const [step, setStep] = useState<FlowStep>('intro');
  const [selectedSize, setSelectedSize] = useState(DEMO_ISSUE.oldSize);
  const [selectedStationId, setSelectedStationId] = useState(DEMO_ISSUE.oldStationId);

  const needsSizeFix = DEMO_ISSUE.reasonType === 'wrong_size' || DEMO_ISSUE.reasonType === 'no_lpg';
  const needsStationFix = DEMO_ISSUE.reasonType === 'station_closed' || DEMO_ISSUE.reasonType === 'no_lpg';

  const flowOrder: FlowStep[] = [
    ...(needsStationFix ? (['select_station'] as const) : []),
    ...(needsSizeFix ? (['select_size'] as const) : []),
  ];
  const goToFirstStep = () => setStep(flowOrder[0] ?? 'summary');
  const goNext = () => {
    const i = flowOrder.indexOf(step as 'select_station' | 'select_size');
    setStep(i >= 0 && i < flowOrder.length - 1 ? flowOrder[i + 1] : 'summary');
  };
  const goBack = () => {
    const i = flowOrder.indexOf(step as 'select_station' | 'select_size');
    setStep(i > 0 ? flowOrder[i - 1] : 'intro');
  };

  const oldCylinder = DEMO_CYLINDER_OPTIONS.find((c) => c.size === DEMO_ISSUE.oldSize)!;
  const oldStation = DEMO_STATION_OPTIONS.find((s) => s.id === DEMO_ISSUE.oldStationId)!;
  const newCylinder = DEMO_CYLINDER_OPTIONS.find((c) => c.size === selectedSize)!;
  const newStation = DEMO_STATION_OPTIONS.find((s) => s.id === selectedStationId)!;

  const oldAmount = oldCylinder.price + oldStation.fee;
  const newAmount = newCylinder.price + newStation.fee;
  const diff = newAmount - oldAmount;

  if (step === 'intro') {
    return (
      <View style={styles.flowCol}>
        <ChangeHeader />

        <View>
          <Text style={styles.issueReason}>{DEMO_ISSUE.reasonLabel}</Text>
          {!!DEMO_ISSUE.riderNote && <Text style={styles.issueNote}>"{DEMO_ISSUE.riderNote}"</Text>}
        </View>

        <View style={{ gap: 8 }}>
          {needsSizeFix || needsStationFix ? (
            <TouchableOpacity style={styles.blackButton} onPress={goToFirstStep}>
              <Text style={styles.blackButtonText}>Update Your Order</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.blackButton}
              onPress={() => Alert.alert('Contact Support', 'Our team will reach out shortly to help resolve this.')}
            >
              <Text style={styles.blackButtonText}>Contact Support</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onCancelOrder}>
            <Text style={styles.cancelLink}>Cancel Order Instead</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Mirrors Home.tsx's actual "Available Filling Stations" picker (back
  // arrow + title, logo chip, distance, "Closest" badge, selected
  // highlight, fee).
  if (step === 'select_station') {
    return (
      <View style={styles.flowCol}>
        <View style={styles.pickerHeaderRow}>
          <TouchableOpacity style={styles.smallBackButton} onPress={goBack}>
            <ArrowLeft size={14} weight="bold" color="#000" />
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>Available Filling Stations</Text>
        </View>

        <View style={{ gap: 10 }}>
          {DEMO_STATION_OPTIONS.map((s, i) => {
            const isSelected = s.id === selectedStationId;
            const isClosest = i === 0;
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.stationOption, isSelected && styles.stationOptionSelected]}
                onPress={() => setSelectedStationId(s.id)}
              >
                <Image source={s.logo} style={styles.stationOptionLogo} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.stationOptionName}>{s.name}</Text>
                  <View style={styles.stationOptionMetaRow}>
                    <Text style={styles.stationOptionDistance}>{s.distanceKm.toFixed(1)} km away</Text>
                    {isClosest && (
                      <View style={styles.closestRow}>
                        <CheckCircle size={13} weight="fill" color="#34C759" />
                        <Text style={styles.closestText}>Closest</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.stationOptionFee}>{s.fee === 0 ? 'GHC 0.00' : currencyAmount(s.fee)}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={goNext}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Mirrors Home.tsx's actual "Cylinder Size" panel (image, name, price,
  // +/- counter). This flow corrects one cylinder, not a cart, so picking a
  // size here exclusively sets that size's count to 1.
  if (step === 'select_size') {
    return (
      <View style={styles.flowCol}>
        <View style={styles.pickerHeaderRow}>
          <TouchableOpacity style={styles.smallBackButton} onPress={goBack}>
            <ArrowLeft size={14} weight="bold" color="#000" />
          </TouchableOpacity>
          <Text style={styles.pickerTitle}>Cylinder Size</Text>
        </View>

        <View style={{ gap: 4 }}>
          {DEMO_CYLINDER_OPTIONS.map((c) => {
            const qty = selectedSize === c.size ? 1 : 0;
            return (
              <View key={c.size} style={styles.sizeOptionRow}>
                <Image source={c.image} style={styles.sizeOptionImage} resizeMode="contain" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.stationOptionName}>{c.name}</Text>
                  <Text style={styles.sizeOptionPrice}>GH {c.price.toFixed(2)}</Text>
                </View>
                <View style={styles.sizeOptionControls}>
                  <View style={[styles.sizeStepperButton, { opacity: qty > 0 ? 1 : 0.4 }]}>
                    <Minus size={12} weight="bold" color="rgba(0,0,0,0.6)" />
                  </View>
                  <Text style={styles.sizeOptionQty}>{qty}</Text>
                  <TouchableOpacity
                    style={[styles.sizeStepperButton, styles.sizeStepperButtonActive]}
                    onPress={() => setSelectedSize(c.size)}
                  >
                    <Plus size={12} weight="bold" color={PRIMARY} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={goNext}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.flowCol}>
      <ChangeHeader />

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeaderRow}>
          <View style={styles.summaryHeaderLeft}>
            <Package size={16} weight="bold" color="rgba(0,0,0,0.5)" />
            <Text style={styles.summaryHeaderLabel}>Order</Text>
          </View>
          <View style={styles.summaryHeaderLeft}>
            <Package size={14} weight="fill" color="rgba(0,0,0,0.6)" />
            <Text style={styles.summaryHeaderValue}>1 cylinder</Text>
          </View>
        </View>

        <DashedDivider />

        {needsStationFix && (
          <>
            <SummaryCardRow
              icon={<GasPump size={16} weight="bold" color="rgba(0,0,0,0.6)" />}
              label="Filling Station"
              from={`${oldStation.shortName} — ${oldStation.area}`}
              to={`${newStation.shortName} — ${newStation.area}`}
            />
            <DashedDivider />
          </>
        )}

        {needsSizeFix && (
          <SummaryCardRow
            icon={<Image source={newCylinder.image} style={{ width: 20, height: 20 }} resizeMode="contain" />}
            label="Cylinder Size"
            from={oldCylinder.shortName}
            to={newCylinder.shortName}
          />
        )}

        <View style={styles.summaryDivider} />

        <View style={styles.summaryTotalRow}>
          <Text style={styles.summaryTotalLabel}>New Total</Text>
          <Text style={styles.summaryTotalValue}>{currencyAmount(newAmount)}</Text>
        </View>
        {diff !== 0 && (
          <Text style={[styles.summaryDiff, { color: diff > 0 ? GOLD : GREEN }]}>
            {diff > 0 ? '+' : ''}
            {currencyAmount(diff)} vs. original order
          </Text>
        )}
      </View>

      <View style={{ gap: 8 }}>
        <TouchableOpacity
          style={styles.greenButton}
          onPress={() => {
            const sizeLabel = needsSizeFix ? newCylinder.name : null;
            onSubmit(
              `Sent to your rider${sizeLabel ? ` — ${sizeLabel}` : ''}${
                needsStationFix ? ` from ${newStation.name}` : ''
              }. New total: ${currencyAmount(newAmount)}.`
            );
          }}
        >
          <Text style={styles.greenButtonText}>Approve & Pay Difference</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onCancelOrder}>
          <Text style={styles.cancelLink}>Decline & Cancel Order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type RiderInfo = { firstName: string; lastName: string; phoneNumber: string };
const DEMO_RIDER: RiderInfo = { firstName: 'Kwame', lastName: 'Rider', phoneNumber: '0591234567' };

function RiderCard({ rider }: { rider: RiderInfo }) {
  const initials = `${rider.firstName[0] ?? ''}${rider.lastName[0] ?? ''}`.toUpperCase();

  return (
    <View style={styles.riderCard}>
      <View style={styles.riderAvatar}>
        <Text style={styles.riderAvatarText}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.riderName} numberOfLines={1}>
          {rider.firstName} {rider.lastName}
        </Text>
        <Text style={styles.riderPhone}>{rider.phoneNumber}</Text>
      </View>
      <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL(`tel:${rider.phoneNumber}`)}>
        <Phone size={18} weight="fill" color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

type DemoMode = 'normal' | 'queued' | 'change_requested';
const DEMO_MODES: { key: DemoMode; label: string }[] = [
  { key: 'normal', label: 'Normal' },
  { key: 'queued', label: 'Queued' },
  { key: 'change_requested', label: 'Change Requested' },
];

export default function Tracker() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  // Our mocked step progress — by the time this screen is reached the
  // rider is already assigned (the FindingRider screen covers the "search"
  // phase), so this starts at step 0 and auto-advances. No live backend
  // feed exists yet, per standing direction to defer that integration.
  const [minStep, setMinStep] = useState(0);
  const [demoMode, setDemoMode] = useState<DemoMode>('normal');
  const [ratingSheetVisible, setRatingSheetVisible] = useState(false);

  useEffect(() => {
    if (demoMode !== 'normal' || minStep >= STEPS.length) return;
    const timer = setTimeout(() => setMinStep((s) => s + 1), STEP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [demoMode, minStep]);

  // Ask for a rating/complaint the moment a delivery finishes, instead of
  // only offering it from a details page the customer might never open.
  useEffect(() => {
    if (demoMode === 'normal' && minStep >= STEPS.length) {
      setRatingSheetVisible(true);
    }
  }, [demoMode, minStep]);

  // Road-following route from the station to the customer, via OSRM's free
  // public routing API — same approach as Home.tsx. Falls back to the
  // straight demo segments (below) while loading or if the request fails.
  const [routePath, setRoutePath] = useState<LatLng[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `https://router.project-osrm.org/route/v1/driving/${DEMO_STATION_COORD.longitude},${DEMO_STATION_COORD.latitude};${DEMO_CUSTOMER_COORD.longitude},${DEMO_CUSTOMER_COORD.latitude}?overview=full&geometries=geojson`;

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
  }, []);

  const ridePath = routePath ?? DEMO_ROUTE;

  // Animated rider marker traveling the route, same loop-and-sample
  // approach as the web app (recompute position/bearing on a tick rather
  // than animating the marker's coordinate directly, since react-native-maps
  // markers reposition imperatively, not via a transform the UI thread can
  // tween on its own).
  const showRider = demoMode === 'normal' && minStep < STEPS.length;
  const [riderProgress, setRiderProgress] = useState(0);

  useEffect(() => {
    if (!showRider) return;
    const start = Date.now();
    const id = setInterval(() => {
      setRiderProgress(((Date.now() - start) % RIDER_LOOP_MS) / RIDER_LOOP_MS);
    }, RIDER_TICK_MS);
    return () => clearInterval(id);
  }, [showRider]);

  const riderPoint = showRider ? pointAlongPath(ridePath, riderProgress) : null;

  // Zoom/pan to fit the customer, the station, and the rider all at once —
  // re-fit whenever the rider marker is shown/hidden or the real route
  // comes in (its appearance shouldn't force a re-fit on every 200ms
  // position tick, just once when it joins/leaves the set of points being
  // framed, or when the route shape itself changes).
  useEffect(() => {
    const points = [DEMO_CUSTOMER_COORD, DEMO_STATION_COORD, ...(riderPoint ? [riderPoint] : [])];
    const timer = setTimeout(() => {
      mapRef.current?.fitToCoordinates(points, {
        edgePadding: { top: insets.top + 80, left: 60, right: 60, bottom: 340 },
        animated: true,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [showRider, routePath]);

  const statusFor = (index: number): Status => (minStep > index ? 'completed' : minStep === index ? 'active' : 'pending');
  const subtitleFor = (index: number) => {
    const status = statusFor(index);
    if (status === 'completed') return 'Done';
    if (status === 'active') return 'In progress';
    return 'Waiting';
  };

  const handleGoHome = () => navigation.navigate('Home');

  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  const handleCancel = () => {
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = (reason: string) => {
    setCancelModalVisible(false);
    setDemoMode('normal');
    Alert.alert(
      'Order Cancelled',
      `Your order has been cancelled and any payment held will be refunded.\n\nReason: ${reason}`,
      [{ text: 'OK', onPress: handleGoHome }]
    );
  };

  return (
    <View style={styles.main}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: DEFAULT_LATITUDE,
          longitude: DEFAULT_LONGITUDE,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        }}
        userInterfaceStyle="light"
      >
        <UrlTile urlTemplate={MAP_TILE_URL} maximumZ={20} tileSize={256} />
        <Polyline
          coordinates={ridePath}
          strokeColor="#0088FF"
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />

        <Marker coordinate={DEMO_CUSTOMER_COORD} anchor={{ x: 0.5, y: 1 }} title="You">
          <SvgXml xml={LOCATION_MARKER_XML} width={34} height={55} />
        </Marker>

        <Marker coordinate={DEMO_STATION_COORD} anchor={{ x: 0.5, y: 0.96 }} title="Filling Station">
          <StationPinIcon selected />
        </Marker>

        {riderPoint && (
          <Marker coordinate={{ latitude: riderPoint.latitude, longitude: riderPoint.longitude }} anchor={{ x: 0.5, y: 0.5 }} flat>
            <BikeRiderMarker bearing={riderPoint.bearing} />
          </Marker>
        )}
      </MapView>

      <TouchableOpacity style={[styles.homeButton, { top: insets.top + 4 }]} onPress={handleGoHome}>
        <House size={20} weight="bold" color="#000" />
      </TouchableOpacity>

      {/* Demo-only: preview states that need a backend feature which
          doesn't exist yet — rider busy with another delivery (queued), or
          rider flagging a problem with the order (change requested). */}
      <View style={[styles.demoPanel, { top: insets.top + 4 }]}>
        <View style={styles.demoPanelHeader}>
          <Flask size={12} weight="bold" color="rgba(0,0,0,0.5)" />
          <Text style={styles.demoPanelHeaderText}>Demo</Text>
        </View>
        {DEMO_MODES.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[styles.demoOption, demoMode === opt.key && styles.demoOptionActive]}
            onPress={() => setDemoMode(opt.key)}
          >
            <Text style={[styles.demoOptionText, demoMode === opt.key && styles.demoOptionTextActive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <GlassCard style={[styles.card, { bottom: Math.max(insets.bottom, 8) }]}>
        <View style={styles.handle} />

        <View style={styles.cardBody}>
          {demoMode === 'change_requested' ? (
            <OrderChangeFlow
              onSubmit={(message) => {
                setDemoMode('normal');
                Alert.alert('Order Updated', message);
              }}
              onCancelOrder={() => setCancelModalVisible(true)}
            />
          ) : demoMode === 'queued' ? (
            <QueuedCard canCancel onCancel={handleCancel} />
          ) : (
            <>
              <View>
                <Text style={styles.title}>Track All Activities Here</Text>
                <Text style={styles.subtitle}>Enjoy real time track system as your gas cylinder gets filled</Text>
              </View>

              <RiderCard rider={DEMO_RIDER} />

              <View>
                <StackedStep
                  icon={STEPS[0].icon}
                  title={STEPS[0].title}
                  subtitle={subtitleFor(0)}
                  status={statusFor(0)}
                  isLast={false}
                />
                <FillingStep status={statusFor(1)} isLast={false} />
                <StackedStep
                  icon={STEPS[2].icon}
                  title={STEPS[2].title}
                  subtitle={subtitleFor(2)}
                  status={statusFor(2)}
                  isLast
                />
              </View>

              {/* {minStep >= STEPS.length && <Text style={styles.deliveredText}>Delivered!</Text>} */}
            </>
          )}
        </View>
      </GlassCard>

      <CancelOrderModal
        visible={cancelModalVisible}
        onClose={() => setCancelModalVisible(false)}
        onConfirm={handleConfirmCancel}
      />

      <RatingSheet
        visible={ratingSheetVisible}
        riderName={DEMO_RIDER.firstName}
        onClose={() => setRatingSheetVisible(false)}
        onSubmit={() => setRatingSheetVisible(false)}
      />
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
  demoPanel: {
    position: 'absolute',
    right: 16,
    gap: 6,
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.25)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  demoPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  demoPanelHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.5)',
  },
  demoOption: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FAFAFA',
  },
  demoOptionActive: {
    backgroundColor: GOLD,
  },
  demoOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  demoOptionTextActive: {
    color: '#fff',
  },
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  centerCol: {
    alignItems: 'center',
    gap: 12,
  },
  queueIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(184,134,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueSubtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
    textAlign: 'center',
    marginTop: 4,
  },
  queueBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(184,134,11,0.10)',
  },
  queueBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: GOLD,
  },
  cancelLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D92D20',
    textAlign: 'center',
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 4,
    borderRadius: 36,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  riderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderAvatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  riderName: {
    fontSize: 14,
    fontWeight: '700',
  },
  riderPhone: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GREEN,
    alignItems: 'center',
    justifyContent: 'center',
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
  fuelIconCircle: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,136,255,0.25)',
  },
  fuelIconCirclePending: {
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
  fillingTextRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 24,
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
  deliveredText: {
    fontSize: 13,
    fontWeight: '700',
    color: GREEN,
  },
  flowCol: {
    gap: 14,
  },
  changeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  changeHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(184,134,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeHeaderSubtitle: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
    marginTop: 2,
  },
  issueReason: {
    fontSize: 13,
    fontWeight: '600',
  },
  issueNote: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.6)',
    marginTop: 6,
    fontStyle: 'italic',
  },
  blackButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  blackButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  pickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  smallBackButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  stationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stationOptionSelected: {
    backgroundColor: PRIMARY_TINT,
    borderColor: PRIMARY,
  },
  stationOptionLogo: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  stationOptionName: {
    fontSize: 14,
    fontWeight: '700',
  },
  stationOptionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  stationOptionDistance: {
    fontSize: 12,
    color: 'rgba(0,0,0,0.5)',
  },
  closestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  closestText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
  },
  stationOptionFee: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  sizeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
  },
  sizeOptionImage: {
    width: 32,
    height: 40,
  },
  sizeOptionPrice: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
  },
  sizeOptionControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sizeStepperButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeStepperButtonActive: {
    borderColor: PRIMARY,
  },
  sizeOptionQty: {
    fontSize: 14,
    fontWeight: '600',
    width: 16,
    textAlign: 'center',
  },
  summaryCard: {
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  summaryHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  summaryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryHeaderLabel: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.5)',
  },
  summaryHeaderValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  dashedDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  summaryIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(0,0,0,0.4)',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryFrom: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.4)',
    textDecorationLine: 'line-through',
  },
  summaryTo: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 14,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  summaryTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryDiff: {
    fontSize: 11,
    textAlign: 'right',
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  greenButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: GREEN,
    alignItems: 'center',
  },
  greenButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
