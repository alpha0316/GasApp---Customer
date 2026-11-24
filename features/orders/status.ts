import type { OrderStatus, RiderQueue } from '@/lib/api/types';
import { TRIP_STEPS } from '@/features/trip/steps';

export type StepState = 'completed' | 'active' | 'pending';

export const INCOMING_STATUSES: OrderStatus[] = [
  'pending_payment',
  'awaiting_rider',
  'rider_assigned',
  'picked_up',
  'filling',
  'en_route_to_customer',
];
export const CANCELLED_STATUSES: OrderStatus[] = ['cancelled', 'refunded'];

export const isActive = (status: OrderStatus) => INCOMING_STATUSES.includes(status);

// Customers can cancel only before a rider accepts.
export const canCancel = (status: OrderStatus) => status === 'pending_payment' || status === 'awaiting_rider';

export const hasRider = (status: OrderStatus) =>
  status === 'rider_assigned' || status === 'picked_up' || status === 'filling' || status === 'en_route_to_customer' || status === 'delivered';

type TripStepStates = [StepState, StepState, StepState];

// The tracker's three steps (features/trip/steps.ts): pickup (rider heading to the customer,
// then "Cylinder picked up" on the way to the station), filling, on the way back.
export function stepStates(status: OrderStatus): TripStepStates {
  const active = (i: number): TripStepStates =>
    [0, 1, 2].map((n) => (n < i ? 'completed' : n === i ? 'active' : 'pending')) as TripStepStates;
  switch (status) {
    case 'rider_assigned':
    case 'picked_up':
      return active(0);
    case 'filling':
      return active(1);
    case 'en_route_to_customer':
      return active(2);
    case 'delivered':
      return active(3);
    default:
      return ['pending', 'pending', 'pending'];
  }
}

// The rider has collected the empty cylinder (picked_up and every later status).
export const hasPickedUp = (status: OrderStatus | undefined): boolean =>
  status === 'picked_up' || status === 'filling' || status === 'en_route_to_customer' || status === 'delivered';

// The first step reads "Rider heading to your location" until the rider has the cylinder.
export const pickupStepTitle = (status: OrderStatus | undefined): string =>
  hasPickedUp(status) ? TRIP_STEPS[0].doneTitle : TRIP_STEPS[0].title;

export const SIZE_NAME = { small: 'Small Size', medium: 'Medium Size', large: 'Large Size' } as const;

export interface CustomerStatusLabel {
  label: string;
  detail: string;
}

// Mirrors the label table in the Payment Flow & Order Assignment Logic doc (section 2.3).
// awaiting_rider/pending_payment cover both "searching" and "queued behind a busy rider" —
// the API does not yet say which, so both render as the generic search label.
export function customerStatusLabel(status: OrderStatus): CustomerStatusLabel {
  switch (status) {
    case 'pending_payment':
    case 'awaiting_rider':
      return { label: 'Finding rider', detail: 'Usually under 2 minutes.' };
    case 'rider_assigned':
      return { label: 'Rider assigned', detail: 'Live map tracking has started.' };
    case 'picked_up':
    case 'filling':
      return { label: 'Picking up your gas', detail: 'Your rider is at the filling station.' };
    case 'en_route_to_customer':
      return { label: 'On the way', detail: 'Your rider is heading to you.' };
    case 'delivered':
      return { label: 'Delivered', detail: 'Your receipt is ready.' };
    case 'cancelled':
      return { label: 'Cancelled', detail: 'This order was cancelled.' };
    case 'refunded':
      return { label: 'Refunded', detail: 'A refund has been issued.' };
  }
}

// A rider was assigned (the customer reached the Tracker screen) and then the order
// fell back to a searching status — the "assigned rider cancelled" case (doc scenario D).
export const isReassigning = (status: OrderStatus) =>
  status === 'awaiting_rider' || status === 'pending_payment';

export interface QueuedState {
  ordersAhead: number;
  label: string;
  detail: string;
  // One-line notice for the dismissible banner above the tracking card.
  banner: string;
  // "Starts in ~4 min", or null when the server gave no estimate.
  startsIn: string | null;
}

// The rider accepted this order but is still finishing earlier ones in their queue.
// Only rider_assigned qualifies: from picked_up on, the rider is working on this order.
export function queuedState(status: OrderStatus, queue: RiderQueue | null | undefined): QueuedState | null {
  if (status !== 'rider_assigned' || !queue || queue.ordersAhead < 1) return null;
  const ahead = queue.ordersAhead;
  const secs = queue.startsInSeconds;
  const startsIn = typeof secs === 'number' && secs > 0 ? `Starts in ~${Math.max(1, Math.round(secs / 60))} min` : null;
  return {
    ordersAhead: ahead,
    label: 'Finishing another order',
    detail:
      ahead === 1
        ? "You're next. Your rider heads to the filling station right after."
        : `${ahead} orders ahead of yours. Your rider will come to you after them.`,
    banner: ahead === 1 ? 'Your rider is completing another delivery nearby' : `Your rider has ${ahead} deliveries before yours`,
    startsIn,
  };
}
