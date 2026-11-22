import type { QueryClient } from '@tanstack/react-query';
import { getRoute, type RouteEndpoints } from '@/features/tracking/api';
import type { OrderDetail } from '@/features/orders/hooks';
import type { LatLng } from '@/lib/geo';
import { driveSeconds, estimateFreeFlowSeconds, makeEta, remainingFillSeconds, type Eta } from './eta';
import type { TripPhase } from './phase';

// ~11 m: the routing cache is reused while the rider stays on the same spot.
const round = (n: number) => Math.round(n * 1e4) / 1e4;

// Free-flow road time between two points: the routing service when it answers,
// else a straight-line estimate.
async function freeFlowSeconds(client: QueryClient, from: LatLng, to: LatLng, demo: boolean): Promise<number> {
  if (demo) return estimateFreeFlowSeconds(from, to);
  const endpoints: RouteEndpoints = {
    fromLat: round(from.latitude),
    fromLng: round(from.longitude),
    toLat: round(to.latitude),
    toLng: round(to.longitude),
  };
  try {
    // Same key as useRoute, so the tracker and the alerts share one request.
    const route = await client.fetchQuery({
      queryKey: ['route', endpoints],
      queryFn: () => getRoute(endpoints),
      staleTime: 60_000,
      retry: false,
    });
    return route.durationSeconds;
  } catch {
    return estimateFreeFlowSeconds(from, to);
  }
}

export interface EtaInput {
  phase: TripPhase;
  detail: OrderDetail;
  station: LatLng | null;
  demo?: boolean;
  now?: Date;
}

// The time until the next thing the customer waits for in this phase:
// the rider at their door, at the station, or back with the full cylinder.
export async function estimateEta(client: QueryClient, { phase, detail, station, demo = false, now = new Date() }: EtaInput): Promise<Eta | null> {
  const { order, riderLocation, riderQueue } = detail;
  const customer: LatLng = { latitude: order.deliveryAddress.lat, longitude: order.deliveryAddress.lng };
  const rider: LatLng | null = riderLocation ? { latitude: riderLocation.lat, longitude: riderLocation.lng } : null;
  const vehicle = typeof order.riderId === 'object' ? order.riderId?.vehicleType : undefined;
  const drive = async (from: LatLng, to: LatLng) => driveSeconds(await freeFlowSeconds(client, from, to, demo), now, vehicle);

  switch (phase) {
    case 'queued': {
      const secs = riderQueue?.startsInSeconds;
      return typeof secs === 'number' && secs > 0 ? makeEta(secs, now) : null;
    }
    case 'to_customer_pickup':
    case 'arriving_pickup':
      return rider ? makeEta(await drive(rider, customer), now) : null;
    case 'to_station':
    case 'approaching_station':
      return rider && station ? makeEta(await drive(rider, station), now) : null;
    case 'filling': {
      if (!station) return null;
      const startedAt = order.statusHistory.find((h) => h.status === 'filling')?.at;
      const fill = remainingFillSeconds(order.cylinderCount, startedAt ? new Date(startedAt) : null, now);
      return makeEta(fill + (await drive(station, customer)), now);
    }
    case 'to_customer_dropoff':
    case 'arriving_dropoff': {
      const from = rider ?? station;
      return from ? makeEta(await drive(from, customer), now) : null;
    }
    default:
      return null;
  }
}
