import type { OrderStatus } from '@/lib/api/types';

// Where the trip is right now, from the customer's point of view. The rider first comes
// to the customer for the empty cylinder, fills it at the station, then brings it back.
export type TripPhase =
  | 'searching'
  | 'queued' // accepted, but finishing an earlier order first
  | 'to_customer_pickup' // heading to collect the empty cylinder
  | 'arriving_pickup'
  | 'to_station' // cylinder collected, heading to the filling station
  | 'approaching_station'
  | 'filling'
  | 'to_customer_dropoff' // left the station with the full cylinder
  | 'arriving_dropoff'
  | 'delivered'
  | 'cancelled';

// Pop-up events: each phase except searching, a rider dropping out, and delays seen on the
// way (a queue at the station, the rider stuck in traffic).
export type TripEvent = Exclude<TripPhase, 'searching'> | 'reassigning' | 'station_queue' | 'traffic_delay';

// Within this distance the rider counts as "almost there".
export const ARRIVING_KM = 0.6;
export const APPROACHING_STATION_KM = 0.5;

export interface TripSnapshot {
  status: OrderStatus;
  queued: boolean;
  riderKmToCustomer: number | null;
  riderKmToStation: number | null;
}

const near = (km: number | null, limit: number) => km !== null && km <= limit;

export function tripPhase(s: TripSnapshot): TripPhase {
  switch (s.status) {
    case 'pending_payment':
    case 'awaiting_rider':
      return 'searching';
    case 'rider_assigned':
      if (s.queued) return 'queued';
      return near(s.riderKmToCustomer, ARRIVING_KM) ? 'arriving_pickup' : 'to_customer_pickup';
    case 'picked_up':
      return near(s.riderKmToStation, APPROACHING_STATION_KM) ? 'approaching_station' : 'to_station';
    case 'filling':
      return 'filling';
    case 'en_route_to_customer':
      return near(s.riderKmToCustomer, ARRIVING_KM) ? 'arriving_dropoff' : 'to_customer_dropoff';
    case 'delivered':
      return 'delivered';
    case 'cancelled':
    case 'refunded':
      return 'cancelled';
  }
}

const RIDER_PHASES: TripPhase[] = [
  'queued',
  'to_customer_pickup',
  'arriving_pickup',
  'to_station',
  'approaching_station',
  'filling',
  'to_customer_dropoff',
  'arriving_dropoff',
];
export const hasRiderPhase = (p: TripPhase) => RIDER_PHASES.includes(p);

// Decides whether moving from `prev` to `next` deserves a pop-up. `fired` holds the
// events already shown for this order, so GPS jitter across a distance threshold
// (arriving -> not arriving -> arriving) never repeats one. `prev === null` means the
// order was just seen (e.g. the app opened mid-trip): nothing pops for the current state.
export function tripEventFor(prev: TripPhase | null, next: TripPhase, fired: ReadonlySet<TripEvent>): TripEvent | null {
  if (prev === null || prev === next) return null;
  if (next === 'searching') return hasRiderPhase(prev) ? 'reassigning' : null;
  if (fired.has(next)) return null;
  return next;
}
