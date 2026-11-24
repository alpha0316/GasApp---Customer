import { formatEta, formatEtaRange, trafficLabel, type Eta, type TrafficLevel } from './eta';
import type { TripEvent, TripPhase } from './phase';
import { CONDITION_TEXT, type TripCondition } from './conditions';
import { PICKUP_DONE_TITLE, TRIP_STEPS } from './steps';

export type AlertTone = 'info' | 'success' | 'warning' | 'error';
export type AlertIcon = 'rider' | 'queue' | 'cylinder' | 'station' | 'pump' | 'home' | 'check' | 'alert';

export interface TripAlertContent {
  title: string;
  body: string;
  tone: AlertTone;
  icon: AlertIcon;
  // Shown as a centred card that waits for "Got it" instead of a banner that slides away.
  prominent: boolean;
  // "~7 min", shown as a pill on the alert.
  etaText: string | null;
  // "6–9 min · Heavy traffic", kept with the saved notification.
  etaDetail: string | null;
  // Upper end of the likely range, for "Less than 5 min away" on the arrival sheet.
  etaMaxMinutes: number | null;
  traffic: TrafficLevel | null;
  // The toast's clock line, e.g. "Back To" (soft) "You in 15 min" (strong) · "Slight Queue".
  etaSoft: string | null;
  etaStrong: string | null;
  condition: string | null;
}

export interface AlertContext {
  riderName: string | null;
  stationName: string | null;
  eta: Eta | null;
  // Orders ahead of this one in the rider's queue, for the queued alert.
  ordersAhead?: number;
  // A delay actually seen on this trip (long stop at the pump, standing still in traffic).
  condition?: TripCondition | null;
  // The phase a delay alert happened in, for its clock line.
  phase?: TripPhase;
}


// "at the Shell Lapaz filling station", without doubling "station" when the name has it.
const atStation = (name: string | null) =>
  !name ? 'at the filling station' : /station/i.test(name) ? `at ${name}` : `at the ${name} filling station`;

export function tripAlertContent(event: TripEvent, ctx: AlertContext): TripAlertContent {
  const rider = ctx.riderName ?? 'Your rider';
  const station = ctx.stationName ?? 'the filling station';
  const { eta } = ctx;
  const base = {
    etaText: eta ? formatEta(eta) : null,
    etaDetail: eta ? `${formatEtaRange(eta)} · ${trafficLabel(eta.traffic)}` : null,
    etaMaxMinutes: eta ? eta.high : null,
    traffic: eta ? eta.traffic : null,
    prominent: false,
    etaSoft: null as string | null,
    etaStrong: null as string | null,
    // Tags only for delays actually seen, never guessed from the clock.
    condition: ctx.condition ? CONDITION_TEXT[ctx.condition] : null,
  };
  const mins = eta ? `${eta.minutes} min` : null;
  // Clock line: "<soft> <strong>", only when there is an ETA.
  const clock = (soft: string, strong: string) => (mins ? { etaSoft: soft, etaStrong: strong } : {});

  switch (event) {
    case 'queued':
      return {
        ...base,
        title: `${rider} accepted your order`,
        body: "They're finishing a delivery nearby first.",
        ...clock('Starts', `in ${mins}`),
        condition: ctx.ordersAhead ? `${ctx.ordersAhead} Order${ctx.ordersAhead > 1 ? 's' : ''} Ahead` : base.condition,
        tone: 'info',
        icon: 'queue',
      };
    case 'to_customer_pickup':
      return {
        ...base,
        title: TRIP_STEPS[0].title,
        body: 'Coming to collect your empty cylinder.',
        ...clock('Arriving To', `You in ${mins}`),
        tone: 'info',
        icon: 'rider',
      };
    case 'arriving_pickup':
      return {
        ...base,
        prominent: true,
        title: 'Rider Almost At Your Location',
        body: 'Please have your empty cylinder ready for pick up',
        ...clock('Arriving To', `You in ${mins}`),
        tone: 'warning',
        icon: 'cylinder',
      };
    case 'to_station':
      return {
        ...base,
        title: PICKUP_DONE_TITLE,
        body: `${rider} is heading to ${station}`,
        ...clock('Gets there', `in ${mins}`),
        tone: 'info',
        icon: 'station',
      };
    case 'approaching_station':
      return {
        ...base,
        title: 'Almost at the filling station',
        body: `${rider} is close to ${station}. Filling starts shortly.`,
        ...clock('Gets there', `in ${mins}`),
        tone: 'info',
        icon: 'station',
      };
    case 'filling':
      return {
        ...base,
        title: TRIP_STEPS[1].title,
        body: `Your gas is being filled ${atStation(ctx.stationName)}`,
        ...clock('Back To', `You in ${mins}`),
        tone: 'info',
        icon: 'pump',
      };
    case 'to_customer_dropoff':
      return {
        ...base,
        title: TRIP_STEPS[2].title,
        body: `${rider} left ${station} with your full cylinder.`,
        ...clock('Arriving To', `You in ${mins}`),
        tone: 'info',
        icon: 'rider',
      };
    case 'arriving_dropoff':
      return {
        ...base,
        prominent: true,
        title: 'Rider Almost At Your Location',
        body: 'Please be ready to receive your full cylinder',
        ...clock('Arriving To', `You in ${mins}`),
        tone: 'warning',
        icon: 'home',
      };
    case 'delivered':
      return {
        ...base,
        etaText: null,
        etaDetail: null,
        condition: null,
        title: 'Gas delivered',
        body: `Enjoy! Tap to rate ${ctx.riderName ?? 'your rider'}.`,
        tone: 'success',
        icon: 'check',
      };
    case 'cancelled':
      return {
        ...base,
        etaText: null,
        etaDetail: null,
        condition: null,
        title: 'Order cancelled',
        body: 'This order was cancelled. Any payment will be refunded.',
        tone: 'error',
        icon: 'alert',
      };
    case 'station_queue':
      return {
        ...base,
        title: 'Short wait at the station',
        body: `There's a queue at the pump. ${rider} will fill your cylinder shortly.`,
        ...clock('Back To', `You in ${mins}`),
        condition: CONDITION_TEXT.queue,
        tone: 'warning',
        icon: 'pump',
      };
    case 'traffic_delay':
      return {
        ...base,
        title: `${rider} is in slow traffic`,
        body: 'Your delivery may take a little longer than expected.',
        ...(ctx.phase === 'to_station' ? clock('Gets there', `in ${mins}`) : clock('Arriving To', `You in ${mins}`)),
        condition: CONDITION_TEXT.traffic,
        tone: 'warning',
        icon: 'alert',
      };
    case 'reassigning':
      return {
        ...base,
        etaText: null,
        etaDetail: null,
        condition: null,
        title: 'Finding you another rider',
        body: "Your rider couldn't continue. No action needed, we're matching you again.",
        tone: 'warning',
        icon: 'alert',
      };
  }
}
