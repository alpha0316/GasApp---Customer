import {
  ArrowUUpLeft,
  CheckCircle,
  CreditCard,
  GasCan,
  GasPump,
  Hourglass,
  House,
  MapPin,
  Motorcycle,
  Package,
  Tag,
  TrafficSignal,
  Warning,
  XCircle,
  type Icon,
} from 'phosphor-react-native';
import type { ImageSourcePropType } from 'react-native';
import { RIDER_HELMET_XML } from '@/components/icons/BrandIcons';

export interface EventStyle {
  Icon: Icon;
  color: string;
  // Filling shows the animated station pump instead of a flat glyph.
  pump?: boolean;
  // A full-colour illustration (SVG) to draw instead of the glyph, e.g. the rider helmet.
  xml?: string;
  // A picture to draw instead of the glyph, e.g. the gas cylinder.
  image?: ImageSourcePropType;
}

// The app's blue gas cylinder (also the splash logo).
const CYLINDER_IMAGE: ImageSourcePropType = require('@/assets/images/gas-cylinder-logo.png');

// One icon and colour per kind of update, shared by the toasts and the Notifications list.
// Keys are the app's trip events plus the server's notification template keys.
const STYLES: Record<string, EventStyle> = {
  payment_confirmed: { Icon: CreditCard, color: '#2F3DE0' },
  queued: { Icon: Hourglass, color: '#8E2DA8' },
  rider_assigned: { Icon: Motorcycle, color: '#007AFF', xml: RIDER_HELMET_XML },
  to_customer_pickup: { Icon: Motorcycle, color: '#007AFF', xml: RIDER_HELMET_XML },
  arriving_pickup: { Icon: GasCan, color: '#F08A00' },
  picked_up: { Icon: GasCan, color: '#007AFF', image: CYLINDER_IMAGE },
  to_station: { Icon: GasCan, color: '#007AFF', image: CYLINDER_IMAGE },
  approaching_station: { Icon: MapPin, color: '#E5262A' },
  filling: { Icon: GasPump, color: '#0085FF', pump: true },
  en_route_to_customer: { Icon: Motorcycle, color: '#007AFF', xml: RIDER_HELMET_XML },
  to_customer_dropoff: { Icon: Motorcycle, color: '#007AFF', xml: RIDER_HELMET_XML },
  arriving_dropoff: { Icon: House, color: '#F08A00' },
  delivered: { Icon: CheckCircle, color: '#22C55E' },
  refund_started: { Icon: ArrowUUpLeft, color: '#6B7280' },
  order_cancelled_by_admin: { Icon: XCircle, color: '#EF4444' },
  cancelled: { Icon: XCircle, color: '#EF4444' },
  reassigning: { Icon: Warning, color: '#F5A524' },
  station_queue: { Icon: GasPump, color: '#F08A00', pump: true },
  traffic_delay: { Icon: TrafficSignal, color: '#F08A00' },
  promo: { Icon: Tag, color: '#B8860B' },
};

const FALLBACK: EventStyle = { Icon: Package, color: '#0A6CFF' };

export const eventStyle = (kind: string): EventStyle => STYLES[kind] ?? FALLBACK;
