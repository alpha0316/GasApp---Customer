import { useEffect, useRef, useState } from 'react';
import { skipToken, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { listOrders, getOrder } from '@/features/orders/api';
import { ORDERS_KEY, orderKey, type OrderDetail } from '@/features/orders/hooks';
import { isActive } from '@/features/orders/status';
import { useStations } from '@/features/catalog/hooks';
import { DEMO_ORDER_ID } from '@/features/tracking/demo';
import { fromGeoPoint, haversineKm, type LatLng } from '@/lib/geo';
import { makeEta, smoothSeconds } from './eta';
import { estimateEta } from './estimate';
import { tripAlertContent } from './messages';
import { tripEventFor, tripPhase, type TripEvent, type TripPhase } from './phase';
import { useTripStore } from './store';
import {
  DEMO_THRESHOLDS,
  REAL_THRESHOLDS,
  isStationPhase,
  pushTrail,
  tripCondition,
  type TrailPoint,
} from './conditions';
import { postTripNotification } from './systemNotifications';
import { notificationSettings } from '@/features/notifications/settings';

// The server already sends an inbox entry and a push for every status change. The app
// adds only what the server cannot know: the queue and the distance-based "almost there"
// moments. The demo order has no server, so it gets everything.
const SERVER_NOTIFIES: ReadonlySet<TripEvent> = new Set([
  'to_customer_pickup',
  'to_station',
  'filling',
  'to_customer_dropoff',
  'delivered',
  'cancelled',
]);

// How often the live ETA is recomputed while the phase stays the same.
const ETA_REFRESH_MS = 30_000;

// Watches every active order (plus the demo order) and turns trip progress into
// pop-up alerts and a live ETA. Mounted once for the signed-in app.
export function useTripWatcher(): void {
  const client = useQueryClient();
  const stations = useStations().data;

  // Under ORDERS_KEY, so every socket order event refreshes it too.
  const list = useQuery({
    queryKey: [...ORDERS_KEY, 'trip-watch'],
    queryFn: () => listOrders(1),
    refetchInterval: 60_000,
  });

  // An order stays watched after it leaves the active list until its final state was seen,
  // otherwise "Delivered" could be missed when the list refreshes first.
  const [watched, setWatched] = useState<string[]>([]);
  useEffect(() => {
    const active = list.data?.orders.filter((o) => isActive(o.status)).map((o) => o.id) ?? [];
    setWatched((prev) => {
      const next = [...new Set([...prev, ...active])];
      return next.length === prev.length ? prev : next;
    });
  }, [list.data]);

  const details = useQueries({
    queries: watched.map((id) => ({
      queryKey: orderKey(id),
      queryFn: () => getOrder(id),
      refetchInterval: 30_000,
    })),
  });
  // The demo order lives only in the cache (see features/tracking/demo.ts); never fetched.
  const demo = useQuery<OrderDetail>({ queryKey: orderKey(DEMO_ORDER_ID), queryFn: skipToken });

  const phases = useRef(new Map<string, TripPhase>());
  const fired = useRef(new Map<string, Set<TripEvent>>());
  const busy = useRef(new Set<string>());
  // Recent rider positions (stall check), when the rider reached the station (queue check),
  // and which delay alerts have gone out, per order.
  const trails = useRef(new Map<string, TrailPoint[]>());
  const stationSince = useRef(new Map<string, number>());
  const delaysFired = useRef(new Map<string, Set<string>>());

  // Delays build up while nothing changes (a rider parked at the pump), so re-check on a timer too.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const all: OrderDetail[] = [...details.map((q) => q.data), demo.data].filter((d): d is OrderDetail => !!d);
  // Re-run only when something that matters for the trip changed, not on every render.
  const signature = all
    // updatedAt included: a ping from a rider who has not moved is exactly what the stall check needs.
    .map(
      (d) =>
        `${d.order.id}:${d.order.status}:${d.riderLocation?.lat},${d.riderLocation?.lng},${d.riderLocation?.updatedAt}:${d.riderQueue?.ordersAhead ?? 0}`,
    )
    .join('|');

  useEffect(() => {
    const store = useTripStore.getState();

    for (const detail of all) {
      const { order, riderLocation, riderQueue } = detail;
      const id = order.id;
      const isDemo = id === DEMO_ORDER_ID;
      const station = stations?.find((s) => s.id === order.stationId) ?? (isDemo ? stations?.[0] : undefined);
      const stationPoint: LatLng | null = station ? fromGeoPoint(station.location) : null;
      const customer: LatLng = { latitude: order.deliveryAddress.lat, longitude: order.deliveryAddress.lng };
      const rider: LatLng | null = riderLocation ? { latitude: riderLocation.lat, longitude: riderLocation.lng } : null;

      const phase = tripPhase({
        status: order.status,
        queued: order.status === 'rider_assigned' && (riderQueue?.ordersAhead ?? 0) > 0,
        riderKmToCustomer: rider ? haversineKm(rider, customer) : null,
        riderKmToStation: rider && stationPoint ? haversineKm(rider, stationPoint) : null,
      });

      const prev = phases.current.get(id) ?? null;
      const firedForOrder = fired.current.get(id) ?? new Set<TripEvent>();
      fired.current.set(id, firedForOrder);
      // A finished order coming back to life (the demo restarting) starts a fresh set of alerts.
      if ((prev === 'delivered' || prev === 'cancelled') && phase !== prev) firedForOrder.clear();
      const phaseEvent = tripEventFor(prev, phase, firedForOrder);
      phases.current.set(id, phase);
      if (phaseEvent === 'reassigning') firedForOrder.clear(); // the next rider's trip alerts start fresh
      else if (phaseEvent) firedForOrder.add(phaseEvent);

      // Delays seen on the way: a long stop at the pump, or standing still mid-trip.
      const now = Date.now();
      const thresholds = isDemo ? DEMO_THRESHOLDS : REAL_THRESHOLDS;
      const delays = delaysFired.current.get(id) ?? new Set<string>();
      delaysFired.current.set(id, delays);
      if (phaseEvent === 'reassigning' || ((prev === 'delivered' || prev === 'cancelled') && phase !== prev)) delays.clear();
      // A new leg starts a new trail, so a stop on the last leg does not count against this one.
      let trail = phase === prev ? (trails.current.get(id) ?? []) : [];
      // Only fresh pings: a rider whose app went quiet is not "standing still".
      if (riderLocation && now - Date.parse(riderLocation.updatedAt) < 60_000) {
        trail = pushTrail(trail, { lat: riderLocation.lat, lng: riderLocation.lng, t: now }, thresholds.stallMs * 2);
      }
      trails.current.set(id, trail);
      if (isStationPhase(phase)) {
        if (!stationSince.current.has(id)) {
          const fillingAt = order.statusHistory.find((h) => h.status === 'filling')?.at;
          stationSince.current.set(id, Math.min(now, fillingAt ? Date.parse(fillingAt) : now));
        }
      } else {
        stationSince.current.delete(id);
      }
      const condition = tripCondition(phase, {
        stationSince: stationSince.current.get(id) ?? null,
        trail,
        now,
        thresholds,
      });
      // One queue alert per order, one traffic alert per leg; never on top of a phase alert.
      let delayEvent: TripEvent | null = null;
      if (!phaseEvent && condition) {
        const key = condition === 'queue' ? 'station_queue' : `traffic_delay:${phase}`;
        if (!delays.has(key)) {
          delays.add(key);
          delayEvent = condition === 'queue' ? 'station_queue' : 'traffic_delay';
        }
      }
      const event = phaseEvent ?? delayEvent;

      const terminal = phase === 'delivered' || phase === 'cancelled';
      const live = store.etas[id];
      const phaseChanged = live?.phase !== phase;
      const conditionChanged = (live?.condition ?? null) !== condition;
      const due = phaseChanged || conditionChanged || !live || Date.now() - live.at > (isDemo ? 0 : ETA_REFRESH_MS);
      // Alerts always go out; plain ETA refreshes skip while one is still computing.
      if (!event && (!due || busy.current.has(id))) continue;

      busy.current.add(id);
      void (async () => {
        try {
          const eta = terminal ? null : await estimateEta(client, { phase, detail, station: stationPoint, demo: isDemo });
          const current = useTripStore.getState();

          if (eta || phaseChanged || conditionChanged) {
            const smoothed = eta ? smoothSeconds(phaseChanged ? null : (current.etas[id]?.smoothed ?? null), eta.seconds) : null;
            current.setEta(id, {
              phase,
              eta: smoothed !== null ? makeEta(smoothed, new Date()) : null,
              smoothed,
              at: Date.now(),
              condition,
            });
          }

          if (event) {
            const riderObj = typeof order.riderId === 'object' ? order.riderId : null;
            const content = tripAlertContent(event, {
              riderName: riderObj?.firstName ?? null,
              stationName: station?.name ?? null,
              eta,
              ordersAhead: riderQueue?.ordersAhead,
              condition,
              phase,
            });
            // The Notifications list always gets the alert; the settings only decide what interrupts.
            const prefs = notificationSettings();
            if (content.prominent ? prefs.arrivalCards : prefs.tripToasts) {
              current.push({ orderId: id, event, riderPhone: riderObj?.phoneNumber ?? null, ...content });
            }

            if (isDemo || !SERVER_NOTIFIES.has(event)) {
              // The pop-up drops the ETA into a pill; the saved copy spells it out.
              const body = content.etaDetail && !content.body.includes('~') ? `${content.body} ETA ${content.etaDetail}.` : content.body;
              current.addToInbox({ orderId: id, event, title: content.title, body });
              if (prefs.phoneAlerts) postTripNotification(id, content.title, body, prefs.sound).catch((e: unknown) => console.warn('Trip notification failed', e));
            }
          }
        } finally {
          busy.current.delete(id);
        }
      })();

      if (terminal && !isDemo) {
        setWatched((w) => w.filter((x) => x !== id));
        useTripStore.getState().clearOrder(id);
      }
    }
    // `all` is captured fresh each render; `signature` decides when to re-run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature, stations, client, tick]);
}
