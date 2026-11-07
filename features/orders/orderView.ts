import type { CylinderSize, Order, OrderStatus, PaymentMethod, Station } from '@/lib/api/types';

export interface OrderRider {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

// What the order screens render. Built from the API order so screens hold no mapping logic.
export interface OrderItem {
  id: string;
  size: CylinderSize;
  count: number;
  status: OrderStatus;
  stationName: string;
  address: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  rider: OrderRider | null;
  createdAt: string;
  deliveredAt?: string;
  total: number;
  currency: string;
  rating: number | null;
}

// A pickup within a few minutes of placing the order was "Now".
const NOW_WINDOW_MS = 10 * 60_000;

function pickupLabel(order: Order): string {
  const pickup = Date.parse(order.pickupTime);
  const created = Date.parse(order.createdAt);
  if (Number.isNaN(pickup) || pickup - created < NOW_WINDOW_MS) return 'Now';
  return new Date(pickup).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function toOrderItem(order: Order, stations: Station[]): OrderItem {
  // The list endpoint may send the rider as an id only; the detail endpoint sends the object.
  const rider = typeof order.riderId === 'object' && order.riderId ? order.riderId : null;
  return {
    id: order.id,
    size: order.cylinderSize,
    count: order.cylinderCount,
    status: order.status,
    stationName: stations.find((s) => s.id === order.stationId)?.name ?? 'Filling Station',
    address: order.deliveryAddress.label,
    pickupTime: pickupLabel(order),
    paymentMethod: order.paymentMethod,
    rider: rider
      ? { firstName: rider.firstName, lastName: rider.lastName, phoneNumber: rider.phoneNumber ?? '' }
      : null,
    createdAt: order.createdAt,
    deliveredAt: order.deliveredAt,
    total: order.pricing.total,
    currency: order.pricing.currency,
    rating: order.rating?.score ?? null,
  };
}
