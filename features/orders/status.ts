import type { OrderStatus } from '@/lib/api/types';

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

// The tracker shows three steps: rider heading to the station, filling, on the way to the customer.
export function stepStates(status: OrderStatus): [StepState, StepState, StepState] {
  switch (status) {
    case 'rider_assigned':
    case 'picked_up':
      return ['active', 'pending', 'pending'];
    case 'filling':
      return ['completed', 'active', 'pending'];
    case 'en_route_to_customer':
      return ['completed', 'completed', 'active'];
    case 'delivered':
      return ['completed', 'completed', 'completed'];
    default:
      return ['pending', 'pending', 'pending'];
  }
}

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
