// Types follow the JSON the gasapp API sends (gasapp-backend/docs/FRONTEND_INTEGRATION.md).
export type Role = 'customer' | 'rider' | 'admin';
export type CylinderSize = 'small' | 'medium' | 'large';
export type PaymentMethod = 'paystack' | 'cash';
export type OtpChannel = 'sms' | 'email';
// GeoJSON order: lng first.
export type GeoPoint = { type: 'Point'; coordinates: [lng: number, lat: number] };

export type OrderStatus =
  | 'pending_payment'
  | 'awaiting_rider'
  | 'rider_assigned'
  | 'picked_up'
  | 'filling'
  | 'en_route_to_customer'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'held'
  | 'released'
  | 'refund_pending'
  | 'refunded'
  | 'cancelled'
  | 'cash_collected';

export interface User {
  id: string;
  role: Role;
  phoneNumber?: string;
  email?: string;
  googleId?: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublicSettings {
  appName: string;
  currency: string;
  serviceFee: number;
  perKmFee: number;
  minGasAmount: number;
  gasAmountStep: number;
  pickupGraceMinutes: number;
  contact: {
    supportEmail: string;
    supportEmailNote: string;
    phones: { number: string; isWhatsApp: boolean }[];
    addresses: string[];
  };
}

export interface Area {
  id: string;
  name: string;
  center: GeoPoint;
  radiusKm: number;
}

export interface Cylinder {
  size: CylinderSize;
  name: string;
  fullPrice: number;
  capacityKg?: number;
  imageUrl?: string;
}

export interface Station {
  id: string;
  name: string;
  location: GeoPoint;
  areaId?: string;
  isActive: boolean;
}

export interface Pricing {
  gasAmount: number;
  gasTotal: number;
  distanceFee: number;
  serviceFee: number;
  tip: number;
  total: number;
  currency: string;
}

export interface Quote {
  cylinderSize: CylinderSize;
  cylinderCount: number;
  isFullFill: boolean;
  area: { id: string; name: string };
  station: { id: string; name: string };
  distanceKm: number;
  pricing: Pricing;
}

export interface RiderPublic {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  photoUrl?: string;
  vehicleType?: string;
  plateNumber?: string;
  rating: number | null;
}

export interface Order {
  id: string;
  customerId: string | { id: string; firstName: string; lastName: string; phoneNumber?: string };
  riderId?: string | RiderPublic;
  areaId?: string;
  cylinderSize: CylinderSize;
  cylinderCount: number;
  isFullFill: boolean;
  deliveryAddress: { label: string; lat: number; lng: number };
  riderInstructions: string;
  pickupTime: string;
  stationId: string;
  distanceKm: number;
  pricing: Pricing;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  deliveredAt?: string;
  rating?: { score: number; comment: string; at: string };
  statusHistory: { status: OrderStatus; at: string; by?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference?: string;
  authorizationUrl?: string;
  paidAt?: string;
  refundedAt?: string;
}

// Where this order sits in its rider's queue. Riders can hold several orders and work them
// oldest first, so an order can be rider_assigned while the rider finishes an earlier one.
// PROPOSED: the API does not send this yet (see docs/API_GAPS.md in the web app).
export interface RiderQueue {
  // Orders the rider must finish before starting this one. 0 = this order is up now.
  ordersAhead: number;
  // Rough time until the rider starts this order, when the server can estimate it.
  startsInSeconds?: number | null;
  // Rough drop-off point of the order the rider is on now (rounded, no customer details),
  // so the map can draw that leg in grey.
  currentStop?: { lat: number; lng: number } | null;
}

export interface RiderLocation {
  lat: number;
  lng: number;
  // GPS course over ground from the rider's phone, in degrees (0 = north). Optional: when absent
  // the tracker works the direction out from the road and the last positions.
  heading?: number | null;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  orderId?: string;
  readAt?: string;
  createdAt: string;
}

export interface Page {
  page: number;
  hasMore: boolean;
}

export interface Route {
  distanceKm: number;
  durationSeconds: number;
  // GeoJSON LineString: points are [lng, lat].
  geometry: { type: 'LineString'; coordinates: [number, number][] };
}
