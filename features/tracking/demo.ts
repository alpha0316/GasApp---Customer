import type { QueryClient } from '@tanstack/react-query';
import { orderKey, type OrderDetail } from '@/features/orders/hooks';
import type { OrderStatus, Station } from '@/lib/api/types';
import { fromGeoPoint, type LatLng } from '@/lib/geo';

// Demo tools let the team walk through tracker states and trip alerts without a live
// order. On in dev builds; set EXPO_PUBLIC_DEMO_MODE=1 for others.
export const DEMO_MODE = __DEV__ || process.env.EXPO_PUBLIC_DEMO_MODE === '1';

// This order id is the built-in demo order. It lives only in the query cache and is never sent to the API.
export const DEMO_ORDER_ID = 'demo';

export type DemoQueue = 0 | 1 | 2;

// Off -> 1 ahead -> 2 ahead -> Off.
export const nextDemoQueue = (q: DemoQueue): DemoQueue => ((q + 1) % 3) as DemoQueue;

// Around Lapaz, Accra, used when the station list has not loaded.
const FALLBACK_STATION = { latitude: 5.6075, longitude: -0.2445 };

function demoPoints(station: Station | undefined) {
  const s = station ? fromGeoPoint(station.location) : FALLBACK_STATION;
  return {
    station: s,
    // ~1.6 km from the station.
    customer: { latitude: s.latitude + 0.011, longitude: s.longitude + 0.009 },
    // Out on an earlier delivery, ~2.6 km from the customer.
    riderStart: { latitude: s.latitude - 0.006, longitude: s.longitude - 0.007 },
  };
}

// A rider_assigned order delivered near a real station, queued behind one other delivery.
export function demoOrderDetail(station: Station | undefined): OrderDetail {
  const { customer, riderStart } = demoPoints(station);
  const now = new Date().toISOString();
  return {
    order: {
      id: DEMO_ORDER_ID,
      customerId: 'demo-customer',
      riderId: {
        id: 'demo-rider',
        firstName: 'Kwame',
        lastName: 'Mensah',
        phoneNumber: '+233240000000',
        vehicleType: 'motorbike',
        plateNumber: 'M-24-GR 1234',
        rating: 4.9,
      },
      cylinderSize: 'medium',
      cylinderCount: 1,
      isFullFill: true,
      deliveryAddress: { label: 'Demo address', lat: customer.latitude, lng: customer.longitude },
      riderInstructions: '',
      pickupTime: now,
      stationId: station?.id ?? 'demo-station',
      distanceKm: 1.6,
      pricing: { gasAmount: 0, gasTotal: 0, distanceFee: 0, serviceFee: 0, tip: 0, total: 0, currency: 'GHS' },
      paymentMethod: 'cash',
      status: 'rider_assigned',
      statusHistory: [{ status: 'rider_assigned', at: now }],
      createdAt: now,
      updatedAt: now,
    },
    payment: { id: 'demo-payment', orderId: DEMO_ORDER_ID, method: 'cash', amount: 0, currency: 'GHS', status: 'pending' },
    riderLocation: { lat: riderStart.latitude, lng: riderStart.longitude, updatedAt: now },
    riderQueue: { ordersAhead: 1, startsInSeconds: 240, currentStop: demoStop(riderStart) },
  };
}

// Where the demo rider's current (other) delivery ends, ~0.8 km away.
const demoStop = (rider: LatLng) => ({ lat: rider.latitude - 0.005, lng: rider.longitude + 0.006 });

const update = (client: QueryClient, fn: (d: OrderDetail) => OrderDetail) =>
  client.setQueryData<OrderDetail>(orderKey(DEMO_ORDER_ID), (old) => (old ? fn(old) : old));

export function setDemoQueue(client: QueryClient, ahead: DemoQueue) {
  update(client, (d) => {
    const rider = d.riderLocation ? { latitude: d.riderLocation.lat, longitude: d.riderLocation.lng } : null;
    return {
      ...d,
      riderQueue: ahead
        ? { ordersAhead: ahead, startsInSeconds: ahead * 240, currentStop: rider ? demoStop(rider) : null }
        : null,
    };
  });
}

const lerp = (a: LatLng, b: LatLng, t: number): LatLng => ({
  latitude: a.latitude + (b.latitude - a.latitude) * t,
  longitude: a.longitude + (b.longitude - a.longitude) * t,
});

type Frame = { status: OrderStatus; at: LatLng };

// Every stage the customer is alerted about, in order: to the customer, almost there,
// cylinder picked up, a traffic stop, near the station, filling (with a queue), leaving the
// station, almost at the door, delivered.
function tripFrames(station: Station | undefined): Frame[] {
  const p = demoPoints(station);
  const leg = (status: OrderStatus, from: LatLng, to: LatLng, steps: number): Frame[] =>
    Array.from({ length: steps }, (_, i) => ({ status, at: lerp(from, to, (i + 1) / steps) }));
  return [
    { status: 'rider_assigned', at: p.riderStart },
    ...leg('rider_assigned', p.riderStart, p.customer, 5),
    { status: 'picked_up', at: p.customer },
    ...leg('picked_up', p.customer, p.station, 5).slice(0, 2),
    // Stuck in traffic for ~10 s: the "slow traffic" alert.
    ...Array.from({ length: 3 }, () => ({ status: 'picked_up' as const, at: lerp(p.customer, p.station, 0.4) })),
    ...leg('picked_up', p.customer, p.station, 5).slice(2),
    // ~14 s at the pump: the "short wait at the station" alert.
    ...Array.from({ length: 4 }, () => ({ status: 'filling' as const, at: p.station })),
    { status: 'en_route_to_customer', at: p.station },
    ...leg('en_route_to_customer', p.station, p.customer, 5),
    { status: 'delivered', at: p.customer },
  ];
}

const TICK_MS = 3500;
let stopCurrent: (() => void) | null = null;

export const isDemoTripRunning = () => stopCurrent !== null;
export const stopDemoTrip = () => stopCurrent?.();

// Plays the whole trip on the demo order, one step every few seconds. It keeps running
// if the customer leaves the tracker, so the alerts can be seen on other screens too.
export function startDemoTrip(client: QueryClient, onEnd?: () => void): () => void {
  stopCurrent?.();
  const station = client.getQueryData<Station[]>(['stations'])?.[0];
  client.setQueryData(orderKey(DEMO_ORDER_ID), { ...demoOrderDetail(station), riderQueue: null });
  const frames = tripFrames(station);
  let i = 0;

  const timer = setInterval(() => {
    const frame = frames[i++];
    if (!frame) return stop();
    const at = new Date().toISOString();
    update(client, (d) => ({
      ...d,
      riderQueue: null,
      riderLocation: frame.status === 'delivered' ? null : { lat: frame.at.latitude, lng: frame.at.longitude, updatedAt: at },
      order: {
        ...d.order,
        status: frame.status,
        statusHistory:
          d.order.status === frame.status ? d.order.statusHistory : [...d.order.statusHistory, { status: frame.status, at }],
        updatedAt: at,
      },
    }));
    if (i >= frames.length) stop();
  }, TICK_MS);

  function stop() {
    clearInterval(timer);
    if (stopCurrent === stop) stopCurrent = null;
    onEnd?.();
  }
  stopCurrent = stop;
  return stop;
}

export function resetDemoOrder(client: QueryClient) {
  stopCurrent?.();
  const station = client.getQueryData<Station[]>(['stations'])?.[0];
  client.setQueryData(orderKey(DEMO_ORDER_ID), demoOrderDetail(station));
}
